# End-to-End Testing Plan

**Date:** 2024  
**Status:** Ready for Implementation  
**Coverage:** Phases 1-4, 6 (MVP + CRM)

---

## Overview

This document outlines comprehensive end-to-end (e2e) tests for all completed features in Syntera. These tests verify complete user journeys across the entire system, from authentication to AI agent interactions.

**Testing Framework Recommendation:** Playwright (cross-browser, reliable, fast)

---

## Test Environment Setup

### Prerequisites

1. **All services running:**
   ```bash
   pnpm run docker:up          # MongoDB, Redis
   pnpm run dev:all            # All services
   ```

2. **Test database:**
   - Separate Supabase project for testing (or use test data)
   - Separate MongoDB database for testing
   - Test API keys configured

3. **Test accounts:**
   - Test user account (email: `test@syntera.test`)
   - Test company setup
   - Test agent configurations

---

## Phase 1: Authentication & Dashboard (E2E Tests)

### Test Suite 1.1: User Authentication

#### Test 1.1.1: User Signup Flow
**Priority:** P0 (Critical)

**Steps:**
1. Navigate to `/signup`
2. Fill signup form:
   - Email: `newuser@test.com`
   - Password: `TestPassword123!`
   - Confirm password: `TestPassword123!`
3. Submit form
4. Verify email verification sent
5. Check redirect to verification page

**Expected Results:**
- ✅ User account created in Supabase
- ✅ Email verification email sent
- ✅ Redirected to verification page
- ✅ Cannot access dashboard without verification

#### Test 1.1.2: Email Verification
**Priority:** P0 (Critical)

**Steps:**
1. Complete signup flow
2. Check email for verification link
3. Click verification link
4. Verify account activated

**Expected Results:**
- ✅ Email received with verification link
- ✅ Clicking link verifies account
- ✅ Redirected to login page
- ✅ Can now log in

#### Test 1.1.3: User Login Flow
**Priority:** P0 (Critical)

**Steps:**
1. Navigate to `/login`
2. Enter credentials:
   - Email: `test@syntera.test`
   - Password: `TestPassword123!`
3. Submit form
4. Verify redirect

**Expected Results:**
- ✅ Login successful
- ✅ Redirected to `/dashboard`
- ✅ Session created
- ✅ User data loaded

#### Test 1.1.4: OAuth Login (Google)
**Priority:** P1 (High)

**Steps:**
1. Navigate to `/login`
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Verify redirect

**Expected Results:**
- ✅ OAuth flow completes
- ✅ User account created/linked
- ✅ Redirected to dashboard
- ✅ Session established

#### Test 1.1.5: OAuth Login (GitHub)
**Priority:** P1 (High)

**Steps:**
1. Navigate to `/login`
2. Click "Sign in with GitHub"
3. Complete OAuth flow
4. Verify redirect

**Expected Results:**
- ✅ OAuth flow completes
- ✅ User account created/linked
- ✅ Redirected to dashboard
- ✅ Session established

#### Test 1.1.6: Logout Flow
**Priority:** P0 (Critical)

**Steps:**
1. Log in as test user
2. Click logout button
3. Verify session cleared

**Expected Results:**
- ✅ Session terminated
- ✅ Redirected to login page
- ✅ Cannot access protected routes
- ✅ Cookies cleared

### Test Suite 1.2: Dashboard & Navigation

#### Test 1.2.1: Dashboard Access
**Priority:** P0 (Critical)

**Steps:**
1. Log in as test user
2. Navigate to `/dashboard`
3. Verify dashboard loads

**Expected Results:**
- ✅ Dashboard page loads
- ✅ Sidebar navigation visible
- ✅ User profile accessible
- ✅ All navigation links work

#### Test 1.2.2: Profile Management
**Priority:** P1 (High)

**Steps:**
1. Navigate to `/dashboard/profile`
2. Update profile:
   - Change display name
   - Update email (if allowed)
3. Save changes
4. Verify updates persisted

**Expected Results:**
- ✅ Profile updates saved
- ✅ Changes reflected immediately
- ✅ Data persisted in Supabase
- ✅ Success message shown

#### Test 1.2.3: Settings Page
**Priority:** P2 (Medium)

**Steps:**
1. Navigate to `/dashboard/settings`
2. Update password
3. Change notification preferences
4. Save changes

