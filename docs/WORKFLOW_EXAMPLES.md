# Workflow Examples & Guide

## What Worked: Purchase Intent Workflow

The test script (`test-purchase-intent-conversation.js`) demonstrates a **purchase intent workflow** that:

1. **Triggers**: When a customer message shows purchase intent (confidence >= 0.8)
2. **Action**: Automatically creates a deal in the CRM
3. **Test**: Simulates conversations like:
   - "I want to buy the iPhone 15 Pro Max for $1,199"
   - "I'm ready to purchase the Premium plan at $99/month"
   - "We want to purchase the Enterprise license for $5,000 annually"

### How It Works

```javascript
// When purchase intent is detected in services/agent/src/routes/responses.ts:
if (intentResult.intent === 'purchase' && intentResult.confidence >= 0.8) {
  executeWorkflowsForTrigger('purchase_intent', {
    conversationId,
    agentId,
    companyId,
    contactId,
    intent: 'purchase',
    confidence: 0.9,
    message: userMessage,
  }, companyId)
}
```

The workflow then:
1. Finds all enabled workflows with trigger type `purchase_intent`
2. Executes the workflow nodes (conditions → actions)
3. Creates a deal with extracted information (title, value, contact)

---

## Available Workflow Triggers

### ✅ Fully Implemented & Working

1. **`purchase_intent`** ✅
   - **When**: Customer shows buying intent (AI detects with confidence >= 0.8)
   - **Use Cases**: Auto-create deals, tag high-value leads, notify sales team
   - **Trigger Data**: `conversationId`, `contactId`, `intent`, `confidence`, `message`

2. **`conversation_started`** ✅
   - **When**: New conversation begins
   - **Use Cases**: Welcome workflows, initial tagging, data collection
   - **Trigger Data**: `conversationId`, `agentId`, `companyId`, `channel`, `contactId`

3. **`contact_created`** ✅
   - **When**: New contact is created in CRM
   - **Use Cases**: Welcome emails, initial deal creation, tagging
   - **Trigger Data**: `contactId`, `companyId`, `email`, `phone`, `source`

4. **`message_received`** ✅
   - **When**: Any message is received (user or agent)
   - **Use Cases**: Logging, analytics, conditional responses
   - **Trigger Data**: `conversationId`, `messageId`, `message`, `sender_type`

### ⚠️ Partially Implemented

5. **`conversation_ended`** ⚠️
   - **Status**: Type exists, but trigger not fired yet
   - **Use Cases**: Follow-up emails, satisfaction surveys, deal updates

6. **`contact_updated`** ⚠️
   - **Status**: Type exists, but trigger not fired yet
   - **Use Cases**: Re-engagement, deal updates, notification triggers

7. **`deal_created`** ⚠️
   - **Status**: Type exists, but trigger not fired yet
   - **Use Cases**: Notifications, follow-up tasks, pipeline updates

8. **`deal_stage_changed`** ⚠️
   - **Status**: Type exists, but trigger not fired yet
   - **Use Cases**: Stage-specific actions, notifications, reporting

9. **`webhook`** ⚠️
   - **Status**: Type exists, but trigger not fired yet
   - **Use Cases**: External system integration, custom triggers

---

## Available Workflow Actions

### ✅ Fully Implemented

1. **`create_deal`** ✅
   - Creates a new deal in CRM
   - Supports: `title`, `value`, `stage`, `probability`, `expected_close_date`, `contact_id`, `metadata`
   - Variables: `{{contact.name}}`, `{{contact.email}}`, `{{message}}`, etc.

2. **`update_contact`** ✅
   - Updates contact fields and metadata
   - Supports: `contact_id`, `fields`, `add_tags`, `remove_tags`, `metadata`
   - Variables: All contact fields, deal fields, conversation data

3. **`update_deal`** ✅
   - Updates deal fields
   - Supports: `deal_id`, `fields` (title, value, stage, probability, etc.), `metadata`
   - Variables: Deal fields, contact fields

4. **`add_tag`** ✅
   - Adds tags to a contact
   - Supports: `contact_id`, `tags[]`
   - Example: `["high-value", "purchase-intent", "qualified"]`

5. **`send_webhook`** ✅
   - Sends HTTP request to external URL
   - Supports: `url`, `method` (GET/POST/PUT/PATCH/DELETE), `headers`, `body`
   - Variables: All workflow context data

6. **`update_conversation_metadata`** ✅
   - Updates conversation metadata in MongoDB
   - Supports: `conversation_id`, `metadata` (key-value pairs)
   - Use Cases: Custom data storage, integration flags

### ⚠️ Partially Implemented

7. **`send_notification`** ⚠️
   - **Status**: Logs only, no actual notification service yet
   - **Supports**: `to`, `title`, `message`, `notification_type` (in_app/email)
   - **Future**: Will integrate with notification service

