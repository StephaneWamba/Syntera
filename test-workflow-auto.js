/**
 * Auto-test workflow script
 * Fetches company ID from database and tests workflow
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:4002'
const INTERNAL_TOKEN = process.env.INTERNAL_SERVICE_TOKEN || 'internal-token'
const TRIGGER_TYPE = process.argv[2] || 'purchase_intent'

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment')
  process.exit(1)
}

async function getCompanyId() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  
  const { data: companies, error } = await supabase
    .from('companies')
    .select('id')
    .limit(1)
  
  if (error || !companies || companies.length === 0) {
    console.error('❌ No companies found in database')
    console.error('   Please create a company by signing up first')
    process.exit(1)
  }
  
  return companies[0].id
}

async function getContactId(companyId) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  
  const { data: contacts, error } = await supabase
    .from('contacts')
    .select('id')
    .eq('company_id', companyId)
    .limit(1)
  
  if (error || !contacts || contacts.length === 0) {
    return null
  }
  
  return contacts[0].id
}

const getTestTriggerData = (triggerType, companyId, contactId) => {
  const baseData = {
    triggered_by: 'test',
    triggered_by_id: 'test-' + Date.now(),
    conversationId: 'test-conversation-' + Date.now(),
    agentId: 'test-agent-id',
    companyId: companyId,
  }

  switch (triggerType) {
    case 'purchase_intent':
      return {
        ...baseData,
        intent: 'purchase',
        confidence: 0.9,
        message: 'I want to buy the smartphone XLS at 450€',
        contactId: contactId,
      }
    case 'conversation_started':
      return {
        ...baseData,
        channel: 'chat',
        source: 'widget',
        contactId: contactId,
      }
    case 'conversation_ended':
      return {
        ...baseData,
        channel: 'chat',
        duration_min: 5,
        contactId: contactId,
      }
    case 'contact_created':
      return {
        ...baseData,
        contactId: contactId || 'test-contact-id',
      }
    case 'contact_updated':
      return {
        ...baseData,
        contactId: contactId || 'test-contact-id',
        fields_changed: ['email', 'phone'],
      }
    case 'deal_created':
      return {
        ...baseData,
        dealId: 'test-deal-id',
        contactId: contactId,
        stage: 'lead',
        value: 450,
      }
    case 'deal_stage_changed':
      return {
        ...baseData,
        dealId: 'test-deal-id',
        contactId: contactId,
        from_stage: 'lead',
        to_stage: 'proposal',
      }
    case 'message_received':
      return {
        ...baseData,
        message: 'Hello, I need help',
        channel: 'chat',
        contactId: contactId,
      }
    default:
      return baseData
  }
}

async function testWorkflow() {
  console.log('🧪 Auto-Testing Workflow')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  try {
    // Get company ID
    console.log('📋 Fetching company ID from database...')
    const companyId = await getCompanyId()
    console.log(`✅ Found company: ${companyId}`)
    
    // Try to get contact ID
    console.log('📋 Looking for contact ID...')
    const contactId = await getContactId(companyId)
    if (contactId) {
      console.log(`✅ Found contact: ${contactId}`)
    } else {
      console.log('⚠️  No contact found (workflow may fail if it needs contactId)')
    }
    
    console.log(`📋 Trigger Type: ${TRIGGER_TYPE}`)
    console.log(`📋 Agent Service: ${AGENT_SERVICE_URL}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    const testTriggerData = {
      trigger_type: TRIGGER_TYPE,
      trigger_data: getTestTriggerData(TRIGGER_TYPE, companyId, contactId),
      company_id: companyId,
    }
    
    console.log('📤 Sending trigger request...')
    console.log('Trigger Data:', JSON.stringify(testTriggerData, null, 2))
    console.log('')
    
    const response = await fetch(`${AGENT_SERVICE_URL}/api/internal/workflows/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${INTERNAL_TOKEN}`,
      },
      body: JSON.stringify(testTriggerData),
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      console.error('❌ Request failed:')
      console.error('Status:', response.status)
      console.error('Error:', result)
      process.exit(1)
    }
    
    console.log('✅ Trigger sent successfully!')
    console.log('Response:', result)
    console.log('')
    console.log('📊 Next steps:')
    console.log('   1. Go to /dashboard/workflows')
    console.log('   2. Find your workflow (trigger: ' + TRIGGER_TYPE + ')')
    console.log('   3. Click "View History" to see execution logs')
    console.log('')
    console.log('📝 Also check Agent Service terminal for detailed logs')
    console.log('   Look for: "agent-service:workflow-executor"')
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.stack) {
      console.error('Stack:', error.stack)
    }
    process.exit(1)
  }
}

testWorkflow()




