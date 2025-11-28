/**
 * Test purchase intent workflow through widget flow
 * Simulates a real user sending a message through the widget
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:4002'

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

async function testWidgetFlow() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  
  console.log('🧪 Testing Widget Purchase Intent Flow')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  try {
    // 1. Get company
    console.log('📋 Step 1: Getting company...')
    const { data: companies } = await supabase
      .from('companies')
      .select('id')
      .limit(1)
    
    if (!companies || companies.length === 0) {
      console.error('❌ No companies found')
      return
    }
    
    const companyId = companies[0].id
    console.log(`✅ Company ID: ${companyId}`)
    
    // 2. Get or create an agent
    console.log('📋 Step 2: Getting or creating agent...')
    let { data: agents } = await supabase
      .from('agent_configs')
      .select('id, name')
      .eq('company_id', companyId)
      .limit(1)
    
    let agent
    if (!agents || agents.length === 0) {
      console.log('   No agent found, creating one...')
      // Create a test agent
      const { data: newAgent, error: createError } = await supabase
        .from('agent_configs')
        .insert({
          company_id: companyId,
          name: 'Test Agent for Widget',
          system_prompt: 'You are a helpful assistant.',
          model: 'gpt-4o-mini',
          temperature: 0.7,
          enabled: true,
        })
        .select('id, name')
        .single()
      
      if (createError || !newAgent) {
        console.error('❌ Failed to create agent:', createError)
        return
      }
      
      agent = newAgent
      console.log(`✅ Created agent: ${agent.name} (${agent.id})`)
    } else {
      agent = agents[0]
      console.log(`✅ Using existing agent: ${agent.name} (${agent.id})`)
    }
    
    // API key is generated from agent ID: pub_key_{agentId}
    const apiKey = `pub_key_${agent.id}`
    console.log(`✅ API Key: ${apiKey.substring(0, 20)}...`)
    
    console.log('')
    
    // 3. Create a conversation (simulating widget)
    console.log('📋 Step 3: Creating conversation via widget API...')
    // For /api/public/conversations, agentId needs to be in the URL or the middleware needs to extract it from body
    // Let's use X-API-Key header instead (which some routes might support)
    const conversationResponse = await fetch(`${AGENT_SERVICE_URL}/api/public/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-API-Key': apiKey, // Also try X-API-Key header
      },
      body: JSON.stringify({
        agentId: agent.id,
        channel: 'chat', // Widget uses 'chat' channel
      }),
    })
    
    if (!conversationResponse.ok) {
      const error = await conversationResponse.text()
      console.error('❌ Failed to create conversation:', error)
      return
    }
    
    const conversationData = await conversationResponse.json()
    // Conversation ID can be in conversation.id or conversation._id (MongoDB)
    const conversationId = conversationData.conversation?.id || 
                          conversationData.conversation?._id || 
                          conversationData.id || 
                          conversationData._id
    console.log(`✅ Conversation created: ${conversationId}`)
    console.log('')
    
    // 4. Send a message with contact info first
    console.log('📋 Step 4: Sending message with contact info...')
    const contactMessageResponse = await fetch(`${AGENT_SERVICE_URL}/api/public/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        conversationId: conversationId, // Use camelCase
        content: 'My name is John Doe, email is john.doe@example.com, phone is 555-1234',
      }),
    })
    
    if (!contactMessageResponse.ok) {
      const error = await contactMessageResponse.text()
      console.error('❌ Failed to send contact message:', error)
      return
    }
    
    console.log('✅ Contact info message sent')
    console.log('   (Waiting 3 seconds for contact extraction and agent response...)')
    await new Promise(resolve => setTimeout(resolve, 3000))
    console.log('')
    
    // 5. Send purchase intent message
    console.log('📋 Step 5: Sending purchase intent message...')
    const purchaseMessageResponse = await fetch(`${AGENT_SERVICE_URL}/api/public/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        conversationId: conversationId, // Use camelCase
        content: "I'm ready to purchase the smartphone XLS at 450€",
      }),
    })
    
    if (!purchaseMessageResponse.ok) {
      const error = await purchaseMessageResponse.text()
      console.error('❌ Failed to send purchase message:', error)
      return
    }
    
    console.log('✅ Purchase intent message sent')
    console.log('   (Waiting 5 seconds for intent detection, workflow execution, and deal creation...)')
    await new Promise(resolve => setTimeout(resolve, 5000))
    console.log('')
    
    // 6. Check if deal was created
    console.log('📋 Step 6: Checking if deal was created...')
    const { data: deals } = await supabase
      .from('deals')
      .select('*, contacts(*)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (deals && deals.length > 0) {
      // Find the most recent deal created in the last 10 seconds
      const recentDeal = deals.find(deal => {
        const createdTime = new Date(deal.created_at).getTime()
        const now = Date.now()
        return (now - createdTime) < 10000
      })
      
      if (recentDeal) {
        console.log('✅ DEAL CREATED SUCCESSFULLY!')
        console.log(`   Deal ID: ${recentDeal.id}`)
        console.log(`   Title: ${recentDeal.title}`)
        console.log(`   Stage: ${recentDeal.stage}`)
        if (recentDeal.value) {
          console.log(`   Value: €${recentDeal.value}`)
        }
        if (recentDeal.contacts) {
          console.log(`   Contact: ${recentDeal.contacts.first_name || ''} ${recentDeal.contacts.last_name || ''} (${recentDeal.contacts.email || 'no email'})`)
        }
        console.log(`   Created: ${new Date(recentDeal.created_at).toLocaleString()}`)
        console.log('')
      } else {
        console.log('⚠️  Deals found but none created in the last 10 seconds')
        console.log(`   Most recent deal: ${deals[0].title} (${new Date(deals[0].created_at).toLocaleString()})`)
        console.log('')
      }
    } else {
      console.log('❌ No deals found')
      console.log('')
    }
    
    // 7. Check workflow execution
    console.log('📋 Step 7: Checking workflow execution history...')
    const { data: workflows } = await supabase
      .from('workflows')
      .select('id, name')
      .eq('company_id', companyId)
      .eq('trigger_type', 'purchase_intent')
      .eq('enabled', true)
      .limit(1)
    
    if (workflows && workflows.length > 0) {
      const workflowId = workflows[0].id
      const { data: executions } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('executed_at', { ascending: false })
        .limit(1)
      
      if (executions && executions.length > 0) {
        const exec = executions[0]
        const execTime = new Date(exec.executed_at).getTime()
        const now = Date.now()
        const timeDiff = now - execTime
        
        if (timeDiff < 10000) {
          console.log('✅ WORKFLOW EXECUTED!')
          console.log(`   Status: ${exec.status}`)
          console.log(`   Duration: ${exec.execution_time_ms}ms`)
          if (exec.error_message) {
            console.log(`   ❌ Error: ${exec.error_message}`)
          } else {
            console.log('   ✅ No errors')
          }
          console.log('')
        } else {
          console.log('⚠️  Execution found but was from earlier')
          console.log(`   Executed: ${new Date(exec.executed_at).toLocaleString()}`)
          console.log('')
        }
      } else {
        console.log('⚠️  No workflow executions found')
        console.log('')
      }
    } else {
      console.log('⚠️  No purchase_intent workflows found')
      console.log('   Create a workflow with purchase_intent trigger first')
      console.log('')
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ Test completed!')
    console.log('')
    console.log('📊 Summary:')
    console.log('   - Conversation created via widget API')
    console.log('   - Contact info message sent')
    console.log('   - Purchase intent message sent')
    console.log('   - Check results above for deal creation and workflow execution')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.stack) {
      console.error('Stack:', error.stack)
    }
    process.exit(1)
  }
}

testWidgetFlow()

