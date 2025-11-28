# End-to-End Workflow Test Scenarios

## Overview

This document describes 6 comprehensive end-to-end workflow test scenarios that verify complete workflow functionality from trigger to final action.

## Test Script

Run the test script:
```bash
# Run all tests
node test-workflows-e2e.js

# Run specific test (1-6)
node test-workflows-e2e.js 1
```

---

## Test 1: Purchase Intent → Deal Creation → Tagging → Notification

**Priority**: P0 (Critical)  
**Complexity**: High  
**Duration**: ~15 seconds

### Workflow Steps:
1. Customer starts conversation
2. Customer provides contact info
3. Customer shows purchase intent
4. **Trigger**: `purchase_intent` (confidence >= 0.8)
5. **Action 1**: Create deal automatically
6. **Action 2**: Tag contact as "interested-buyer"
7. **Action 3**: Send notification to sales team

### What Gets Tested:
- ✅ Purchase intent detection
- ✅ Automatic deal creation
- ✅ Contact tagging
- ✅ Notification sending
- ✅ Workflow execution tracking

### Expected Results:
- Deal created with correct title, stage, and value
- Contact tagged appropriately
- Workflow execution recorded in database
- All actions completed successfully

### Setup Required:
- Workflow with `purchase_intent` trigger
- Actions: `create_deal`, `add_tag`, `send_notification`

---

## Test 2: Conversation Started → Welcome Tag → Initial Deal

**Priority**: P1 (High)  
**Complexity**: Medium  
**Duration**: ~5 seconds

### Workflow Steps:
1. Customer starts new conversation
2. **Trigger**: `conversation_started`
3. **Action 1**: Tag contact as "new-lead"
4. **Action 2**: Create initial deal in "lead" stage

### What Gets Tested:
- ✅ Conversation creation triggers workflow
- ✅ Automatic tagging on conversation start
- ✅ Initial deal creation

### Expected Results:
- Workflow triggered when conversation starts
- Contact tagged (if contact exists)
- Initial deal created (optional)

### Setup Required:
- Workflow with `conversation_started` trigger
- Actions: `add_tag`, `create_deal` (optional)

---

## Test 3: Contact Created → Welcome Email → Initial Tag

**Priority**: P1 (High)  
**Complexity**: Medium  
**Duration**: ~5 seconds

### Workflow Steps:
1. Customer provides contact information
2. System extracts and creates contact
3. **Trigger**: `contact_created`
4. **Action 1**: Tag contact as "new-contact"
5. **Action 2**: Send welcome notification

### What Gets Tested:
- ✅ Contact creation triggers workflow
- ✅ Automatic tagging on contact creation
- ✅ Welcome notifications

### Expected Results:
- Contact created with extracted info
- Contact tagged appropriately
- Workflow execution recorded

### Setup Required:
- Workflow with `contact_created` trigger
- Actions: `add_tag`, `send_notification`

---

## Test 4: Deal Stage Changed → Notification → Contact Update

**Priority**: P1 (High)  
**Complexity**: Medium  
**Duration**: ~5 seconds

### Workflow Steps:
1. Deal exists in "lead" stage
2. Deal stage changed to "qualified"
3. **Trigger**: `deal_stage_changed`
4. **Action 1**: Send notification to sales team
5. **Action 2**: Update contact metadata

### What Gets Tested:
- ✅ Stage change detection
- ✅ Previous vs new stage tracking
- ✅ Notification on stage change
- ✅ Contact metadata updates

### Expected Results:
- Workflow triggered with correct from/to stages
- Notification sent
- Contact metadata updated

### Setup Required:
- Workflow with `deal_stage_changed` trigger
- Actions: `send_notification`, `update_contact`

---

## Test 5: Conversation Ended → Follow-up Tag → Analytics Update

**Priority**: P2 (Medium)  
**Complexity**: Low  
**Duration**: ~5 seconds

### Workflow Steps:
1. Conversation in progress
2. Conversation ended (status = 'ended')
3. **Trigger**: `conversation_ended`
4. **Action 1**: Tag contact as "recent-conversation"
5. **Action 2**: Update conversation metadata

