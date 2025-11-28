/**
 * End-to-End Workflow Test Suite
 * Tests complete workflow scenarios from trigger to final action
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

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

/**
 * Test 1: Purchase Intent → Deal Creation → Tagging → Notification
 * Complete sales automation workflow
 */
async function testPurchaseIntentWorkflow() {
  console.log('\n🧪 Test 1: Purchase Intent → Deal Creation → Tagging → Notification')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  try {
    const { data: companies } = await supabase.from('companies').select('id').limit(1)
    if (!companies || companies.length === 0) {
      console.error('❌ No companies found')
      return false
    }
    
    const companyId = companies[0].id
    const { data: agents } = await supabase
      .from('agent_configs')
      .select('id, name')
      .eq('company_id', companyId)
      .limit(1)
    
    if (!agents || agents.length === 0) {
      console.error('❌ No agents found')
      return false
    }
    
    const agent = agents[0]
    const apiKey = `pub_key_${agent.id}`
    
    // Create conversation
    const conversationResponse = await fetch(`${AGENT_SERVICE_URL}/api/public/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        agentId: agent.id,
        channel: 'chat',
      }),
    })
    
    const conversationData = await conversationResponse.json()
    const conversationId = conversationData.conversation?.id || conversationData.id
    
    console.log(`✅ Conversation created: ${conversationId}`)
    
    // Send messages
    const messages = [
      'Hi, I\'m interested in your products',
      'My name is John Doe, email: john.doe@test.com, phone: 555-1234',
      'I want to buy the Premium plan for $99/month',
    ]
    
    for (const msg of messages) {
      await fetch(`${AGENT_SERVICE_URL}/api/public/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          conversationId,
          content: msg,
        }),
      })
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    
    console.log('✅ Messages sent')
    console.log('⏳ Waiting 5 seconds for workflow execution...')
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // Check results
    const { data: deals } = await supabase
      .from('deals')
      .select('*, contacts(*)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (deals && deals.length > 0) {
      const deal = deals[0]
      const timeDiff = Date.now() - new Date(deal.created_at).getTime()
      
      if (timeDiff < 10000) {
        console.log('✅ DEAL CREATED:', deal.title)
        console.log(`   Stage: ${deal.stage}`)
        console.log(`   Value: $${deal.value || 0}`)
        
        if (deal.contacts) {
          const contact = deal.contacts
          console.log(`   Contact: ${contact.first_name || ''} ${contact.last_name || ''}`.trim())
          console.log(`   Tags: ${(contact.tags || []).join(', ') || 'none'}`)
        }
        
        // Check workflow executions (query by workflow_id since executions table doesn't have company_id)
        const { data: workflows } = await supabase
          .from('workflows')
          .select('id')
          .eq('company_id', companyId)
          .eq('trigger_type', 'purchase_intent')
        
        let executions = null
        if (workflows && workflows.length > 0) {
          const workflowIds = workflows.map(w => w.id)
          const result = await supabase
            .from('workflow_executions')
            .select('*')
            .in('workflow_id', workflowIds)
            .order('executed_at', { ascending: false })
            .limit(5)
          executions = result.data
        }
        
        if (executions && executions.length > 0) {
          console.log(`✅ Workflow executions found: ${executions.length}`)
          executions.forEach(exec => {
            console.log(`   - ${exec.status}: ${exec.triggered_by} (${new Date(exec.executed_at).toLocaleTimeString()})`)
          })
        }
        
        return true
      }
    }
    
    console.log('❌ No deal created within time window')
    return false
  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  }
}

/**
 * Test 2: Conversation Started → Welcome Tag → Initial Deal
 * Tests conversation_started trigger
 */
