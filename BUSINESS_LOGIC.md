# Syntera - Business Logic & System Understanding

## 🎯 Core Business Model

**Syntera is a B2B SaaS platform** that enables businesses to deploy AI-powered agents that handle customer interactions across multiple channels (chat, voice, video, email, SMS).

### Value Proposition
- **For Businesses:** Reduce support costs, scale 24/7, automate customer interactions, gain data-driven insights
- **For End Customers:** Instant responses, natural conversations, consistent experience, seamless escalation

---

## 🏢 Multi-Tenant Architecture

### Entity Hierarchy
```
Company (Tenant)
  ├── Owner (User with 'owner' role)
  ├── Users (Team members with 'user' or 'admin' roles)
  ├── Agents (AI configurations owned by company)
  ├── Contacts (CRM - customers/leads)
  ├── Deals (Sales pipeline)
  └── Analytics Events (Usage tracking)
```

### Key Business Rules

1. **Company Isolation**
   - Each company is a separate tenant
   - Users can only access their company's data (enforced by RLS)
   - Agents belong to companies, not individual users
   - All data is scoped by `company_id`

2. **Subscription Tiers**
   - `starter` - Basic plan (500 interactions/month, 1 agent)
   - `professional` - Mid-tier (2,500 interactions/month, 3 agents)
   - `enterprise` - Custom (unlimited, custom features)
   - Stored in `companies.subscription_tier`

3. **User Roles**
   - `owner` - Company owner, full access
   - `admin` - Can manage agents, users, settings
   - `user` - Can view and interact with agents/conversations

---

## 🤖 Agent System Logic

### Agent Configuration (Stored in PostgreSQL)

Each agent has:
- **Identity**: `name`, `description`
- **AI Settings**: 
  - `system_prompt` - Defines agent personality and behavior
  - `model` - OpenAI model (default: 'gpt-4-turbo')
  - `temperature` - Creativity level (0-2, default: 0.7)
  - `max_tokens` - Response length limit (default: 2000)
- **Status**: `enabled` - Can be toggled on/off
- **Voice Settings**: `voice_settings` (JSONB) - For LiveKit integration
- **Ownership**: `company_id` - Which company owns this agent

### Agent Lifecycle

1. **Creation**: Business user creates agent via dashboard
   - Sets name, description, system prompt
   - Configures AI model parameters
   - Optionally uploads knowledge base documents

2. **Training**: Agent learns from:
   - System prompt (personality/instructions)
   - Knowledge base documents (uploaded to Supabase Storage, embedded via Pinecone)
   - Conversation history (for context)

3. **Deployment**: Agent becomes active (`enabled = true`)
   - Can be embedded as chat widget on company website
   - Can handle voice/video calls via LiveKit
   - Can respond to emails/SMS

4. **Operation**: Agent handles customer interactions
   - Receives input (text/voice/video)
   - Retrieves context (CRM data, knowledge base, conversation history)
   - Generates response via OpenAI
   - Stores conversation in MongoDB
   - Updates CRM (creates/updates contacts, tracks deals)

---

## 💬 Conversation Flow Logic

### High-Level Flow

```
Customer Interaction
    ↓
Channel Detection (chat/voice/video/email/sms)
    ↓
Conversation Created (MongoDB)
    ↓
Agent Service Processes
    ├── Retrieve Context (CRM, Knowledge Base, History)
    ├── Generate AI Response (OpenAI)
    └── Store Message (MongoDB)
    ↓
CRM Integration
    ├── Create/Update Contact
    ├── Update Lead Score
    └── Track Deal Progress
    ↓
Analytics Tracking
    ├── Record Event
    └── Update Metrics
    ↓
Response Delivered to Customer
```

### Detailed Conversation Processing

1. **Conversation Initiation**
   - Customer triggers interaction (clicks widget, calls, etc.)
   - System creates `Conversation` document in MongoDB:
     - `agent_id` - Which agent handles this
     - `company_id` - Which company owns the agent
     - `channel` - How customer contacted (chat/voice/video/email/sms)
     - `status` - 'active' initially
     - `contact_id` - Optional, if customer is known
     - `user_id` - Optional, if authenticated user

