/**
 * Test purchase intent workflow through widget flow
 * Simulates a real user sending a message through the widget
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:4002'
const CHAT_SERVICE_URL = process.env.CHAT_SERVICE_URL || 'http://localhost:4004'

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

async function testWidgetFlow() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  
  console.log('🧪 Testing Widget Purchase Intent Flow')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  try {
    // 1. Get company and agent
    console.log('📋 Step 1: Getting company and agent...')
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
    
    const { data: agents } = await supabase
      .from('agent_configs')
      .select('id, api_key')
      .eq('company_id', companyId)
      .limit(1)
    
    if (!agents || agents.length === 0) {
      console.error('❌ No agents found')
      return
    }
    
    const agent = agents[0]
    console.log(`✅ Agent ID: ${agent.id}`)
    console.log('')
    
    // 2. Create a conversation (simulating widget)
    console.log('📋 Step 2: Creating conversation via widget API...')
    const conversationResponse = await fetch(`${AGENT_SERVICE_URL}/api/public/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': agent.api_key,
      },
      body: JSON.stringify({
        agent_id: agent.id,
        channel: 'widget',
      }),
    })
    
    if (!conversationResponse.ok) {
      const error = await conversationResponse.text()
      console.error('❌ Failed to create conversation:', error)
      return
    }
    
    const { conversation } = await conversationResponse.json()
    const conversationId = conversation.id
    console.log(`✅ Conversation created: ${conversationId}`)
    console.log('')
    
    // 3. Send a message with contact info first
    console.log('📋 Step 3: Sending message with contact info...')
    const contactMessageResponse = await fetch(`${AGENT_SERVICE_URL}/api/public/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': agent.api_key,
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        content: 'My name is John Doe, email is john.doe@example.com, phone is 555-1234',
      }),
    })
    
    if (!contactMessageResponse.ok) {
      const error = await contactMessageResponse.text()
      console.error('❌ Failed to send contact message:', error)
      return
    }
    
    console.log('✅ Contact info message sent')
    console.log('   (Waiting 2 seconds for contact extraction...)')
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('')
    
    // 4. Send purchase intent message
    console.log('📋 Step 4: Sending purchase intent message...')
    const purchaseMessageResponse = await fetch(`${AGENT_SERVICE_URL}/api/public/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': agent.api_key,
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        content: "I'm ready to purchase the smartphone XLS at 450€",
      }),
    })
    
    if (!purchaseMessageResponse.ok) {
      const error = await purchaseMessageResponse.text()
      console.error('❌ Failed to send purchase message:', error)
      return
    }
    
    console.log('✅ Purchase intent message sent')
    console.log('   (Waiting 3 seconds for workflow execution...)')
    await new Promise(resolve => setTimeout(resolve, 3000))
    console.log('')
    
    // 5. Check if deal was created
    console.log('📋 Step 5: Checking if deal was created...')
    const { data: deals } = await supabase
      .from('deals')
      .select('*, contacts(*)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (deals && deals.length > 0) {
      const deal = deals[0]
      const createdTime = new Date(deal.created_at).getTime()
      const now = Date.now()
      const timeDiff = now - createdTime
      
      // Check if deal was created in the last 10 seconds
      if (timeDiff < 10000) {
        console.log('✅ DEAL CREATED SUCCESSFULLY!')
        console.log(`   Deal ID: ${deal.id}`)
        console.log(`   Title: ${deal.title}`)
        console.log(`   Stage: ${deal.stage}`)
        if (deal.contacts) {
          console.log(`   Contact: ${deal.contacts.first_name || ''} ${deal.contacts.last_name || ''} (${deal.contacts.email || 'no email'})`)
        }
        console.log('')
      } else {
        console.log('⚠️  Deal found but was created earlier (not from this test)')
        console.log(`   Created: ${new Date(deal.created_at).toLocaleString()}`)
        console.log('')
      }
    } else {
      console.log('❌ No deal found')
      console.log('')
    }
    
    // 6. Check workflow execution
    console.log('📋 Step 6: Checking workflow execution history...')
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
          }
          console.log('')
        } else {
          console.log('⚠️  Execution found but was from earlier')
        }
      }
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ Test completed!')
    console.log('')
    console.log('📊 Check the results above to verify:')
    console.log('   1. Conversation was created')
    console.log('   2. Contact info was extracted')
    console.log('   3. Purchase intent was detected')
    console.log('   4. Workflow was triggered')
    console.log('   5. Deal was created')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.stack) {
      console.error('Stack:', error.stack)
    }
    process.exit(1)
  }
}

testWidgetFlow()