**Expected Results:**
- ✅ Password updated
- ✅ Settings saved
- ✅ Can log in with new password
- ✅ Preferences persisted

#### Test 1.2.4: Mobile Navigation
**Priority:** P2 (Medium)

**Steps:**
1. Open dashboard on mobile viewport
2. Click mobile menu button
3. Navigate to different pages
4. Verify mobile menu works

**Expected Results:**
- ✅ Mobile menu opens/closes
- ✅ Navigation works on mobile
- ✅ Responsive design functional
- ✅ Touch interactions work

---

## Phase 2: Agent Configuration (E2E Tests)

### Test Suite 2.1: Agent CRUD Operations

#### Test 2.1.1: Create Agent
**Priority:** P0 (Critical)

**Steps:**
1. Navigate to `/dashboard/agents`
2. Click "Create Agent"
3. Fill agent form:
   - Name: "Test Agent"
   - System Prompt: "You are a helpful assistant"
   - Model: GPT-4 Turbo
   - Temperature: 0.7
4. Save agent
5. Verify agent created

**Expected Results:**
- ✅ Agent created in database
- ✅ Redirected to agent detail page
- ✅ Agent appears in agents list
- ✅ Agent config saved correctly

#### Test 2.1.2: View Agent List
**Priority:** P0 (Critical)

**Steps:**
1. Navigate to `/dashboard/agents`
2. Verify agents list displays
3. Check pagination (if >10 agents)
4. Test search functionality

**Expected Results:**
- ✅ Agents list loads
- ✅ All agents displayed
- ✅ Search filters correctly
- ✅ Pagination works

#### Test 2.1.3: Edit Agent
**Priority:** P0 (Critical)

**Steps:**
1. Navigate to `/dashboard/agents/[id]`
2. Click "Edit"
3. Update agent name and prompt
4. Save changes
5. Verify updates persisted

**Expected Results:**
- ✅ Agent updated in database
- ✅ Changes reflected immediately
- ✅ Optimistic UI update works
- ✅ Success message shown

#### Test 2.1.4: Delete Agent
**Priority:** P0 (Critical)

**Steps:**
1. Navigate to `/dashboard/agents/[id]`
2. Click "Delete"
3. Confirm deletion
4. Verify agent removed

**Expected Results:**
- ✅ Confirmation dialog shown
- ✅ Agent deleted from database
- ✅ Redirected to agents list
- ✅ Agent no longer appears

#### Test 2.1.5: Agent Test Interface
**Priority:** P1 (High)

**Steps:**
1. Navigate to agent edit page
2. Click "Test Agent"
3. Send test message
4. Verify AI response received

**Expected Results:**
- ✅ Test dialog opens
- ✅ Message sent successfully
- ✅ AI response received (<2s)
- ✅ Response displayed correctly

### Test Suite 2.2: Knowledge Base Management

#### Test 2.2.1: Upload Document
**Priority:** P0 (Critical)

**Steps:**
1. Navigate to `/dashboard/knowledge-base`
2. Click "Upload Document"
3. Select PDF file (<50MB)
4. Wait for processing
5. Verify document appears in list

**Expected Results:**
- ✅ File uploaded to Supabase Storage
- ✅ Processing job queued
- ✅ Document appears in list
- ✅ Status shows "Processing" → "Completed"

#### Test 2.2.2: View Documents List
**Priority:** P0 (Critical)

**Steps:**
1. Navigate to `/dashboard/knowledge-base`
2. Verify documents list
3. Check document metadata (name, size, status)
4. Test search functionality

**Expected Results:**
- ✅ Documents list loads
- ✅ Metadata displayed correctly
- ✅ Status indicators work
- ✅ Search filters documents

#### Test 2.2.3: Delete Document
**Priority:** P1 (High)

**Steps:**
1. Navigate to knowledge base
2. Click delete on a document
3. Confirm deletion
4. Verify document removed

**Expected Results:**
- ✅ Document deleted from storage
- ✅ Vectors removed from Pinecone
- ✅ Document removed from list
- ✅ Success message shown

#### Test 2.2.4: Document Processing Status
**Priority:** P1 (High)

**Steps:**
1. Upload a large document
2. Monitor processing status
3. Verify status updates in real-time
4. Check processing completes