2. **Message Processing**
   - Customer sends message (text or voice converted to text)
   - System creates `Message` document:
     - `conversation_id` - Links to conversation
     - `sender_type` - 'user' (customer)
     - `role` - 'user' (for OpenAI)
     - `content` - Message text
     - `message_type` - 'text'/'audio'/'video'

3. **Agent Response Generation**
   - Agent Service receives message
   - Retrieves context:
     - Previous messages in conversation (from MongoDB)
     - Contact information (from PostgreSQL CRM)
     - Knowledge base documents (from Pinecone vector search)
     - Agent's system prompt (from PostgreSQL)
   - Builds prompt for OpenAI:
     ```
     System: {agent.system_prompt}
     Knowledge Base Context: {retrieved documents}
     CRM Context: {contact info, previous interactions}
     Conversation History: {previous messages}
     User: {current message}
     ```
   - Calls OpenAI API
   - Receives response
   - Stores response as `Message`:
     - `sender_type` - 'agent'
     - `role` - 'assistant'
     - `ai_metadata` - Tracks tokens used, response time, model used

4. **CRM Integration**
   - If `contact_id` exists: Update contact's last interaction
   - If no `contact_id`: Create new contact from customer info
   - Update lead score based on conversation content
   - If purchase intent detected: Create/update deal in pipeline
   - Link conversation to contact

5. **Conversation Completion**
   - Customer ends interaction or timeout
   - Update `Conversation.status` to 'ended'
   - Set `ended_at` timestamp
   - Generate conversation summary (for CRM)
   - Calculate metrics (duration, sentiment, resolution)

---

## 📊 CRM Integration Logic

### Contact Management

**Contact Creation:**
- Auto-created when customer first interacts
- Extracted from:
  - Email (if provided)
  - Phone number (if voice call)
  - Form data (if chat widget)
- Stored in `contacts` table (PostgreSQL)

**Contact Updates:**
- Each interaction updates `last_contact` timestamp
- Lead score recalculated based on:
  - Conversation sentiment
  - Purchase intent keywords
  - Interaction frequency
  - Deal progression

### Deal Pipeline

**Deal Stages:**
- `lead` - Initial contact
- `qualified` - AI qualified as potential customer
- `proposal` - Proposal sent
- `negotiation` - In negotiations
- `closed-won` - Deal closed successfully
- `closed-lost` - Deal lost

**Deal Creation:**
- Created when purchase intent detected
- Linked to `contact_id`
- Tracks `value`, `probability`, `expected_close_date`
- Updated as conversation progresses

---

## 📈 Analytics & Metrics

### Event Tracking

**Events Tracked:**
- `signup` - User registration
- `login` - User login
- `agent_created` - New agent created
- `agent_updated` - Agent configuration changed
- `conversation_started` - New conversation initiated
- `conversation_ended` - Conversation completed
- `settings_updated` - User settings changed
- `profile_updated` - User profile updated

**Stored in:** `analytics_events` table (PostgreSQL)
- `company_id` - Which company
- `user_id` - Which user (optional)
- `event_type` - Type of event
- `event_data` - JSONB with event details
- `created_at` - Timestamp

### Metrics Calculated

**Conversation Metrics:**
- Total interactions per period
- Interactions by channel (chat/voice/video)
- Average response time
- Customer satisfaction (CSAT)
- Resolution rate

**Agent Performance:**
- Response accuracy
- Token usage (cost tracking)
- Average conversation duration
- Escalation rate (to human)

**Business Metrics:**
- Lead conversion rate
- Deal pipeline velocity
- Revenue attribution
- ROI per agent

---

## 🔄 Data Flow Between Services

### Service Communication

1. **Frontend → Agent Service**
   - Create/update agent configurations
   - Start conversations
   - Get agent status

2. **Chat Service → Agent Service**
   - Send customer messages
   - Receive agent responses
   - Update conversation status

3. **Agent Service → CRM Service** (via API or RabbitMQ)
   - Create/update contacts
   - Update lead scores
   - Create/update deals

