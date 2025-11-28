# CRM Testing Guide

This guide explains how to test all CRM features in Syntera.

## Prerequisites

1. **Start all services:**
   ```bash
   # From project root
   pnpm run dev:all
   
   # Or start individually:
   pnpm run dev:frontend     # Frontend (port 3000)
   pnpm run dev:agent        # Agent service (port 4002)
   pnpm run dev:chat         # Chat service (port 4004)
   ```

2. **Ensure you're logged in:**
   - Go to `http://localhost:3000/login`
   - Sign in with your account
   - You should be redirected to the dashboard

3. **Verify database connections:**
   - Supabase PostgreSQL (for CRM data)
   - MongoDB (for conversations)

---

## 1. Testing Contact Management

### 1.1 View All Contacts

**Steps:**
1. Navigate to `http://localhost:3000/dashboard/crm`
2. Click "View All Contacts" or go to `/dashboard/crm/contacts`
3. You should see a list of all contacts (if any exist)

**Expected Result:**
- Contacts list displays with search bar
- Each contact shows name, email, phone (if available)
- "Add Contact" button is visible

### 1.2 Create a New Contact

**Steps:**
1. Go to `/dashboard/crm/contacts/new`
2. Fill in the form:
   - **First Name**: John
   - **Last Name**: Doe
   - **Email**: john.doe@example.com
   - **Phone**: +1-555-0123
   - **Company**: Acme Corp
   - **Tags**: customer, vip (comma-separated)
3. Click "Create Contact"

**Expected Result:**
- Contact is created successfully
- Redirected to contact detail page
- Contact appears in contacts list

### 1.3 Edit a Contact

**Steps:**
1. Go to `/dashboard/crm/contacts`
2. Click on any contact
3. Click "Edit" button (or go to `/dashboard/crm/contacts/[id]/edit`)
4. Modify any field (e.g., change email)
5. Click "Update Contact"

**Expected Result:**
- Changes are saved
- Redirected to contact detail page
- Updated information is displayed

### 1.4 View Contact Details

**Steps:**
1. Go to `/dashboard/crm/contacts`
2. Click on any contact

**Expected Result:**
- Contact information displayed
- Additional info section (tags, notes, etc.)
- **Conversation History** section (if conversations exist)
- **Related Deals** section (if deals exist)
- **Activity Timeline** showing conversations and deals chronologically

### 1.5 Search Contacts

**Steps:**
1. Go to `/dashboard/crm/contacts`
2. Type in the search bar (e.g., "john")
3. Results should filter in real-time

**Expected Result:**
- Contacts matching search query are displayed
- Search works for name, email, phone, company

---

## 2. Testing Deal Management

### 2.1 View Deals Pipeline

**Steps:**
1. Go to `/dashboard/crm/deals`
2. You should see a Kanban board with deal stages:
   - **Prospecting**
   - **Qualification**
   - **Proposal**
   - **Negotiation**
   - **Closed Won**
   - **Closed Lost**

**Expected Result:**
- Deals are organized by stage
- Each deal card shows title, value, contact, and stage
- Drag-and-drop between stages (if implemented)

### 2.2 Create a New Deal

**Steps:**
1. Go to `/dashboard/crm/deals/new`
2. Fill in the form:
   - **Title**: Enterprise License
   - **Value**: 50000
   - **Stage**: Proposal
   - **Contact**: Select an existing contact (or leave empty)
   - **Expected Close Date**: Select a future date
   - **Description**: Optional notes
3. Click "Create Deal"

**Expected Result:**
- Deal is created successfully
- Redirected to deal detail page
- Deal appears in the pipeline at the selected stage

### 2.3 Edit a Deal

**Steps:**
1. Go to `/dashboard/crm/deals`
2. Click on any deal
3. Click "Edit" button
4. Modify fields (e.g., change stage to "Negotiation")
5. Click "Update Deal"

**Expected Result:**
- Changes are saved
- Deal moves to new stage in pipeline
- Updated information is displayed

### 2.4 Link Deal to Contact

**Steps:**
1. Create or edit a deal
2. In the "Contact" dropdown, select a contact
3. Save the deal

**Expected Result:**
- Deal is linked to contact
- Contact's detail page shows the deal in "Related Deals" section
- Deal detail page shows the contact

---

## 3. Testing Auto-Contact Creation from Widget

### 3.1 Test Widget Conversation with Email/Phone

**Steps:**
1. Open `widget/test.html` in your browser
2. Open the widget (click the widget button or run `widget.open()`)
3. Accept GDPR consent
4. Start a chat conversation
5. The widget will create a conversation automatically

**To trigger auto-contact creation:**
- The widget needs to send `email` or `phone` in the conversation metadata
- Currently, this happens automatically if the user provides this info during GDPR consent or conversation

**Expected Result:**
1. A new conversation is created in MongoDB
2. If `email` or `phone` is in metadata:
   - System checks for existing contact with that email/phone
   - If found, conversation is linked to existing contact
   - If not found, a new contact is auto-created with:
     - `auto_created: true` in metadata
     - `source: 'widget'` in metadata
     - Email/phone from metadata