### What Gets Tested:
- ✅ Conversation end detection
- ✅ Duration calculation
- ✅ Follow-up tagging
- ✅ Metadata updates

### Expected Results:
- Workflow triggered when conversation ends
- Contact tagged appropriately
- Duration calculated correctly

### Setup Required:
- Workflow with `conversation_ended` trigger
- Actions: `add_tag`, `update_conversation_metadata`

---

## Test 6: Message Received → Conditional Tagging → Webhook

**Priority**: P2 (Medium)  
**Complexity**: High  
**Duration**: ~5 seconds

### Workflow Steps:
1. Customer sends message
2. **Trigger**: `message_received`
3. **Condition**: IF message contains "urgent"
4. **Action 1**: Tag contact as "urgent"
5. **Action 2**: Send webhook to external system

### What Gets Tested:
- ✅ Message trigger firing
- ✅ Conditional logic (IF node)
- ✅ Conditional tagging
- ✅ Webhook execution

### Expected Results:
- Workflow triggered on every message
- Condition evaluated correctly
- Actions executed only if condition passes

### Setup Required:
- Workflow with `message_received` trigger
- Condition node: IF message contains "urgent"
- Actions: `add_tag`, `send_webhook`

---

## Test Results Interpretation

### ✅ Test Passes
- Workflow executed successfully
- All actions completed
- Expected data created/updated

### ⚠️ Test Passes (Warning)
- Workflow may not be configured
- This is OK - tests verify trigger firing, not workflow existence
- Create workflows to see full functionality

### ❌ Test Fails
- Error in workflow execution
- Trigger not firing
- Action failed
- Check logs for details

---

## Creating Workflows for Testing

### Quick Setup Guide

1. **Purchase Intent Workflow** (Test 1):
   ```
   Trigger: purchase_intent
   → Action: create_deal (title: "Deal from {{message}}", stage: "lead")
   → Action: add_tag (tags: ["interested-buyer"])
   → Action: send_notification (to: your-email@example.com)
   ```

2. **Conversation Started Workflow** (Test 2):
   ```
   Trigger: conversation_started
   → Action: add_tag (tags: ["new-lead"])
   ```

3. **Contact Created Workflow** (Test 3):
   ```
   Trigger: contact_created
   → Action: add_tag (tags: ["new-contact"])
   → Action: send_notification (title: "New Contact Created")
   ```

4. **Deal Stage Changed Workflow** (Test 4):
   ```
   Trigger: deal_stage_changed
   → Action: send_notification (title: "Deal Stage Changed: {{from_stage}} → {{to_stage}}")
   ```

5. **Conversation Ended Workflow** (Test 5):
   ```
   Trigger: conversation_ended
   → Action: add_tag (tags: ["recent-conversation"])
   ```

6. **Message Received Workflow** (Test 6):
   ```
   Trigger: message_received
   → Condition: IF message contains "urgent"
   → Action: add_tag (tags: ["urgent"])
   → Action: send_webhook (url: https://your-webhook.com)
   ```

---

## Troubleshooting

### Workflows Not Triggering

1. **Check workflow is enabled**: Workflows must be enabled to execute
2. **Verify trigger type matches**: Trigger type must exactly match
3. **Check company_id**: Workflows are company-scoped
4. **Review logs**: Check agent service logs for errors

### Actions Failing

1. **Check action configuration**: All required fields must be set
2. **Verify permissions**: Actions need proper database permissions
3. **Check variable syntax**: Variables must use `{{variable}}` format
4. **Review execution history**: Check workflow_executions table for errors

### Test Script Issues

1. **Missing environment variables**: Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set
2. **Services not running**: Agent service must be running on port 4002
3. **No test data**: Ensure company and agent exist in database

---

## Next Steps

After running these tests:

1. **Create missing workflows**: Use the quick setup guide above
2. **Customize workflows**: Add conditions, multiple actions, etc.
3. **Test edge cases**: Test with invalid data, missing fields, etc.
4. **Monitor performance**: Check execution times and optimize if needed
5. **Add more tests**: Create tests for your specific use cases