4. **Agent Service → Analytics Service**
   - Record conversation events
   - Update metrics
   - Generate reports

5. **Agent Service → OpenAI**
   - Generate AI responses
   - Process voice-to-text (Whisper)
   - Generate embeddings (for knowledge base)

6. **Agent Service → LiveKit**
   - Create voice/video rooms
   - Handle real-time media
   - Process audio streams

7. **Agent Service → Pinecone**
   - Store document embeddings
   - Search knowledge base
   - Retrieve relevant context

---

## 🎯 Key Business Rules Summary

### Agent Rules
1. Agents belong to companies, not users
2. Agents can be enabled/disabled
3. Agents use company's knowledge base
4. Agents respect subscription tier limits
5. Agents can handle multiple channels simultaneously

### Conversation Rules
1. Each conversation linked to one agent
2. Conversations stored in MongoDB (unstructured)
3. Messages include AI metadata (for cost tracking)
4. Conversations auto-create contacts if needed
5. Conversations can be escalated to humans

### CRM Rules
1. Contacts belong to companies
2. Contacts auto-created from conversations
3. Lead scores updated based on interactions
4. Deals linked to contacts
5. Deal stages progress based on conversation content

### Access Control Rules
1. Users can only access their company's data (RLS)
2. Owners have full access
3. Admins can manage agents/users
4. Users can view conversations/analytics
5. All API calls require authentication

### Subscription Rules
1. Subscription tier limits agent count
2. Subscription tier limits interactions/month
3. Analytics track usage against limits
4. Enterprise tier has custom limits
5. Billing based on usage (future)

---

## 🚀 Business Workflows

### Workflow 1: New Customer Interaction
```
1. Customer visits company website
2. Chat widget appears
3. Customer sends message
4. System creates conversation (MongoDB)
5. Agent Service processes:
   - Retrieves agent config
   - Checks if contact exists (CRM)
   - If not, creates contact
   - Generates AI response
   - Stores message
6. Response sent to customer
7. Analytics event recorded
8. Lead score updated
```

### Workflow 2: Agent Configuration
```
1. Business user logs into dashboard
2. Navigates to Agents page
3. Creates new agent:
   - Sets name, description
   - Writes system prompt
   - Configures AI settings
   - Uploads knowledge base docs
4. Documents processed:
   - Uploaded to Supabase Storage
   - Embedded via OpenAI
   - Stored in Pinecone
5. Agent saved to PostgreSQL
6. Agent can be enabled/deployed
```

### Workflow 3: Lead Qualification
```
1. Customer interacts with agent
2. Agent detects purchase intent
3. System creates deal in pipeline
4. Lead score increased
5. Sales team notified (future)
6. Follow-up scheduled (future)
7. Deal progresses through stages
8. Closed-won or closed-lost
```

---

## 💡 Key Insights

1. **Multi-Channel Unified Experience**: Same agent handles chat, voice, video - maintaining context across channels

2. **Context-Aware Responses**: Agent uses CRM data, knowledge base, and conversation history to provide relevant answers

3. **Automated CRM**: Conversations automatically create/update contacts and deals - no manual data entry

4. **Data-Driven Insights**: All interactions tracked for analytics, lead scoring, and performance optimization

5. **Scalable Architecture**: Microservices allow independent scaling of chat, agent, CRM, and analytics

6. **Knowledge Base Integration**: RAG (Retrieval Augmented Generation) enables agents to answer questions about company-specific information

---

## ✅ Confirmation Checklist

- [x] Multi-tenant SaaS model (companies → users → agents)
- [x] Agent configuration stored in PostgreSQL
- [x] Conversations stored in MongoDB
- [x] CRM integration auto-creates contacts/deals
- [x] Analytics tracks all events
- [x] Multi-channel support (chat/voice/video/email/sms)
- [x] Knowledge base via Pinecone RAG
- [x] OpenAI for AI responses
- [x] LiveKit for voice/video
- [x] Row Level Security for data isolation
- [x] Subscription tier limits
- [x] Real-time conversation handling
- [x] Context-aware agent responses

---

This document confirms the business logic understanding. All implementations should follow these rules and workflows.