**Expected Results:**
- ✅ Status updates automatically
- ✅ Processing completes (<5min)
- ✅ Vectors created in Pinecone
- ✅ Document searchable after processing

#### Test 2.2.5: Knowledge Base Search
**Priority:** P1 (High)

**Steps:**
1. Navigate to knowledge base
2. Use search bar
3. Enter search query
4. Verify results filtered

**Expected Results:**
- ✅ Search debounced (300ms)
- ✅ Results filtered correctly
- ✅ Search works across document names
- ✅ No unnecessary API calls

---

## Phase 3: Chat Service (E2E Tests)

### Test Suite 3.1: Chat Interface

#### Test 3.1.1: Create Conversation
**Priority:** P0 (Critical)

**Steps:**
1. Navigate to `/dashboard/chat`
2. Click "New Conversation"
3. Select an agent
4. Verify conversation created

**Expected Results:**
- ✅ Conversation created in MongoDB
- ✅ Chat interface opens
- ✅ Agent selected
- ✅ Conversation ID generated

#### Test 3.1.2: Send Message
**Priority:** P0 (Critical)

**Steps:**
1. Open conversation
2. Type message in input
3. Press Enter or click Send
4. Verify message sent

**Expected Results:**
- ✅ Message appears immediately (optimistic)
- ✅ Message sent via Socket.io
- ✅ Message persisted in MongoDB
- ✅ Message appears in chat history

#### Test 3.1.3: Receive AI Response
**Priority:** P0 (Critical)

**Steps:**
1. Send message to agent
2. Wait for AI response
3. Verify response received

**Expected Results:**
- ✅ Response received (<2s)
- ✅ Response displayed in chat
- ✅ Streaming works (if enabled)
- ✅ Response persisted in MongoDB

#### Test 3.1.4: Real-time Message Delivery
**Priority:** P0 (Critical)

**Steps:**
1. Open conversation in two browser tabs
2. Send message from tab 1
3. Verify message appears in tab 2

**Expected Results:**
- ✅ Message appears in both tabs
- ✅ Real-time sync works
- ✅ Socket.io connection established
- ✅ No duplicate messages

#### Test 3.1.5: Message History
**Priority:** P0 (Critical)

**Steps:**
1. Create conversation
2. Send multiple messages
3. Refresh page
4. Verify message history loads

**Expected Results:**
- ✅ All messages loaded
- ✅ History paginated correctly
- ✅ Messages in correct order
- ✅ Loading states shown

#### Test 3.1.6: Typing Indicators
**Priority:** P1 (High)

