# UI Workflow Builder Guide: High-Value Lead Automation

## Step-by-Step Guide to Create the Workflow in the Dashboard

This guide will walk you through creating the "High-Value Lead Automation" workflow using the visual workflow builder in the dashboard.

---

## Prerequisites

- Access to the dashboard at `/dashboard/workflows`
- A user account with admin/owner permissions
- At least one agent configured

---

## Step 1: Access the Workflow Builder

1. **Navigate to Workflows**
   - Go to: `http://localhost:3000/dashboard/workflows` (or your domain)
   - Click the **"+ New Workflow"** button (top right)

2. **You'll see the Workflow Builder**
   - Left sidebar: Node Palette (available nodes to add)
   - Center: Canvas (where you build the workflow)
   - Top: Toolbar (Save, Cancel, Workflow name)
   - Right: Configuration Panel (appears when you select a node)

---

## Step 2: Configure the Trigger

The trigger is already added by default when creating a new workflow.

1. **Select the Trigger Node** (the first node on the canvas)
   - Click on the "Purchase Intent" trigger node
   - The Configuration Panel will open on the right

2. **Configure Trigger Settings**
   - **Trigger Type**: Already set to "Purchase Intent" ✅
   - **Confidence Threshold**: Set to `0.8` (80%)
     - This means the workflow only fires when AI detects purchase intent with 80%+ confidence
   - **Intent Type**: Leave empty (triggers on any purchase intent)
   - Click **"Save"** in the configuration panel

---

## Step 3: Add Create Deal Action

1. **Add Action Node**
   - In the **Node Palette** (left sidebar), find **"Actions"** section
   - Drag **"Create Deal"** onto the canvas
   - Position it to the right of the trigger node

2. **Connect Trigger to Action**
   - Hover over the trigger node
   - You'll see a connection handle (small dot) on the right side
   - Click and drag from the trigger node to the "Create Deal" action node
   - A connection line will appear

3. **Configure Create Deal Action**
   - Click on the "Create Deal" node
   - Configuration Panel opens on the right
   - Fill in the fields:
     - **Title**: `Deal from {{message}}`
       - This uses variable replacement - `{{message}}` will be replaced with the actual customer message
       - Use the **Variable Helper** button (🔗 icon) next to the field to insert variables
     - **Stage**: Select from dropdown:
       - `lead` (default) - for new leads
       - `qualified` - for high-value leads
       - `proposal`, `negotiation`, etc.
     - **Value**: `0` (or enter a number for deal value)
     - **Probability**: `50` (0-100, e.g., `80` for high-value leads)
     - **Contact ID**: Enter `auto` (automatically uses contact from conversation)
       - Or enter a specific contact ID if needed
     - Click **"Save"** in the configuration panel

---

## Step 4: Add Tag Action

1. **Add Tag Node**
   - In the **Node Palette**, find **"Add Tag"** action
   - Drag it onto the canvas
   - Position it to the right of the "Create Deal" node

2. **Connect Create Deal to Add Tag**
   - Click and drag from "Create Deal" node to "Add Tag" node
   - This ensures tags are added after the deal is created

3. **Configure Add Tag Action**
   - Click on the "Add Tag" node
   - Configuration Panel opens
   - Fill in:
     - **Contact ID**: Enter `auto` (uses contact from conversation context)
     - **Tags**: Enter tags as comma-separated values:
       ```
       purchase-intent, hot-lead
       ```
       - Example: `purchase-intent, hot-lead` or `purchase-intent,hot-lead`
       - Tags are automatically trimmed and deduplicated
     - Click **"Save"** in the configuration panel

---

## Step 5: (Optional) Add Notification Action

1. **Add Notification Node**
   - In the **Node Palette**, find **"Send Notification"** action
   - Drag it onto the canvas
   - Position it to the right of the "Add Tag" node

2. **Connect Add Tag to Notification**
   - Click and drag from "Add Tag" to "Send Notification"

3. **Configure Notification Action**
   - Click on the "Send Notification" node
   - Configuration Panel opens on the right
   - Fill in the fields:
     - **To**: Enter a user email (must exist in your `users` table)
       - Example: `your-email@company.com`
       - Or use a User ID (UUID) if you know it
       - **Important**: The email must belong to a user in your system
     - **Title**: `New Lead - Purchase Intent Detected`
       - You can use variables: `New {{contact.name}} - Purchase Intent`
     - **Message**: 
       ```
       {{contact.name}} showed purchase intent: "{{message}}"
       
       Confidence: {{confidence}}%
       Deal created: {{deal.title}}
       Contact: {{contact.email}}
       ```
       - Use the **Variable Helper** button (🔗 icon) to insert variables easily
     - **Notification Type**: Select `in_app` (recommended)
       - `in_app`: Creates dashboard notification (appears in notification bell) ✅ Recommended
       - `email`: Also sends email (requires email service configured)
     - Click **"Save"** in the configuration panel

---

## Step 6: Save the Workflow

1. **Set Workflow Name**
   - In the top toolbar, click on the workflow name
   - Change it to: `"High-Value Lead Automation"` (or your preferred name)
   - Press Enter or click outside

2. **Add Description (Optional)**
   - Click the description field in the toolbar
   - Add: `"Automatically creates deals and tags contacts when purchase intent is detected"`

3. **Save the Workflow**
   - Click the **"Save"** button in the top toolbar
   - The workflow will be saved and you'll be redirected to the workflow detail page

---

## Step 7: Enable the Workflow

1. **Enable Toggle**
   - On the workflow detail page, find the **"Enabled"** toggle switch
   - Toggle it to **ON** (green/enabled)
   - The workflow is now active and will execute when purchase intent is detected

---

## Visual Workflow Structure