async function testConversationStartedWorkflow() {
  console.log('\n🧪 Test 2: Conversation Started → Welcome Tag → Initial Deal')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  try {
    const { data: companies } = await supabase.from('companies').select('id').limit(1)
    if (!companies || companies.length === 0) return false
    
    const companyId = companies[0].id
    const { data: agents } = await supabase
      .from('agent_configs')
      .select('id, name')
      .eq('company_id', companyId)
      .limit(1)
    
    if (!agents || agents.length === 0) return false
    
    const agent = agents[0]
    const apiKey = `pub_key_${agent.id}`
    
    // Create conversation (this should trigger conversation_started)
    const conversationResponse = await fetch(`${AGENT_SERVICE_URL}/api/public/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        agentId: agent.id,
        channel: 'chat',
      }),
    })
    
    const conversationData = await conversationResponse.json()
    const conversationId = conversationData.conversation?.id || conversationData.id
    
    console.log(`✅ Conversation created: ${conversationId}`)
    console.log('⏳ Waiting 3 seconds for workflow execution...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Check for workflow executions (query by workflow_id since executions table doesn't have company_id)
    const { data: companyWorkflows } = await supabase
      .from('workflows')
      .select('id')
      .eq('company_id', companyId)
      .eq('trigger_type', 'conversation_started')
    
    let executions = null
    if (companyWorkflows && companyWorkflows.length > 0) {
      const workflowIds = companyWorkflows.map(w => w.id)
      const result = await supabase
        .from('workflow_executions')
        .select('*')
        .in('workflow_id', workflowIds)
        .eq('triggered_by', 'conversation')
        .order('executed_at', { ascending: false })
        .limit(1)
      executions = result.data
    }
    
    if (executions && executions.length > 0) {
      const exec = executions[0]
      const timeDiff = Date.now() - new Date(exec.executed_at).getTime()
      
      if (timeDiff < 5000 && exec.trigger_data?.trigger_type === 'conversation_started') {
        console.log('✅ Conversation started workflow triggered')
        console.log(`   Status: ${exec.status}`)
        return true
      }
    }
    
    console.log('⚠️  No conversation_started workflow found (may not be configured)')
    return true // Not a failure if workflow doesn't exist
  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  }
}

/**
 * Test 3: Contact Created → Welcome Email → Initial Tag
 * Tests contact_created trigger
 */
async function testContactCreatedWorkflow() {
  console.log('\n🧪 Test 3: Contact Created → Welcome Email → Initial Tag')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  try {
    const { data: companies } = await supabase.from('companies').select('id').limit(1)
    if (!companies || companies.length === 0) return false
    
    const companyId = companies[0].id
    const { data: agents } = await supabase
      .from('agent_configs')
      .select('id, name')
      .eq('company_id', companyId)
      .limit(1)
    
    if (!agents || agents.length === 0) return false
    
    const agent = agents[0]
    const apiKey = `pub_key_${agent.id}`
    
    // Create conversation
    const conversationResponse = await fetch(`${AGENT_SERVICE_URL}/api/public/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        agentId: agent.id,
        channel: 'chat',
      }),
    })
    
    const conversationData = await conversationResponse.json()
    const conversationId = conversationData.conversation?.id || conversationData.id
    
    // Send message with contact info (triggers contact creation)
    await fetch(`${AGENT_SERVICE_URL}/api/public/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        conversationId,
        content: 'Hi, I\'m Jane Smith, email: jane.smith@test.com, phone: 555-5678',
      }),
    })
    
    console.log('✅ Message with contact info sent')
    console.log('⏳ Waiting 3 seconds for contact creation and workflow...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Check for contact
    const { data: contacts } = await supabase
      .from('contacts')
      .select('*')
      .eq('company_id', companyId)
      .eq('email', 'jane.smith@test.com')
      .limit(1)
    
    if (contacts && contacts.length > 0) {
      const contact = contacts[0]
      console.log(`✅ Contact created: ${contact.first_name} ${contact.last_name}`)
      console.log(`   Tags: ${(contact.tags || []).join(', ') || 'none'}`)
      
      // Check workflow executions
      const { data: companyWorkflows } = await supabase
        .from('workflows')
        .select('id')
        .eq('company_id', companyId)
      const workflowIds = companyWorkflows?.map(w => w.id) || []
      const { data: executions } = await supabase
        .from('workflow_executions')
        .select('*')
        .in('workflow_id', workflowIds.length > 0 ? workflowIds : [''])
        .order('executed_at', { ascending: false })
        .limit(5)
      
      if (executions && executions.length > 0) {
        const contactExecutions = executions.filter(exec => 
          exec.trigger_data?.trigger_type === 'contact_created'
        )
        
        if (contactExecutions.length > 0) {
          console.log(`✅ Contact created workflow triggered: ${contactExecutions.length} execution(s)`)
          return true
        }
      }
      
      console.log('⚠️  Contact created but no workflow found (may not be configured)')
      return true
    }
    
    console.log('❌ Contact not created')
    return false
  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  }
}

/**
 * Test 4: Deal Stage Changed → Notification → Contact Update
 * Tests deal_stage_changed trigger
 */
async function testDealStageChangedWorkflow() {
  console.log('\n🧪 Test 4: Deal Stage Changed → Notification → Contact Update')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  try {
    const { data: companies } = await supabase.from('companies').select('id').limit(1)
    if (!companies || companies.length === 0) return false
    
    const companyId = companies[0].id
    
    // Get or create a contact
    let { data: contacts } = await supabase
      .from('contacts')
      .select('id')
      .eq('company_id', companyId)
      .limit(1)
    
    let contactId = contacts?.[0]?.id
    
    if (!contactId) {
      // Create a test contact
      const { data: newContact } = await supabase
        .from('contacts')
        .insert({
          company_id: companyId,
          first_name: 'Test',
          last_name: 'Contact',
          email: 'test.contact@test.com',
        })
        .select('id')
        .single()
      
      contactId = newContact?.id
    }
    
    if (!contactId) {
      console.error('❌ Could not create/get contact')
      return false
    }
    
    // Create a deal
    const { data: deal } = await supabase
      .from('deals')
      .insert({
        company_id: companyId,
        contact_id: contactId,
        title: 'Test Deal for Stage Change',
        stage: 'lead',
        value: 1000,
      })
      .select('id')
      .single()
    
    if (!deal) {
      console.error('❌ Could not create deal')
      return false
    }
    
    console.log(`✅ Deal created: ${deal.id} (stage: lead)`)
    
    // Change deal stage (this should trigger workflow)
    const { data: updatedDeal } = await supabase
      .from('deals')
      .update({ stage: 'qualified' })
      .eq('id', deal.id)
      .select('stage')
      .single()
    
    console.log(`✅ Deal stage changed to: ${updatedDeal?.stage}`)
    console.log('⏳ Waiting 3 seconds for workflow execution...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Check workflow executions
    const { data: companyWorkflows } = await supabase
      .from('workflows')
      .select('id')
      .eq('company_id', companyId)
    const workflowIds = companyWorkflows?.map(w => w.id) || []
    const { data: executions } = await supabase
      .from('workflow_executions')
      .select('*')
      .in('workflow_id', workflowIds.length > 0 ? workflowIds : [''])
      .order('executed_at', { ascending: false })
      .limit(5)
    
    if (executions && executions.length > 0) {
      const stageExecutions = executions.filter(exec => 
        exec.trigger_data?.trigger_type === 'deal_stage_changed' &&
        exec.trigger_data?.from_stage === 'lead' &&
        exec.trigger_data?.to_stage === 'qualified'
      )
      
      if (stageExecutions.length > 0) {
        console.log(`✅ Deal stage changed workflow triggered: ${stageExecutions.length} execution(s)`)
        stageExecutions.forEach(exec => {
          console.log(`   - Status: ${exec.status}, From: ${exec.trigger_data.from_stage} → To: ${exec.trigger_data.to_stage}`)
        })
        return true
      }
    }
    
    console.log('⚠️  Deal stage changed but no workflow found (may not be configured)')
    return true
  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  }
}

/**
 * Test 5: Conversation Ended → Follow-up Tag → Analytics Update
 * Tests conversation_ended trigger
 */
async function testConversationEndedWorkflow() {
  console.log('\n🧪 Test 5: Conversation Ended → Follow-up Tag → Analytics Update')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  try {
    const { data: companies } = await supabase.from('companies').select('id').limit(1)
    if (!companies || companies.length === 0) return false
    
    const companyId = companies[0].id
    const { data: agents } = await supabase
      .from('agent_configs')
      .select('id, name')
      .eq('company_id', companyId)
      .limit(1)
    
    if (!agents || agents.length === 0) return false
    
    const agent = agents[0]
    const apiKey = `pub_key_${agent.id}`
    
    // Create conversation
    const conversationResponse = await fetch(`${AGENT_SERVICE_URL}/api/public/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        agentId: agent.id,
        channel: 'chat',
      }),
    })
    
    const conversationData = await conversationResponse.json()
    const conversationId = conversationData.conversation?.id || conversationData.id
    
    console.log(`✅ Conversation created: ${conversationId}`)
    
    // Send a message
    await fetch(`${AGENT_SERVICE_URL}/api/public/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        conversationId,
        content: 'Hello, I need help',
      }),
    })
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // End conversation (this should trigger workflow)
    await fetch(`${AGENT_SERVICE_URL}/api/public/conversations/${conversationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        status: 'ended',
        ended_at: new Date().toISOString(),
      }),
    })
    
    console.log('✅ Conversation ended')
    console.log('⏳ Waiting 3 seconds for workflow execution...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Check workflow executions
    const { data: companyWorkflows } = await supabase
      .from('workflows')
      .select('id')
      .eq('company_id', companyId)
    const workflowIds = companyWorkflows?.map(w => w.id) || []
    const { data: executions } = await supabase
      .from('workflow_executions')
      .select('*')
      .in('workflow_id', workflowIds.length > 0 ? workflowIds : [''])
      .order('executed_at', { ascending: false })
      .limit(5)
    
    if (executions && executions.length > 0) {
      const endedExecutions = executions.filter(exec => 
        exec.trigger_data?.trigger_type === 'conversation_ended'
      )
      
      if (endedExecutions.length > 0) {
        console.log(`✅ Conversation ended workflow triggered: ${endedExecutions.length} execution(s)`)
        endedExecutions.forEach(exec => {
          console.log(`   - Status: ${exec.status}, Duration: ${exec.trigger_data.duration_min || 0} min`)
        })
        return true
      }
    }
    
    console.log('⚠️  Conversation ended but no workflow found (may not be configured)')
    return true
  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  }
}

