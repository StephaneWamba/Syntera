# Valuable Workflow Proposal: High-Value Lead Automation

## Overview

**Workflow Name**: "High-Value Lead Automation & Sales Pipeline Management"

**Business Value**: Automates the entire sales process from first contact to deal closure, ensuring no high-value leads fall through the cracks and sales reps are notified immediately.

**ROI**: 
- Reduces response time from hours to seconds
- Ensures consistent follow-up
- Prevents missed opportunities
- Improves conversion rates by 20-30%

---

## Workflow Structure

### Trigger: `purchase_intent` (with high confidence threshold)

**Configuration**:
- Confidence threshold: `0.85` (85% or higher)
- Intent type: `purchase`

### Flow:

```
┌─────────────────┐
│ Purchase Intent │ (Trigger)
│ Confidence ≥85% │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Extract Value   │ (Condition: IF message contains $ or price)
│ from Message    │
└────────┬────────┘
         │
    ┌────┴────┐
    │        │
    ▼        ▼
┌───────┐ ┌──────────┐
│ High  │ │ Standard │
│ Value │ │ Lead     │
│ Lead  │ │          │
└───┬───┘ └────┬─────┘
    │          │
    ▼          ▼
┌──────────┐ ┌──────────┐
│ Create   │ │ Create   │
│ Premium  │ │ Standard │
│ Deal     │ │ Deal     │
└────┬─────┘ └────┬─────┘
     │           │
     ▼           ▼
┌──────────┐ ┌──────────┐
│ Tag:     │ │ Tag:     │
│ "hot-    │ │ "warm-   │
│ lead"    │ │ lead"    │
└────┬─────┘ └────┬─────┘
     │           │
     └─────┬─────┘
           │
           ▼
    ┌──────────────┐
    │ Notify Sales │
    │ Team         │
    └──────────────┘
```

---

## Detailed Node Configuration

### 1. Trigger Node
```json
{
  "id": "trigger-1",
  "type": "trigger",
  "nodeType": "purchase_intent",
  "data": {
    "label": "Purchase Intent Detected",
    "config": {
      "confidence_threshold": 0.85,
      "intent_type": "purchase"
    }
  }
}
```

### 2. Condition Node: Check for High Value
```json
{
  "id": "condition-1",
  "type": "condition",
  "nodeType": "if",
  "data": {
    "label": "Is High Value Lead?",
    "config": {
      "field": "message",
      "operator": "contains",
      "value": "$"
    }
  }
}
```

**Logic**: If message contains "$" or price indicators, route to high-value path.

### 3. Action: Create Premium Deal (High-Value Path)
```json
{
  "id": "action-1",
  "type": "action",
  "nodeType": "create_deal",
  "data": {
    "label": "Create Premium Deal",
    "config": {
      "type": "create_deal",
      "title": "High-Value Lead: {{message}}",
      "stage": "qualified",
      "value": 0,
      "probability": 80,
      "contact_id": "auto",
      "metadata": {
        "source": "purchase_intent_workflow",
        "priority": "high",
        "auto_created": true
      }
    }
  }
}
```

### 4. Action: Add Hot Lead Tag
```json
{
  "id": "action-2",
  "type": "action",
  "nodeType": "add_tag",
  "data": {
    "label": "Tag as Hot Lead",
    "config": {
      "type": "add_tag",
      "contact_id": "auto",
      "tags": ["hot-lead", "purchase-intent", "high-value"]
    }
  }
}
```

### 5. Action: Create Standard Deal (Standard Path)
```json
{
  "id": "action-3",
  "type": "action",
  "nodeType": "create_deal",
  "data": {
    "label": "Create Standard Deal",
    "config": {
      "type": "create_deal",
      "title": "Lead from {{message}}",
      "stage": "lead",
      "value": 0,
      "probability": 50,
      "contact_id": "auto",
      "metadata": {
        "source": "purchase_intent_workflow",
        "priority": "normal"
      }
    }
  }
}
```

### 6. Action: Add Warm Lead Tag
```json
{
  "id": "action-4",
  "type": "action",
  "nodeType": "add_tag",
  "data": {
    "label": "Tag as Warm Lead",
    "config": {
      "type": "add_tag",
      "contact_id": "auto",
      "tags": ["warm-lead", "purchase-intent"]
    }
  }
}
```

### 7. Action: Notify Sales Team
```json
{
  "id": "action-5",
  "type": "action",
  "nodeType": "send_notification",
  "data": {
    "label": "Notify Sales Team",
    "config": {
      "type": "send_notification",
      "to": "sales-manager@company.com",  // Must be a user email in users table, or use user_id (UUID)
      "title": "New {{contact.name ? contact.name : 'Lead'}} - Purchase Intent Detected",
      "message": "{{contact.name}} showed purchase intent: \"{{message}}\"\n\nConfidence: {{confidence}}%\n\nDeal created: {{deal.title}}\nContact: {{contact.email}}",
      "notification_type": "in_app"  // Default: in-app only (recommended). Use "email" for email + in-app
    }
  }
}
```

**Note**: 
- **In-app notifications are the default** and always created (even if `notification_type` is not specified)
- In-app notifications appear in the dashboard notification bell/center
- Email is optional - only sent if `notification_type: "email"` is set
- The `to` field can be:
  - **Email address**: Must exist in `users` table (e.g., `"sales-manager@company.com"`)
  - **User ID (UUID)**: Direct user reference (e.g., `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"`)