Your completed workflow should look like this:

```
┌─────────────────┐
│ Purchase Intent │ (Trigger)
│   (Trigger)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Create Deal    │ (Action)
│  Title: Deal    │
│  from {{message}}│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Add Tag       │ (Action)
│  Tags: purchase │
│  -intent,       │
│  hot-lead       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Send           │ (Action - Optional)
│  Notification   │
│  (in-app)       │
└─────────────────┘
```

---

## Advanced: Adding Conditional Logic

If you want to differentiate between high-value and standard leads:

### Step A: Add Condition Node

1. **Add Condition Node**
   - In **Node Palette**, find **"Conditions"** section
   - Drag **"If"** condition onto the canvas
   - Position it between trigger and create deal

2. **Connect Nodes**
   - Trigger → If Condition
   - If Condition → Create Deal (for both true/false paths)

3. **Configure Condition**
   - Click on the "If" node
   - Set:
     - **Field**: `message`
     - **Operator**: `contains`
     - **Value**: `$`
   - This checks if the message contains "$" (indicating price/value)

### Step B: Create Two Paths

**High-Value Path (True):**
- If Condition (true) → Create Premium Deal → Add Hot-Lead Tag

**Standard Path (False):**
- If Condition (false) → Create Standard Deal → Add Warm-Lead Tag

---

## Available Variables

When configuring actions, you can use these variables:

### Contact Variables
- `{{contact.name}}` - Contact's full name
- `{{contact.email}}` - Contact's email
- `{{contact.phone}}` - Contact's phone
- `{{contact.company_name}}` - Contact's company

### Deal Variables
- `{{deal.title}}` - Deal title
- `{{deal.value}}` - Deal value
- `{{deal.stage}}` - Deal stage

### Trigger Variables
- `{{message}}` - The message that triggered the workflow
- `{{confidence}}` - Confidence score (0-100)
- `{{intent}}` - Detected intent type

### Example Usage
```
Title: "High-Value Lead: {{message}}"
Message: "{{contact.name}} ({{contact.email}}) wants to buy: {{message}}"
```

---

## Testing Your Workflow

1. **Send Test Messages**
   - Use the chat widget or API to send messages with purchase intent
   - Example: `"I want to buy 100 units at $50 each"`

2. **Check Results**
   - Go to `/dashboard/crm/deals` - you should see a new deal created
   - Go to `/dashboard/crm/contacts` - check if tags were added
   - Go to `/dashboard/workflows/[id]/history` - see workflow execution logs

3. **Verify Execution**
   - Click on the workflow in the list
   - Go to the **"History"** tab
   - You should see execution records with status "success"

---

## Troubleshooting

### Workflow Not Triggering

1. **Check if workflow is enabled**
   - Toggle must be ON (green)

2. **Check confidence threshold**
   - Default is 0.8 (80%)
   - Lower it if messages aren't triggering
   - Or use more explicit purchase language in test messages

3. **Check trigger type**
   - Must be set to `purchase_intent`

### Deal Not Created

1. **Check contact exists**
   - Workflow needs a contact to create a deal
   - Make sure `contact_id: "auto"` is set
   - Contact should be created from the conversation

2. **Check workflow execution logs**
   - Go to workflow history
   - Look for error messages

### Tags Not Applied

1. **Check action order**
   - Add Tag must come AFTER Create Deal
   - They must be connected with an edge

2. **Check contact_id**
   - Must be set to `"auto"` in the Add Tag action

### Notification Not Received

1. **Check user email**
   - Email must exist in `users` table
   - User must be in the same company

2. **Check notification type**
   - `in_app` creates dashboard notification
   - `email` also sends email (requires email service configured)

---

## Quick Reference: Node Types

### Triggers
- **Purchase Intent** - Fires when customer shows buying intent
- **Conversation Started** - Fires when new conversation begins
- **Message Received** - Fires on any message
- **Deal Created** - Fires when deal is created
- **Deal Stage Changed** - Fires when deal stage changes

### Actions
- **Create Deal** - Creates a new deal in CRM
- **Update Deal** - Updates existing deal
- **Add Tag** - Adds tags to contact
- **Update Contact** - Updates contact information
- **Send Notification** - Sends in-app or email notification
- **Send Webhook** - Sends HTTP request to external URL

### Conditions
- **If** - Simple if/else condition
- **And** - Multiple conditions (all must be true)
- **Or** - Multiple conditions (any can be true)

---

## Next Steps

1. **Test the workflow** with real conversations
2. **Monitor execution history** to see how often it fires
3. **Adjust confidence threshold** based on results
4. **Add more actions** (notifications, webhooks, etc.)
5. **Create variations** for different scenarios

---

## Tips & Best Practices

1. **Start Simple**: Begin with just trigger → create deal, then add complexity
2. **Test Frequently**: Test after each major change
3. **Use Variables**: Leverage `{{message}}`, `{{contact.name}}`, etc. for dynamic content
4. **Monitor History**: Check workflow execution logs regularly
5. **Name Clearly**: Use descriptive names for workflows and nodes
6. **Document**: Add descriptions to explain workflow purpose

---

## Example: Complete Simple Workflow

**Minimal Working Example:**
1. Trigger: Purchase Intent (default config)
2. Action: Create Deal
   - Title: `Deal from {{message}}`
   - Stage: `lead`
   - Contact ID: `auto`
3. Action: Add Tag
   - Contact ID: `auto`
   - Tags: `purchase-intent`

That's it! This will create a deal and tag the contact whenever purchase intent is detected.

---

## Need Help?

- Check workflow execution history for errors
- Review the workflow examples in `docs/WORKFLOW_EXAMPLES.md`
- Test with the script: `node test-high-value-lead-workflow.js`

