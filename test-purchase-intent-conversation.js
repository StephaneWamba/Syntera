/**
 * Test purchase intent workflow with a realistic conversation sequence
 * Simulates a real customer interaction through the widget
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

// Conversation sequences to test
const conversationSequences = [
  {
    name: 'E-commerce Product Purchase',
    messages: [
      {
        content: 'Hi, I\'m interested in your products',
        wait: 2000,
      },
      {
        content: 'My name is Sarah Johnson and my email is sarah.johnson@email.com',
        wait: 3000,
      },
      {
        content: 'What smartphones do you have available?',
        wait: 3000,
      },
      {
        content: 'I want to buy the iPhone 15 Pro Max for $1,199',
        wait: 5000, // Wait longer for purchase intent detection
      },
    ],
  },
  {
    name: 'Service Subscription',
    messages: [
      {
        content: 'Hello, I need help with your services',
        wait: 2000,
      },
      {
        content: 'I\'m Michael Chen, you can reach me at michael.chen@company.com or call me at 555-9876',
        wait: 3000,
      },
      {
        content: 'What subscription plans do you offer?',
        wait: 3000,
      },
      {
        content: 'I\'m ready to purchase the Premium plan at $99/month',
        wait: 5000,
      },
    ],
  },
  {
    name: 'B2B Software Purchase',
    messages: [
      {
        content: 'Good morning, I\'m looking for enterprise software solutions',
        wait: 2000,
      },
      {
        content: 'My name is David Williams from TechCorp. Email: david.williams@techcorp.com, Phone: 555-4567',
        wait: 3000,
      },
      {
        content: 'Can you tell me about your enterprise package pricing?',
        wait: 3000,
      },
      {
        content: 'We want to purchase the Enterprise license for $5,000 annually',
        wait: 5000,
      },
    ],
  },
]

async function testConversation(sequence) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  
  console.log(`\n🧪 Testing: ${sequence.name}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  try {
    // 1. Get company and agent
    const { data: companies } = await supabase
      .from('companies')
      .select('id')
      .limit(1)
    
    if (!companies || companies.length === 0) {
      console.error('❌ No companies found')
      return
    }
    
    const companyId = companies[0].id
    
    let { data: agents } = await supabase
      .from('agent_configs')
      .select('id, name')
      .eq('company_id', companyId)
      .limit(1)
    
    if (!agents || agents.length === 0) {
      console.error('❌ No agents found')
      return
    }
    
    const agent = agents[0]
    const apiKey = `pub_key_${agent.id}`
    
    console.log(`✅ Using agent: ${agent.name}`)
    console.log('')
    
    // 2. Create conversation
    console.log('📋 Creating conversation...')
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
    
    if (!conversationResponse.ok) {
      const error = await conversationResponse.text()
      console.error('❌ Failed to create conversation:', error)
      return
    }
    
    const conversationData = await conversationResponse.json()
    const conversationId = conversationData.conversation?.id || conversationData.id
    console.log(`✅ Conversation created: ${conversationId}`)
    console.log('')
    
    // 3. Send messages in sequence
    console.log('📋 Sending conversation messages...')
    for (let i = 0; i < sequence.messages.length; i++) {
      const msg = sequence.messages[i]
      console.log(`   Message ${i + 1}: "${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}"`)
      
      const messageResponse = await fetch(`${AGENT_SERVICE_URL}/api/public/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          conversationId: conversationId,
          content: msg.content,
        }),
      })
      
      if (!messageResponse.ok) {
        const error = await messageResponse.text()
        console.error(`   ❌ Failed to send message ${i + 1}:`, error)
        continue
      }
      
      console.log(`   ✅ Sent (waiting ${msg.wait}ms...)`)
      await new Promise(resolve => setTimeout(resolve, msg.wait))
    }
    
    console.log('')
    console.log('⏳ Waiting 3 seconds for workflow execution...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    console.log('')
    
    // 4. Check if deal was created
    console.log('📋 Checking for created deal...')
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
      
      if (timeDiff < 15000) { // Last 15 seconds
        console.log('✅ DEAL CREATED!')
        console.log(`   Deal ID: ${deal.id}`)
        console.log(`   Title: ${deal.title}`)
        console.log(`   Stage: ${deal.stage}`)
        if (deal.value) {
          console.log(`   Value: $${deal.value}`)
        }
        if (deal.contacts) {
          const contact = deal.contacts
          console.log(`   Contact: ${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Unknown')
          if (contact.email) console.log(`   Email: ${contact.email}`)
          if (contact.phone) console.log(`   Phone: ${contact.phone}`)
        }
        console.log(`   Created: ${new Date(deal.created_at).toLocaleString()}`)
        return true
      } else {
        console.log('⚠️  Deal found but was created earlier')
        console.log(`   Most recent: ${deal.title} (${new Date(deal.created_at).toLocaleString()})`)
        return false
      }
    } else {
      console.log('❌ No deal found')
      return false
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.stack) {
      console.error('Stack:', error.stack)
    }
    return false
  }
}

async function runAllTests() {
  console.log('🚀 Purchase Intent Workflow Test Suite')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Testing ${conversationSequences.length} conversation sequences...`)
  
  const results = []
  
  for (const sequence of conversationSequences) {
    const success = await testConversation(sequence)
    results.push({ name: sequence.name, success })
    
    // Wait between tests
    if (conversationSequences.indexOf(sequence) < conversationSequences.length - 1) {
      console.log('\n⏸️  Waiting 2 seconds before next test...')
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
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
    console.log('⚠️  Some tests failed. Check the logs above.')
  }
}

// Run a specific test or all tests
const testIndex = process.argv[2] ? parseInt(process.argv[2]) : null

if (testIndex !== null && testIndex >= 0 && testIndex < conversationSequences.length) {
  testConversation(conversationSequences[testIndex])
} else {
  runAllTests()
}