**Steps:**
1. Open conversation
2. Start typing (don't send)
3. Verify typing indicator shown
4. Stop typing
5. Verify indicator disappears

**Expected Results:**
- ✅ Typing indicator appears
- ✅ Indicator shown to other users
- ✅ Indicator disappears after timeout
- ✅ No false positives

#### Test 3.1.7: Message Reactions
**Priority:** P2 (Medium)

**Steps:**
1. Hover over a message
2. Click reaction button
3. Select emoji
4. Verify reaction added

**Expected Results:**
- ✅ Reaction added to message
- ✅ Reaction persisted
- ✅ Reaction visible to all users
- ✅ Can remove reaction

#### Test 3.1.8: File Upload
**Priority:** P1 (High)

**Steps:**
1. Open conversation
2. Click file upload button
3. Select file (<10MB)
4. Verify file uploaded
5. Verify file link in message

**Expected Results:**
- ✅ File uploaded to storage
- ✅ File link in message
- ✅ File downloadable
- ✅ File size validated

#### Test 3.1.9: Message Search
**Priority:** P2 (Medium)

**Steps:**
1. Open conversation with messages
2. Use search bar
3. Enter search term
4. Verify messages filtered

**Expected Results:**
- ✅ Search filters messages
- ✅ Highlights matching text
- ✅ Search works client-side
- ✅ No API calls for search

#### Test 3.1.10: Conversation Threads
**Priority:** P1 (High)

**Steps:**
1. Create conversation
2. Create new thread
3. Switch between threads
4. Verify messages organized

**Expected Results:**
- ✅ Threads created correctly
- ✅ Messages assigned to threads
- ✅ Thread switching works
- ✅ Thread titles displayed

---

## Phase 4: AI Agent Integration (E2E Tests)

### Test Suite 4.1: AI Response Generation

#### Test 4.1.1: Basic AI Response
**Priority:** P0 (Critical)

**Steps:**
1. Send message to agent
2. Wait for response
3. Verify response quality

**Expected Results:**
- ✅ Response received (<2s)
- ✅ Response is relevant
- ✅ Response formatted correctly
- ✅ Markdown rendered

#### Test 4.1.2: Knowledge Base Context
**Priority:** P0 (Critical)

**Steps:**
1. Upload document to knowledge base
2. Wait for processing
3. Send question related to document
4. Verify response uses KB context

**Expected Results:**
- ✅ KB context retrieved
- ✅ Response includes KB information
- ✅ Vector search works
- ✅ Context relevant to query

#### Test 4.1.3: Multi-turn Conversation
**Priority:** P0 (Critical)

**Steps:**
1. Send first message
2. Receive response
3. Send follow-up message
4. Verify context maintained

**Expected Results:**
- ✅ Conversation history maintained
- ✅ Context window managed (last 20 messages)
- ✅ Follow-up responses coherent
- ✅ Memory persists across messages

#### Test 4.1.4: Agent Personality
**Priority:** P1 (High)

**Steps:**
1. Create agent with custom system prompt
2. Send test messages
3. Verify responses match personality

**Expected Results:**
- ✅ System prompt applied
- ✅ Responses match personality
- ✅ Tone consistent
- ✅ Custom instructions followed

#### Test 4.1.5: Intent Detection
**Priority:** P1 (High)

**Steps:**
1. Send message with clear intent (question, complaint)
2. Verify intent detected
3. Check response appropriate for intent

**Expected Results:**
- ✅ Intent detected correctly
- ✅ Response appropriate for intent
- ✅ Intent stored in metadata
- ✅ Intent analysis works

#### Test 4.1.6: Sentiment Analysis
**Priority:** P1 (High)

**Steps:**
1. Send message with positive sentiment
2. Send message with negative sentiment
3. Verify sentiment detected

**Expected Results:**
- ✅ Sentiment detected correctly
- ✅ Sentiment stored in metadata
- ✅ Sentiment analysis accurate
- ✅ Sentiment used in responses

#### Test 4.1.7: Error Handling
**Priority:** P0 (Critical)

**Steps:**
1. Disconnect from internet
2. Send message
3. Verify error handling
4. Reconnect and retry

**Expected Results:**
- ✅ Error message shown
- ✅ Retry mechanism works
- ✅ No data loss
- ✅ Graceful degradation

#### Test 4.1.8: Response Streaming
**Priority:** P1 (High)

**Steps:**
1. Send message with streaming enabled
2. Verify response streams
3. Check streaming completes

**Expected Results:**
- ✅ Response streams character by character
- ✅ Streaming smooth
- ✅ Complete response received
- ✅ No streaming errors

#### Test 4.1.9: Rate Limiting
**Priority:** P1 (High)

**Steps:**
1. Send multiple messages rapidly
2. Verify rate limiting applied
3. Check error messages

**Expected Results:**
- ✅ Rate limit enforced
- ✅ Error message clear
- ✅ Can retry after cooldown
- ✅ No service overload

#### Test 4.1.10: Context Window Management
**Priority:** P1 (High)

**Steps:**
1. Send 25+ messages in conversation
2. Verify only last 20 messages used
3. Check response quality maintained

**Expected Results:**
- ✅ Context window limited to 20 messages
- ✅ Older messages excluded
- ✅ Response quality maintained
- ✅ No context overflow errors

---

## Phase 6: CRM Module (E2E Tests)

### Test Suite 6.1: Contact Management

#### Test 6.1.1: Create Contact
**Priority:** P0 (Critical)

**Steps:**
1. Navigate to `/dashboard/crm/contacts`
2. Click "Add Contact"
3. Fill contact form:
   - Name: "John Doe"
   - Email: "john@example.com"
   - Phone: "+1-555-0123"
   - Company: "Acme Corp"
4. Save contact
5. Verify contact created

**Expected Results:**
- ✅ Contact created in Supabase
- ✅ Redirected to contact detail page
- ✅ Contact appears in contacts list
- ✅ All fields saved correctly

#### Test 6.1.2: View Contacts List
**Priority:** P0 (Critical)

**Steps:**
1. Navigate to `/dashboard/crm/contacts`
2. Verify contacts list
3. Test search functionality
4. Test filtering

**Expected Results:**
- ✅ Contacts list loads
- ✅ Search works
- ✅ Filters apply correctly
- ✅ Pagination works

#### Test 6.1.3: Edit Contact
**Priority:** P0 (Critical)

**Steps:**
1. Navigate to contact detail page
2. Click "Edit"
3. Update contact information
4. Save changes
5. Verify updates persisted

**Expected Results:**
- ✅ Contact updated in database
- ✅ Changes reflected immediately
- ✅ Optimistic UI update works
- ✅ Success message shown

#### Test 6.1.4: Delete Contact
**Priority:** P1 (High)

**Steps:**
1. Navigate to contact detail page
2. Click "Delete"
3. Confirm deletion
4. Verify contact removed

**Expected Results:**
- ✅ Confirmation dialog shown
- ✅ Contact deleted from database
- ✅ Redirected to contacts list
- ✅ Contact no longer appears

#### Test 6.1.5: Contact Detail Page
**Priority:** P0 (Critical)

**Steps:**
1. Navigate to contact detail page
2. Verify all contact information displayed
3. Check activity timeline
4. Verify conversation links

**Expected Results:**
- ✅ All contact data displayed
- ✅ Activity timeline shows interactions
- ✅ Conversations linked correctly
- ✅ Company information shown

### Test Suite 6.2: Company Management

#### Test 6.2.1: Create Company
**Priority:** P1 (High)

**Steps:**
1. Navigate to `/dashboard/crm/companies`
2. Click "Add Company"
3. Fill company form
4. Save company
5. Verify company created

**Expected Results:**
- ✅ Company created in database
- ✅ Company appears in list
- ✅ All fields saved
- ✅ Success message shown

#### Test 6.2.2: Link Contact to Company
**Priority:** P1 (High)

**Steps:**
1. Create or edit contact
2. Select company from dropdown
3. Save contact
4. Verify company linked

**Expected Results:**
- ✅ Company linked to contact
- ✅ Relationship saved
- ✅ Company shown on contact page
- ✅ Contact shown on company page

### Test Suite 6.3: Deal Management

#### Test 6.3.1: Create Deal
**Priority:** P1 (High)

**Steps:**
1. Navigate to `/dashboard/crm/deals`
2. Click "Add Deal"
3. Fill deal form:
   - Name: "Q1 Contract"
   - Value: $10,000
   - Stage: "Proposal"
   - Contact: Select contact
4. Save deal
5. Verify deal created

**Expected Results:**
- ✅ Deal created in database
- ✅ Deal appears in pipeline
- ✅ Contact linked
- ✅ All fields saved

#### Test 6.3.2: Deal Pipeline View
**Priority:** P1 (High)

**Steps:**
1. Navigate to `/dashboard/crm/deals`
2. Verify pipeline view
3. Drag deal to different stage
4. Verify stage updated

**Expected Results:**
- ✅ Pipeline view displays
- ✅ Deals in correct stages
- ✅ Drag-and-drop works
- ✅ Stage updates persisted

#### Test 6.3.3: Update Deal Stage
**Priority:** P1 (High)

**Steps:**
1. Navigate to deal detail page
2. Change deal stage
3. Save changes
4. Verify stage updated

**Expected Results:**
- ✅ Stage updated in database
- ✅ Deal moves in pipeline
- ✅ Changes reflected immediately
- ✅ Success message shown

### Test Suite 6.4: CRM Integration

#### Test 6.4.1: Auto-create Contact from Chat
**Priority:** P0 (Critical)

**Steps:**
1. Start conversation via widget
2. Provide contact information in chat
3. Verify contact auto-created
4. Check contact linked to conversation

**Expected Results:**
- ✅ Contact extracted from messages
- ✅ Contact created automatically
- ✅ Contact linked to conversation
- ✅ Contact appears in CRM

#### Test 6.4.2: Link Conversation to Contact
**Priority:** P0 (Critical)

**Steps:**
1. Navigate to conversation detail
2. Link conversation to contact
3. Verify link created
4. Check activity timeline updated

**Expected Results:**
- ✅ Conversation linked to contact
- ✅ Link persisted in database
- ✅ Activity timeline updated
- ✅ Conversation shown on contact page

#### Test 6.4.3: Activity Timeline
**Priority:** P1 (High)

**Steps:**
1. Navigate to contact detail page
2. Verify activity timeline
3. Check all interactions shown
4. Verify timeline chronological

**Expected Results:**
- ✅ Timeline displays all activities
- ✅ Activities in correct order
- ✅ Conversation links work
- ✅ Timeline updates in real-time

---

## Widget E2E Tests

### Test Suite W.1: Widget Integration

#### Test W.1.1: Widget Loads
**Priority:** P0 (Critical)

**Steps:**
1. Embed widget on test page
2. Load page
3. Verify widget appears
4. Check no console errors

**Expected Results:**
- ✅ Widget script loads
- ✅ Widget button appears
- ✅ No JavaScript errors
- ✅ Widget initialized correctly

#### Test W.1.2: Widget Chat Opens
**Priority:** P0 (Critical)

**Steps:**
1. Click widget button
2. Verify chat window opens
3. Check chat interface loads
4. Verify agent connected

**Expected Results:**
- ✅ Chat window opens
- ✅ Chat interface displayed
- ✅ Agent connected
- ✅ Ready to receive messages

#### Test W.1.3: Widget Message Flow
**Priority:** P0 (Critical)

**Steps:**
1. Open widget chat
2. Send message
3. Wait for AI response
4. Verify complete flow

**Expected Results:**
- ✅ Message sent successfully
- ✅ Response received
- ✅ Messages displayed correctly
- ✅ Conversation persisted

#### Test W.1.4: Widget Voice Call
**Priority:** P1 (High)

**Steps:**
1. Open widget chat
2. Click voice call button
3. Grant microphone permissions
4. Verify call starts
5. Test audio connection

**Expected Results:**
- ✅ Voice call initiated
- ✅ LiveKit connection established
- ✅ Audio working
- ✅ Agent responds via voice

#### Test W.1.5: Widget GDPR Consent
**Priority:** P1 (High)

**Steps:**
1. Load widget on page
2. Check consent banner appears
3. Accept consent
4. Verify consent stored
5. Reload page and verify consent remembered

**Expected Results:**
- ✅ Consent banner shown
- ✅ Consent stored in localStorage
- ✅ Consent remembered on reload
- ✅ Widget functional after consent

#### Test W.1.6: Widget Theming
**Priority:** P2 (Medium)

**Steps:**
1. Configure widget with custom theme
2. Load widget
3. Verify theme applied
4. Check all UI elements styled

**Expected Results:**
- ✅ Custom theme applied
- ✅ Colors match configuration
- ✅ Widget matches brand
- ✅ Theme persists

---

## Cross-Feature Integration Tests

### Test Suite I.1: End-to-End User Journeys

#### Test I.1.1: Complete Agent Setup & Chat Flow
**Priority:** P0 (Critical)

**Steps:**
1. Log in as test user
2. Create new agent
3. Upload knowledge base document
4. Wait for processing
5. Create conversation
6. Send message to agent
7. Verify response uses KB context
8. Check conversation linked to contact

**Expected Results:**
- ✅ All steps complete successfully
- ✅ Agent responds with KB context
- ✅ Contact auto-created
- ✅ Conversation linked
- ✅ No errors in flow

#### Test I.1.2: Widget to CRM Flow
**Priority:** P0 (Critical)

**Steps:**
1. Embed widget on test page
2. Start conversation via widget
3. Provide contact information
4. Verify contact created in CRM
5. Navigate to CRM dashboard
6. Verify contact and conversation linked

**Expected Results:**
- ✅ Widget conversation works
- ✅ Contact extracted and created
- ✅ Contact appears in CRM
- ✅ Conversation linked correctly
- ✅ Activity timeline updated

#### Test I.1.3: Multi-user Chat Flow
**Priority:** P1 (High)

**Steps:**
1. User A creates conversation
2. User B joins same conversation
3. User A sends message
4. Verify User B receives message
5. User B responds
6. Verify User A receives response

**Expected Results:**
- ✅ Real-time sync works
- ✅ Messages appear for all users
- ✅ No duplicate messages
- ✅ Socket.io connections stable

---

## Performance E2E Tests

### Test Suite P.1: Performance Benchmarks

#### Test P.1.1: Response Time - AI Agent
**Priority:** P0 (Critical)

**Steps:**
1. Send message to agent
2. Measure time to first token
3. Measure time to complete response
4. Verify <2s target met

**Expected Results:**
- ✅ First token <1s
- ✅ Complete response <2s
- ✅ Performance consistent
- ✅ No timeouts

#### Test P.1.2: Chat Latency
**Priority:** P0 (Critical)

**Steps:**
1. Send message via chat
2. Measure time to appear in UI
3. Measure time to persist
4. Verify <100ms target met

**Expected Results:**
- ✅ Message appears <100ms
- ✅ Optimistic UI works
- ✅ Persistence <500ms
- ✅ No lag noticeable

#### Test P.1.3: Page Load Performance
**Priority:** P1 (High)

**Steps:**
1. Navigate to dashboard
2. Measure page load time
3. Measure time to interactive
4. Verify performance targets met

**Expected Results:**
- ✅ Page loads <2s
- ✅ Time to interactive <3s
- ✅ No layout shifts
- ✅ Smooth animations

---

## Error Handling E2E Tests

### Test Suite E.1: Error Scenarios

#### Test E.1.1: Network Disconnection
**Priority:** P0 (Critical)

**Steps:**
1. Start conversation
2. Disconnect network
3. Send message
4. Verify error handling
5. Reconnect network
6. Verify recovery

**Expected Results:**
- ✅ Error message shown
- ✅ Retry mechanism works
- ✅ No data loss
- ✅ Reconnection successful

#### Test E.1.2: Service Unavailable
**Priority:** P1 (High)

**Steps:**
1. Stop agent service
2. Try to send message
3. Verify error handling
4. Restart service
5. Verify recovery

**Expected Results:**
- ✅ Graceful error message
- ✅ No app crash
- ✅ Service recovery works
- ✅ Can retry after recovery

#### Test E.1.3: Invalid Input Handling
**Priority:** P1 (High)

**Steps:**
1. Try to create agent with invalid data
2. Try to upload invalid file
3. Try to send empty message
4. Verify validation works

**Expected Results:**
- ✅ Validation errors shown
- ✅ Forms prevent submission
- ✅ Error messages clear
- ✅ No server errors

---

## Test Implementation Checklist

### Setup
- [ ] Install Playwright: `pnpm add -D @playwright/test`
- [ ] Create test configuration file
- [ ] Set up test database
- [ ] Create test user accounts
- [ ] Configure test environment variables

### Test Execution
- [ ] Run all tests: `pnpm test:e2e`
- [ ] Run specific suite: `pnpm test:e2e --grep "Authentication"`
- [ ] Run in headed mode: `pnpm test:e2e --headed`
- [ ] Run in CI: `pnpm test:e2e --ci`

### Test Maintenance
- [ ] Update tests when features change
- [ ] Review test failures regularly
- [ ] Add tests for new features
- [ ] Remove obsolete tests

---

## Success Criteria

### Coverage
- ✅ All P0 (Critical) tests passing
- ✅ 90%+ of P1 (High) tests passing
- ✅ 80%+ of P2 (Medium) tests passing

### Performance
- ✅ All performance targets met
- ✅ No regressions in response times
- ✅ Page load times acceptable

### Reliability
- ✅ Tests stable (no flaky tests)
- ✅ Tests run in <30 minutes
- ✅ Tests can run in CI/CD

---

## Next Steps

1. **Set up Playwright:**
   ```bash
   pnpm add -D @playwright/test
   npx playwright install
   ```

2. **Create test structure:**
   ```
   tests/
   ├── e2e/
   │   ├── auth.spec.ts
   │   ├── agents.spec.ts
   │   ├── chat.spec.ts
   │   ├── crm.spec.ts
   │   └── widget.spec.ts
   ├── fixtures/
   └── utils/
   ```

3. **Start with P0 tests:**
   - Authentication flows
   - Agent CRUD
   - Basic chat flow
   - CRM contact management

4. **Add to CI/CD:**
   - Run tests on every PR
   - Run tests before deployment
   - Generate test reports

---

**Status:** Ready for implementation  
**Priority:** High - Critical for production readiness  
**Estimated Effort:** 2-3 weeks for full implementation

