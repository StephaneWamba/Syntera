# Syntera Architecture

## System Design

### Microservices Architecture

Each service is independent, scalable, and communicates via REST APIs and message queues.

#### 1. **Auth Service** (Port 4001)
- User authentication & authorization
- JWT token management
- Role-based access control (RBAC)
- **DB:** PostgreSQL (users, sessions, permissions)

#### 2. **Agent Service** (Port 4002)
- AI agent orchestration
- LiveKit integration for voice/video
- Real-time conversation handling
- Context management
- **DB:** MongoDB (conversation logs), PostgreSQL (agent configs)

#### 3. **CRM Service** (Port 4003)
- Contact & lead management
- Interaction history
- Lead scoring
- Custom fields & tags
- **DB:** PostgreSQL (contacts, companies, deals)

#### 4. **Chat Service** (Port 4004)
- Real-time messaging
- WebSocket connections
- Message persistence
- Typing indicators
- **DB:** MongoDB (messages, channels)

#### 5. **Analytics Service** (Port 4005)
- Metrics aggregation
- Report generation
- Real-time dashboards
- Data visualization
- **DB:** PostgreSQL (metrics), Redis (cache)

---

## Data Flow

### Customer Interaction Flow

```
Customer → Frontend Widget
           ↓
      API Gateway (Next.js API Routes)
           ↓
      ┌────┴────┐
      ↓         ↓
Chat Service  Agent Service
      ↓         ↓
   MongoDB   LiveKit → OpenAI
      ↓         ↓
      └────┬────┘
           ↓
      CRM Service → PostgreSQL
           ↓
   Analytics Service
```

### Agent Decision Flow

```
Input (voice/text) → Speech-to-Text (LiveKit)
                     ↓
                Context Retrieval (MongoDB + CRM)
                     ↓
                AI Processing (OpenAI)
                     ↓
                Business Logic (Agent Service)
                     ↓
                Text-to-Speech (LiveKit)
                     ↓
                Output (voice/text)
```

---

## Database Schema

### PostgreSQL (Relational Data)

**users**
- id, email, password_hash, role, created_at

**agent_configs**
- id, user_id, name, voice_type, language, personality, system_prompt

**contacts**
- id, user_id, name, email, phone, company, lead_score, tags

**interactions**
- id, contact_id, agent_id, type (call/chat/video), duration, sentiment, created_at

**metrics**
- id, user_id, metric_type, value, timestamp

### MongoDB (Unstructured Data)

**conversations**
```json
{
  "_id": "...",
  "contact_id": "...",
  "agent_id": "...",
  "messages": [
    {
      "role": "user|agent",
      "content": "...",
      "timestamp": "..."
    }
  ],
  "metadata": {
    "sentiment": "positive",
    "intent": "purchase",
    "escalated": false
  }
}
```

**logs**
```json
{
  "_id": "...",
  "service": "agent|crm|chat",
  "level": "info|warn|error",
  "message": "...",
  "timestamp": "...",
  "metadata": {}
}
```

---

## API Structure

### REST Endpoints

**Auth Service**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `GET /auth/me` - Get current user

**Agent Service**
- `POST /agents` - Create agent
- `GET /agents/:id` - Get agent details
- `PATCH /agents/:id` - Update agent
- `POST /agents/:id/start` - Start conversation

**CRM Service**
- `POST /contacts` - Create contact
- `GET /contacts` - List contacts
- `GET /contacts/:id` - Get contact details
- `PATCH /contacts/:id` - Update contact

**Chat Service**
- `WebSocket /ws/chat` - Real-time messaging
- `GET /messages/:channelId` - Get message history

**Analytics Service**
- `GET /metrics` - Get metrics
- `GET /reports/:type` - Generate report

---

## Security

### Authentication Flow
1. User logs in → Auth Service validates → Returns JWT
2. JWT stored in httpOnly cookie
3. All requests include JWT in Authorization header
4. API Gateway validates JWT before routing

### Data Protection
- All data encrypted at rest (AES-256)
- TLS 1.3 for data in transit
- PII data anonymized in logs
- GDPR-compliant data retention

---

## Scalability

### Horizontal Scaling
- Each microservice runs in containers (Docker)
- Load balanced via Nginx/Traefik
- Auto-scaling based on CPU/memory

### Database Scaling
- PostgreSQL: Read replicas for analytics
- MongoDB: Sharding for conversation logs
- Redis: Distributed cache for sessions

### LiveKit Scaling
- Distributed SFU architecture
- Regional deployments for low latency
- Auto-scaling media servers

---

## Monitoring & Observability

- **Logs:** Centralized logging (ELK Stack / Grafana Loki)
- **Metrics:** Prometheus + Grafana
- **Tracing:** OpenTelemetry
- **Alerts:** PagerDuty / Slack integration

---

## Development Workflow

1. **Local Development:** Docker Compose for all services
2. **Testing:** Jest (unit), Playwright (e2e)
3. **CI/CD:** GitHub Actions
4. **Deployment:** Kubernetes / AWS ECS
5. **Environments:** dev → staging → production