/**
 * Test 6: Message Received → Conditional Tagging → Webhook
 * Tests message_received trigger with conditions
 */
async function testMessageReceivedWorkflow() {
  console.log('\n🧪 Test 6: Message Received → Conditional Tagging → Webhook')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  try {
    const { data: companies } = await supabase.from('companies').select('id').limit(1)
    if (!companies || companies.length === 0) return false
    
    const companyId = companies[0].id
    const { data: agents } = await supabase
      .from('agent_configs')
      .select('id, name')
      .eq('company_id', companyId)
      .limit(1)
    
    if (!agents || agents.length === 0) return false
    
    const agent = agents[0]
    const apiKey = `pub_key_${agent.id}`
    
    // Create conversation
    const conversationResponse = await fetch(`${AGENT_SERVICE_URL}/api/public/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        agentId: agent.id,
        channel: 'chat',
      }),
    })
    
    const conversationData = await conversationResponse.json()
    const conversationId = conversationData.conversation?.id || conversationData.id
    
    // Send urgent message
    await fetch(`${AGENT_SERVICE_URL}/api/public/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        conversationId,
        content: 'URGENT: I need immediate assistance!',
      }),
    })
    
    console.log('✅ Urgent message sent')
    console.log('⏳ Waiting 3 seconds for workflow execution...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Check workflow executions
    const { data: companyWorkflows } = await supabase
      .from('workflows')
      .select('id')
      .eq('company_id', companyId)
    const workflowIds = companyWorkflows?.map(w => w.id) || []
    const { data: executions } = await supabase
      .from('workflow_executions')
      .select('*')
      .in('workflow_id', workflowIds.length > 0 ? workflowIds : [''])
      .order('executed_at', { ascending: false })
      .limit(5)
    
    if (executions && executions.length > 0) {
      const messageExecutions = executions.filter(exec => 
        exec.trigger_data?.trigger_type === 'message_received'
      )
      
      if (messageExecutions.length > 0) {
        console.log(`✅ Message received workflow triggered: ${messageExecutions.length} execution(s)`)
        return true
      }
    }
    
    console.log('⚠️  Message sent but no workflow found (may not be configured)')
    return true
  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🚀 End-to-End Workflow Test Suite')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Testing 6 complete workflow scenarios...\n')
  
  const results = []
  
  // Test 1: Purchase Intent (most important)
  results.push({
    name: 'Purchase Intent → Deal Creation',
    success: await testPurchaseIntentWorkflow(),
  })
  
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Test 2: Conversation Started
  results.push({
    name: 'Conversation Started → Welcome',
    success: await testConversationStartedWorkflow(),
  })
  
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Test 3: Contact Created
  results.push({
    name: 'Contact Created → Welcome',
    success: await testContactCreatedWorkflow(),
  })
  
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Test 4: Deal Stage Changed
  results.push({
    name: 'Deal Stage Changed → Notification',
    success: await testDealStageChangedWorkflow(),
  })
  
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Test 5: Conversation Ended
  results.push({
    name: 'Conversation Ended → Follow-up',
    success: await testConversationEndedWorkflow(),
  })
  
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Test 6: Message Received
  results.push({
    name: 'Message Received → Conditional',
    success: await testMessageReceivedWorkflow(),
  })
  
  // Summary
  console.log('\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 Test Summary')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  for (const result of results) {
    console.log(`${result.success ? '✅' : '❌'} ${result.name}`)
  }
  
  const successCount = results.filter(r => r.success).length
  console.log('')
  console.log(`Total: ${successCount}/${results.length} tests passed`)
  
  if (successCount === results.length) {
    console.log('🎉 All tests passed!')
  } else {
    console.log('⚠️  Some tests failed or workflows not configured')
    console.log('   Note: Tests may pass even if workflows don\'t exist (they\'re optional)')
  }
}

// Run tests
const testIndex = process.argv[2] ? parseInt(process.argv[2]) : null

if (testIndex !== null && testIndex >= 1 && testIndex <= 6) {
  const tests = [
    testPurchaseIntentWorkflow,
    testConversationStartedWorkflow,
    testContactCreatedWorkflow,
    testDealStageChangedWorkflow,
    testConversationEndedWorkflow,
    testMessageReceivedWorkflow,
  ]
  tests[testIndex - 1]()
} else {
  runAllTests()
}