---

## Example Workflows You Can Create

### 1. **Welcome New Contacts**
```
Trigger: contact_created
Action: add_tag
  - Tags: ["new-contact", "needs-follow-up"]
Action: create_deal
  - Title: "Welcome Deal for {{contact.name}}"
  - Stage: "lead"
  - Contact: auto
```

### 2. **High-Value Lead Tagging**
```
Trigger: purchase_intent
Condition: IF confidence >= 0.9
Action: add_tag
  - Tags: ["high-value", "hot-lead"]
Action: create_deal
  - Title: "{{message}}"
  - Stage: "qualified"
  - Value: (extract from message)
```

### 3. **Conversation Follow-Up**
```
Trigger: conversation_ended
Action: update_contact
  - Add tag: "recent-conversation"
Action: send_webhook
  - URL: https://your-crm.com/webhook
  - Method: POST
  - Body: { "contact_id": "{{contact.id}}", "conversation_id": "{{conversation.id}}" }
```

### 4. **Deal Stage Automation**
```
Trigger: deal_stage_changed
Condition: IF stage == "closed-won"
Action: update_contact
  - Add tag: "customer"
  - Update metadata: { "last_purchase": "{{deal.created_at}}" }
Action: send_notification
  - To: sales-team@company.com
  - Title: "Deal Won: {{deal.title}}"
  - Message: "{{contact.name}} just closed a ${{deal.value}} deal!"
```

### 5. **Message-Based Tagging**
```
Trigger: message_received
Condition: IF message contains "urgent" OR "asap"
Action: add_tag
  - Tags: ["urgent"]
Action: send_webhook
  - URL: https://slack.com/webhook
  - Method: POST
  - Body: { "text": "Urgent message from {{contact.name}}" }
```

### 6. **Multi-Step Purchase Workflow**
```
Trigger: purchase_intent
Condition: IF confidence >= 0.8
Action: create_deal
  - Title: "Purchase: {{message}}"
  - Stage: "qualified"
Action: add_tag
  - Tags: ["purchase-intent"]
Action: update_contact
  - Metadata: { "last_intent": "purchase", "intent_confidence": "{{confidence}}" }
Action: send_webhook
  - URL: https://crm.example.com/api/deals
  - Method: POST
```

---

## How to Create Workflows

### Via UI (Frontend)

1. Go to `/dashboard/workflows`
2. Click "New Workflow"
3. Select trigger type
4. Add condition nodes (optional)
5. Add action nodes
6. Connect nodes with edges
7. Configure each node
8. Save and enable

### Via API

```javascript
POST /api/workflows
{
  "name": "Auto-Create Deal on Purchase Intent",
  "trigger_type": "purchase_intent",
  "enabled": true,
  "nodes": [
    {
      "id": "trigger-1",
      "type": "trigger",
      "nodeType": "purchase_intent",
      "data": { "label": "Purchase Intent", "config": {} }
    },
    {
      "id": "action-1",
      "type": "action",
      "nodeType": "create_deal",
      "data": {
        "label": "Create Deal",
        "config": {
          "type": "create_deal",
          "title": "Deal from {{message}}",
          "stage": "qualified",
          "contact_id": "auto"
        }
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "trigger-1",
      "target": "action-1"
    }
  ]
}
```

---

## Testing Workflows

### Using the Test Script

```bash
# Test all purchase intent scenarios
node test-purchase-intent-conversation.js

# Test specific scenario (0, 1, or 2)
node test-purchase-intent-conversation.js 0
```

### Manual Testing

1. Create a workflow in the UI
2. Enable it
3. Send test messages via widget or API
4. Check workflow executions at `/dashboard/workflows/[id]/history`
5. Verify actions were executed (deals created, tags added, etc.)

---

## Variables Available in Workflows

### Contact Variables
- `{{contact.id}}`
- `{{contact.name}}`
- `{{contact.email}}`
- `{{contact.phone}}`
- `{{contact.company_name}}`

### Deal Variables
- `{{deal.id}}`
- `{{deal.title}}`
- `{{deal.value}}`
- `{{deal.stage}}`

### Conversation Variables
- `{{conversation.id}}`
- `{{message}}`
- `{{intent}}`
- `{{confidence}}`

### Trigger-Specific Variables
- `{{triggered_by}}` - What triggered the workflow
- `{{triggered_by_id}}` - ID of the triggering entity

---

## Next Steps

1. **Enable More Triggers**: Implement firing for `conversation_ended`, `deal_stage_changed`, etc.
2. **Add More Actions**: Complete `send_notification` implementation
3. **Create Workflow Templates**: Pre-built workflows for common scenarios
4. **Add Workflow Analytics**: Track success rates, execution times
5. **Workflow Versioning**: Allow testing workflows before enabling



