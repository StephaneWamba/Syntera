/**
 * Test script to manually trigger a workflow
 * Usage: node test-workflow.js <company-id> [trigger-type] [contact-id]
 * 
 * Examples:
 * node test-workflow.js "your-company-id"
 * node test-workflow.js "your-company-id" "purchase_intent"
 * node test-workflow.js "your-company-id" "purchase_intent" "contact-id-here"
 */

const COMPANY_ID = process.argv[2]
const TRIGGER_TYPE = process.argv[3] || 'purchase_intent'
const CONTACT_ID = process.argv[4] || null

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:4002'
const INTERNAL_TOKEN = process.env.INTERNAL_SERVICE_TOKEN || 'internal-token'

if (!COMPANY_ID) {
  console.error('❌ Usage: node test-workflow.js <company-id> [trigger-type] [contact-id]')
  console.error('')
  console.error('Examples:')
  console.error('  node test-workflow.js "your-company-id"')
  console.error('  node test-workflow.js "your-company-id" "purchase_intent"')
  console.error('  node test-workflow.js "your-company-id" "purchase_intent" "contact-id-here"')
  console.error('')
  console.error('Available trigger types:')
  console.error('  - purchase_intent')
  console.error('  - conversation_started')
  console.error('  - conversation_ended')
  console.error('  - contact_created')
  console.error('  - contact_updated')
  console.error('  - deal_created')
  console.error('  - deal_stage_changed')
  console.error('  - message_received')
  process.exit(1)
}

// Test data based on trigger type
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

const testTriggerData = {
  trigger_type: TRIGGER_TYPE,
  trigger_data: getTestTriggerData(TRIGGER_TYPE, COMPANY_ID, CONTACT_ID),
  company_id: COMPANY_ID,
}

async function testWorkflow() {
  console.log('🧪 Testing Workflow Trigger')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Trigger Type: ${TRIGGER_TYPE}`)
  console.log(`Company ID: ${COMPANY_ID}`)
  console.log(`Contact ID: ${CONTACT_ID || 'none (will fail if workflow needs it)'}`)
  console.log(`Agent Service: ${AGENT_SERVICE_URL}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
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