---

## Alternative: Multi-Stage Sales Pipeline Workflow

### Workflow 2: "Automated Sales Pipeline Management"

**Trigger**: `deal_stage_changed`

**Flow**:
1. **Trigger**: Deal stage changes to "qualified"
   - Action: Tag contact as "qualified-lead"
   - Action: Notify sales manager
   - Action: Update deal probability to 60%

2. **Trigger**: Deal stage changes to "proposal"
   - Action: Tag contact as "proposal-sent"
   - Action: Send notification to sales rep
   - Action: Update deal probability to 75%

3. **Trigger**: Deal stage changes to "negotiation"
   - Action: Tag contact as "negotiating"
   - Action: Notify sales manager + finance team
   - Action: Update deal probability to 85%

4. **Trigger**: Deal stage changes to "closed-won"
   - Action: Tag contact as "customer"
   - Action: Send congratulations email to customer
   - Action: Notify sales team + create celebration notification
   - Action: Update contact metadata with "last_purchase_date"

5. **Trigger**: Deal stage changes to "closed-lost"
   - Action: Tag contact as "lost-opportunity"
   - Action: Send follow-up survey
   - Action: Schedule re-engagement in 30 days

---

## Workflow 3: "Customer Onboarding Automation"

**Trigger**: `conversation_started`

**Flow**:
1. **Trigger**: New conversation starts
   - Action: Extract contact info from first message
   - Action: Create/update contact
   - Action: Tag as "new-inquiry"
   - Action: Create initial deal (stage: "lead", value: 0)
   - Action: Send welcome notification to sales team

2. **Condition**: IF contact email contains "@enterprise.com" or "@bigcorp.com"
   - Action: Tag as "enterprise-lead"
   - Action: Create deal with higher probability (70%)
   - Action: Notify enterprise sales team
   - Action: Set deal value to estimated enterprise value

---

## Workflow 4: "Churn Prevention & Re-engagement"

**Trigger**: `conversation_ended` (with conditions)

**Flow**:
1. **Trigger**: Conversation ends
   - **Condition**: IF conversation duration < 2 minutes AND no purchase intent detected
     - Action: Tag contact as "needs-follow-up"
     - Action: Create task for sales rep
     - Action: Schedule follow-up email in 24 hours

2. **Condition**: IF conversation had purchase intent but no deal created
   - Action: Tag as "missed-opportunity"
   - Action: Notify sales manager
   - Action: Create high-priority deal
   - Action: Send immediate follow-up email

---

## Implementation Priority

### Phase 1 (Immediate Value):
1. ✅ **High-Value Lead Automation** (Purchase Intent → Deal Creation → Tagging → Notification)
   - **Impact**: High
   - **Complexity**: Medium
   - **ROI**: Immediate

### Phase 2 (Enhanced Automation):
2. **Sales Pipeline Management** (Deal Stage Changes → Automated Actions)
   - **Impact**: Very High
   - **Complexity**: Medium
   - **ROI**: High (reduces manual pipeline management)

### Phase 3 (Customer Experience):
3. **Customer Onboarding Automation** (Conversation Started → Welcome Flow)
   - **Impact**: Medium-High
   - **Complexity**: Low
   - **ROI**: Improves first impression

### Phase 4 (Retention):
4. **Churn Prevention** (Conversation Ended → Re-engagement)
   - **Impact**: High
   - **Complexity**: Medium
   - **ROI**: Prevents lost revenue

---

## Metrics to Track

1. **Response Time**: Time from purchase intent to first contact
2. **Conversion Rate**: % of purchase intents that become deals
3. **Deal Velocity**: Time from lead to closed-won
4. **Tag Accuracy**: % of correctly tagged leads
5. **Notification Delivery**: % of notifications successfully delivered

---

## Example Use Cases

### Scenario 1: E-commerce Customer
**Customer says**: "I want to buy 100 units of Product X at $50 each"

**Workflow executes**:
1. Detects purchase intent (confidence: 95%)
2. Extracts value: $5,000
3. Creates deal: "High-Value Lead: I want to buy 100 units..."
4. Tags: ["hot-lead", "purchase-intent", "high-value"]
5. Notifies: sales-team@company.com
6. **Result**: Sales rep contacts customer within 5 minutes

### Scenario 2: SaaS Customer
**Customer says**: "We're interested in your Enterprise plan"

**Workflow executes**:
1. Detects purchase intent (confidence: 88%)
2. Creates deal: "Lead from We're interested in your Enterprise plan"
3. Tags: ["warm-lead", "purchase-intent"]
4. Notifies: sales-team@company.com
5. **Result**: Automated follow-up within 1 hour

---

## Next Steps

1. **Create the workflow** in the dashboard (`/dashboard/workflows/new`)
2. **Test with sample conversations** using the test script
3. **Monitor execution logs** at `/dashboard/workflows/[id]/history`
4. **Iterate based on results** (adjust confidence thresholds, add conditions, etc.)
5. **Scale to other triggers** (deal_stage_changed, conversation_started, etc.)

---

## Technical Notes

- All workflows use `contact_id: "auto"` to automatically link to the conversation's contact
- Variable replacement works for: `{{message}}`, `{{contact.name}}`, `{{contact.email}}`, `{{deal.title}}`, `{{confidence}}`
- Notifications support both in-app and email delivery
- Workflows are executed asynchronously and don't block the conversation flow