3. Contact appears in `/dashboard/crm/contacts`
4. Contact detail page shows the conversation in "Conversation History"

### 3.2 Verify Auto-Created Contact

**Steps:**
1. After widget conversation, go to `/dashboard/crm/contacts`
2. Look for a contact with email/phone from the widget
3. Click on the contact

**Expected Result:**
- Contact shows `auto_created: true` in metadata (check Supabase directly)
- Contact detail page shows the conversation
- Activity timeline includes the conversation

---

## 4. Testing Conversation Linking

### 4.1 View Conversation History on Contact

**Steps:**
1. Go to `/dashboard/crm/contacts`
2. Click on a contact that has conversations
3. Scroll to "Conversation History" section

**Expected Result:**
- All conversations linked to this contact are displayed
- Each conversation shows:
  - Channel (chat, voice, video)
  - Status (active, ended)
  - Created date
  - Link to view full conversation

### 4.2 View Activity Timeline

**Steps:**
1. Go to a contact detail page
2. Scroll to "Activity Timeline" section

**Expected Result:**
- Combined timeline of:
  - Conversations (sorted by date)
  - Deals (sorted by date)
- Most recent activity at the top
- Each item shows type, date, and brief description

---

## 5. Testing CRM Dashboard

### 5.1 View CRM Stats

**Steps:**
1. Go to `/dashboard/crm`
2. View the stats cards at the top

**Expected Result:**
- **Total Contacts**: Count of all contacts
- **Active Deals**: Count of deals not in "closed-won" or "closed-lost"
- **Total Pipeline Value**: Sum of all deal values

### 5.2 Quick Actions

**Steps:**
1. Go to `/dashboard/crm`
2. Use the quick action cards:
   - "View All Contacts" → `/dashboard/crm/contacts`
   - "Add New Contact" → `/dashboard/crm/contacts/new`
   - "View Pipeline" → `/dashboard/crm/deals`
   - "Create New Deal" → `/dashboard/crm/deals/new`

**Expected Result:**
- All links navigate correctly
- Pages load without errors

---

## 6. Testing API Endpoints (Optional)

### 6.1 Test Contact API

**Get all contacts:**
```bash
curl http://localhost:3000/api/crm/contacts \
  -H "Cookie: your-session-cookie"
```

**Create contact:**
```bash
curl -X POST http://localhost:3000/api/crm/contacts \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane@example.com",
    "phone": "+1-555-0124"
  }'
```

### 6.2 Test Deal API

**Get all deals:**
```bash
curl http://localhost:3000/api/crm/deals \
  -H "Cookie: your-session-cookie"
```

**Create deal:**
```bash
curl -X POST http://localhost:3000/api/crm/deals \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "title": "Test Deal",
    "value": 10000,
    "stage": "prospecting"
  }'
```

---

## 7. Common Issues & Troubleshooting

### Issue: Contacts not appearing
**Solution:**
- Check Supabase connection
- Verify you're logged in with correct account
- Check browser console for errors

### Issue: Auto-contact creation not working
**Solution:**
- Verify widget is sending `email` or `phone` in metadata
- Check agent service logs for contact creation errors
- Verify Supabase `contacts` table exists and has correct schema

### Issue: Conversations not linking to contacts
**Solution:**
- Verify `contact_id` is stored in MongoDB conversation document
- Check that contact exists in Supabase
- Verify conversation was created with contact metadata

### Issue: Activity timeline empty
**Solution:**
- Ensure contact has linked conversations or deals
- Check that conversations have `contact_id` set
- Verify deals have `contact_id` set

---

## 8. Database Verification

### Check Contacts in Supabase

1. Go to Supabase Dashboard → Table Editor → `contacts`
2. Verify:
   - Contacts are created with correct `company_id`
   - Auto-created contacts have `metadata.auto_created: true`
   - Email/phone fields are populated

### Check Conversations in MongoDB

1. Connect to MongoDB (via MongoDB Compass or CLI)
2. Query `conversations` collection:
   ```javascript
   db.conversations.find({ contact_id: { $exists: true } })
   ```
3. Verify:
   - `contact_id` field exists and is a valid UUID
   - `metadata` contains conversation details

---

## 9. Test Checklist

- [ ] Create a new contact manually
- [ ] Edit an existing contact
- [ ] Search for contacts
- [ ] View contact details
- [ ] Create a new deal
- [ ] Edit a deal
- [ ] Link deal to contact
- [ ] View deals pipeline
- [ ] Start widget conversation
- [ ] Verify auto-contact creation (if email/phone provided)
- [ ] View conversation history on contact
- [ ] View activity timeline
- [ ] View CRM dashboard stats
- [ ] Test all navigation links

---

## 10. Next Steps

After testing CRM features:
1. Report any bugs or issues
2. Verify data integrity (contacts, deals, conversations)
3. Test with multiple users/companies
4. Test edge cases (duplicate emails, missing data, etc.)

For questions or issues, check:
- `frontend/app/dashboard/crm/` - CRM UI pages
- `frontend/app/api/crm/` - CRM API routes
- `services/agent/src/routes/public.ts` - Auto-contact creation logic




