# In-App Notifications - Implementation & Best Practices

## ✅ In-App Notifications Are Fully Implemented and Preferred

### Current Implementation Status

**In-app notifications are:**
- ✅ **Always created** - regardless of `notification_type` setting
- ✅ **Default behavior** - if `notification_type` is not specified, defaults to `'in_app'`
- ✅ **Stored in database** - `notifications` table with full metadata
- ✅ **User-specific** - each notification is linked to a specific user
- ✅ **Company-scoped** - notifications are filtered by company_id

### How It Works

```typescript
// From workflow-executor.ts (lines 930-946)
// Create in-app notification (ALWAYS happens)
const { data: notification } = await supabase
  .from('notifications')
  .insert({
    user_id: userId,
    company_id: context.companyId,
    title,
    message,
    type: 'workflow',
    metadata: {
      workflow_id: context.workflow.id,
      triggered_by: context.triggerData.triggered_by,
      triggered_by_id: context.triggerData.triggered_by_id,
    },
  })

// Email is OPTIONAL - only sent if notification_type === 'email'
if (notificationType === 'email') {
  // Send email...
}
```

### Notification Types

1. **`in_app` (Default & Recommended)** ✅
   - Creates in-app notification in database
   - Appears in dashboard notification center/bell
   - No email sent
   - **Fast, reliable, no external dependencies**

2. **`email`** (Optional)
   - Creates in-app notification (always)
   - **Also** sends email via configured provider
   - Requires email service configuration (Resend, SendGrid, etc.)
   - Can fail if email service is down (but in-app notification still created)

### Best Practice: Use In-App Only

**Why favor in-app notifications:**

1. **Reliability**: No external email service dependencies
2. **Speed**: Instant delivery, no email API calls
3. **User Experience**: Users see notifications when they log in
4. **Cost**: No email service costs
5. **Privacy**: Notifications stay within the platform
6. **Rich Context**: Can include links to deals, contacts, etc.

### Workflow Configuration Example

```json
{
  "type": "send_notification",
  "to": "sales-manager@company.com",  // User email or UUID
  "title": "New High-Value Lead",
  "message": "{{contact.name}} showed purchase intent: {{message}}",
  "notification_type": "in_app"  // ← Default, recommended
}
```

### Where Users See Notifications

1. **Dashboard Notification Bell** (top right)
   - Shows unread count
   - Click to view all notifications

2. **Notifications Page** (`/dashboard/notifications`)
   - Full list of notifications
   - Mark as read/unread
   - Filter by type

3. **Real-time Updates** (if using Supabase Realtime)
   - Notifications appear instantly when created
   - No page refresh needed

### Notification Data Structure

```typescript
{
  id: UUID
  user_id: UUID           // Who receives it
  company_id: UUID        // Company scope
  title: string           // "New High-Value Lead"
  message: string         // Full message with variables replaced
  type: 'workflow'        // Notification type
  read: boolean           // Read status
  read_at: timestamp      // When read
  metadata: {
    workflow_id: UUID     // Which workflow created it
    triggered_by: string   // What triggered the workflow
    triggered_by_id: string // ID of triggering entity
  }
  created_at: timestamp
  updated_at: timestamp
}
```

### Finding Users for Notifications

**Option 1: Use Email Address**
```json
{
  "to": "sales-manager@company.com"
}
```
- System looks up user by email in `users` table
- Must match `company_id`
- If not found, notification fails

**Option 2: Use User ID (UUID)**
```json
{
  "to": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```
- Direct user reference
- Faster (no lookup needed)
- More reliable

### Example: High-Value Lead Notification

```json
{
  "type": "send_notification",
  "to": "sales-manager@company.com",
  "title": "🔥 High-Value Lead: {{contact.name}}",
  "message": "{{contact.name}} ({{contact.email}}) showed strong purchase intent:\n\n\"{{message}}\"\n\nConfidence: {{confidence}}%\nDeal created: {{deal.title}}\nStage: {{deal.stage}}\n\n[View Deal](/dashboard/crm/deals/{{deal.id}})",
  "notification_type": "in_app"
}
```

**Result:**
- ✅ In-app notification created immediately
- ✅ Appears in sales manager's notification center
- ✅ Includes all context (contact, deal, confidence)
- ✅ Can include links to deals/contacts
- ✅ No email service required

### When to Use Email

Use `notification_type: "email"` only when:
- User needs immediate external notification
- User might not be logged in
- Critical alerts that require email backup
- Integration with email-based workflows

### Summary

**✅ In-app notifications are:**
- Fully implemented
- Default behavior
- Always created
- Recommended for most use cases
- Fast, reliable, cost-effective

**Use in-app notifications as the primary notification method!** 🎯



