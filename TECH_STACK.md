# Syntera - Complete Tech Stack

## Architecture Philosophy

**Balanced Approach:** Use BaaS for standard operations (cost-efficient), keep custom services for performance-critical paths.

- **Supabase (BaaS)** → Auth, CRM, Storage, Basic Realtime
- **Custom Services** → Agent Service, Chat Service (performance-critical)
- **Specialized Services** → LiveKit, Pinecone, RabbitMQ (best-in-class)

---

## Frontend

### Core Framework
- **Next.js 14+** (App Router)
  - Server-side rendering (SSR)
  - API routes for backend integration
  - File-based routing
  - Built-in optimization

### UI Framework
- **React 18.3+**
  - Component-based architecture
  - Hooks for state management
  - Concurrent features

### Styling & Components
- **Shadcn/ui**
  - Accessible component library
  - TailwindCSS-based
  - Customizable design system
- **TailwindCSS 3.4+**
  - Utility-first CSS
  - Responsive design
  - Dark mode support
- **Radix UI**
  - Headless UI primitives
  - Accessibility built-in

### State Management
- **Zustand**
  - Lightweight state management
  - Global app state
- **React Query (TanStack Query)**
  - Server state management
  - Caching & synchronization
  - Real-time data fetching

### Real-time Communication
- **LiveKit Client SDK**
  - WebRTC for voice/video
  - Real-time audio/video streaming
  - Screen sharing
- **Socket.io Client**
  - WebSocket for chat (high-performance)
  - Real-time chat updates
- **Supabase Realtime Client**
  - Dashboard updates
  - Notifications

### Form Handling & Validation
- **React Hook Form**
  - Performant form handling
  - Minimal re-renders
- **Zod**
  - TypeScript-first schema validation
  - Type inference

### Data Visualization
- **Recharts**
  - Analytics dashboards
  - Real-time charts
  - Custom visualizations

---

## Backend Architecture

### BaaS Platform: Supabase
**Handles standard operations - cost-efficient:**

- **Authentication**
  - Built-in auth with OAuth (Google, GitHub, etc.)
  - Email/password, magic links
  - Session management
  - Row Level Security (RLS)

- **Database (PostgreSQL)**
  - Managed PostgreSQL database
  - ACID compliance
  - Complex queries
  - **Use Cases:**
    - User accounts & authentication
    - CRM data (contacts, companies, deals)
    - Agent configurations
    - Analytics & metrics
    - Permissions & roles

- **File Storage**
  - Document storage
  - Agent training files
  - Media files
  - Integrated with database

- **Basic Realtime**
  - Dashboard updates
  - Notifications
  - Non-latency-critical realtime

- **Edge Functions**
  - Serverless functions for analytics
  - Custom business logic

### Custom Services (Performance-Critical)

**1. Agent Service** (Port 4002)
- Express.js
- LiveKit SDK (voice/video)
- OpenAI SDK (AI orchestration)
- RabbitMQ (workflow queues)
- Pinecone (vector search)
- **Why Custom:** Complex AI logic, performance-critical

**2. Chat Service** (Port 4004)
- Express.js
- Socket.io (high-performance WebSocket)
- MongoDB (conversation logs)
- **Why Custom:** Sub-100ms latency requirement, high message throughput

### Runtime & Framework
- **Node.js 20+ (LTS)**
  - JavaScript runtime
  - Non-blocking I/O

### API Framework
- **Express.js**
  - RESTful API endpoints
  - Middleware support
  - Route handling

### Real-time Engine
- **LiveKit Server SDK**
  - SFU (Selective Forwarding Unit)
  - Voice/video processing
  - Room management
  - WebRTC infrastructure

### Service Communication
- **REST APIs** (HTTP/HTTPS)
  - Synchronous communication
  - Service-to-service calls
- **RabbitMQ**
  - Async processing
  - Event-driven architecture
  - Message queue with persistence
  - Dead letter queues
  - Reliable message delivery
- **Supabase Realtime**
  - Dashboard updates
  - Notifications
  - Non-latency-critical realtime

### API Documentation
- **Swagger/OpenAPI**
  - API documentation
  - Interactive testing

---

## Databases

### Relational Database
- **Supabase PostgreSQL**
  - Managed PostgreSQL database
  - ACID compliance
  - Complex queries
  - Row Level Security (RLS)
  - **Use Cases:**
    - User accounts & authentication
    - CRM data (contacts, companies, deals)
    - Agent configurations
    - Analytics & metrics
    - Permissions & roles
  - **Why Supabase:** Cost-efficient, managed, good enough performance

### NoSQL Database
- **MongoDB 7+**
  - Document store
  - Flexible schema
  - High write throughput
  - **Use Cases:**
    - Conversation logs (write-heavy)
    - Message history
    - Real-time logs
    - Agent training data
  - **Why Custom:** Optimized for high-write workloads, better than PostgreSQL JSONB for conversations

### Caching Layer
- **Redis 7+**
  - In-memory data store
  - **Use Cases:**
    - Session storage
    - Rate limiting
    - Real-time metrics cache
    - Pub/Sub for events
    - Agent response caching (microsecond latency)

### ORM/ODM
- **Supabase Client** (PostgreSQL)
  - TypeScript SDK
  - Auto-generated types
  - Real-time subscriptions
  - Row Level Security
- **Mongoose** (MongoDB)
  - MongoDB object modeling
  - Schema validation
  - Middleware support
  - Used for conversation logs

---

## AI & Machine Learning

### AI Provider
- **OpenAI GPT-4 Turbo**
  - Conversational AI
  - Natural language understanding
  - Context management
  - High performance

### Speech Processing
- **LiveKit Inference**
  - Speech-to-text (STT)
  - Text-to-speech (TTS)
  - Real-time transcription
- **AssemblyAI**
  - Universal streaming STT
  - Multi-language support
- **Cartesia Sonic**
  - High-quality TTS voices
  - Post-processing enhancement

### Vector Database
- **Pinecone**
  - Semantic search
  - Knowledge base retrieval
  - Agent memory enhancement
  - RAG (Retrieval-Augmented Generation)

---

## DevOps & Infrastructure

### Containerization
- **Docker**
  - Containerized services
  - Development environment
- **Docker Compose**
  - Local development
  - Service orchestration

### Cloud Provider
- **AWS**
  - Compute (EC2/ECS Fargate) - Custom services only
  - Database (DocumentDB for MongoDB)
  - Storage (S3) - Optional, Supabase Storage preferred
  - CDN (CloudFront) - Optional, Cloudflare preferred

### Monitoring & Error Tracking
- **Sentry**
  - Error tracking
  - Performance monitoring
  - Real-time alerts

### Logging
- **Local File Logging**
  - Winston (Node.js logger)
  - File rotation
  - Structured JSON logs
  - Log files stored locally and in S3

---

## Development Tools

### Language & Type Safety
- **TypeScript 5.3+**
  - Type safety
  - Better DX
  - IDE support

### Code Quality
- **ESLint**
  - Code linting
  - Best practices
- **Prettier**
  - Code formatting

### Package Management
- **pnpm**
  - Dependency management
  - Faster installs
  - Disk space efficient

---

## Third-Party Integrations

### Communication
- **Twilio**
  - SMS notifications
  - Phone number management

### Email
- **Resend**
  - Email delivery
  - Transactional emails
  - Modern API

### Payment Processing
- **Stripe**
  - Subscription management
  - Payment processing
  - Billing

### File Storage
- **Supabase Storage**
  - Document storage
  - Agent training files
  - Media files
  - **Why Supabase:** Cost-efficient, integrated with database
  - **Alternative:** AWS S3 (if needed for large files)

### Analytics
- **PostHog**
  - Product analytics
  - User behavior tracking
  - Feature flags

---

## Environment & Configuration

### Environment Variables
- `.env.local` (development)
- `.env.production` (production)
- Managed via **dotenv**

### Secrets Management
- **Environment Variables**
  - `.env` files for local development
  - Platform environment variables for production
  - Secure handling via deployment platform

---

## Performance & Optimization

### CDN
- **Cloudflare**
  - Static asset delivery
  - Global distribution
  - DDoS protection
  - WAF (Web Application Firewall)
  - Free tier available

### Image Optimization
- **Next.js Image Component**
  - Automatic optimization
  - Lazy loading

### Caching
- **Redis**
  - API response caching
  - Session storage
  - Agent response caching
- **Next.js Cache**
  - ISR (Incremental Static Regeneration)
  - Data caching

---

## Security

### Authentication
- **Supabase Auth**
  - OAuth 2.0 / OpenID Connect
  - Social logins
  - SSO support
  - Row Level Security

### Data Protection
- **TLS 1.3**
  - Encrypted connections
- **AES-256**
  - Data encryption at rest

### API Security
- **Rate Limiting**
  - Express-rate-limit
- **CORS**
  - Cross-origin protection
- **Helmet.js**
  - Security headers

---

## Cost Breakdown (Monthly)

### BaaS (Supabase)
- **Free Tier (MVP):** $0/month
  - 500MB database, 1GB storage, 2GB bandwidth
- **Pro Tier (Growth):** $25/month
  - 8GB database, 100GB storage, 250GB bandwidth

### Custom Services (AWS)
- **ECS (Agent + Chat):** $50-100/month
- **DocumentDB (MongoDB):** $50-100/month
- **ElastiCache (Redis):** $20-50/month
- **RabbitMQ (Managed):** $30-50/month

### Specialized Services
- **LiveKit:** $50-100/month (usage-based)
- **Pinecone:** $20-50/month (usage-based)

### **Total: ~$220-475/month**

**vs Pure Custom Stack: ~$250-500/month**
- **Savings: 10-20% + better performance on critical paths**

---

## Summary Table

| Category | Technology | Purpose | Type |
|----------|-----------|---------|------|
| **Frontend** | Next.js 14+ | React framework | Custom |
| **UI** | Shadcn/ui + TailwindCSS | Component library | Custom |
| **State** | Zustand + React Query | State management | Custom |
| **BaaS** | Supabase | Auth, Database, Storage, Realtime | BaaS |
| **Backend** | Node.js + Express | Custom services (Agent, Chat) | Custom |
| **Real-time** | LiveKit | Voice/video | Specialized |
| **WebSocket** | Socket.io + Supabase Realtime | Chat (custom) + Dashboard (BaaS) | Hybrid |
| **Database** | Supabase PostgreSQL + MongoDB | CRM (BaaS) + Conversations (custom) | Hybrid |
| **Cache** | Redis | In-memory cache | Custom |
| **AI** | OpenAI GPT-4 Turbo | Conversational AI | Third-party |
| **Vector DB** | Pinecone | Semantic search | Specialized |
| **Auth** | Supabase Auth | Authentication | BaaS |
| **Validation** | Zod | Schema validation | Custom |
| **ORM** | Supabase Client + Mongoose | Database access | Hybrid |
| **Deploy** | Docker + Docker Compose | Containerization | Custom |
| **Cloud** | AWS | Infrastructure | Cloud |
| **CDN** | Cloudflare | Content delivery | Third-party |
| **Monitoring** | Sentry | Error tracking | Third-party |
| **Logging** | Winston (Local files) | File-based logs | Custom |
| **Queue** | RabbitMQ | Message queue | Custom |
| **Package** | pnpm | Dependency management | Tool |

---

## Version Requirements

```json
{
  "node": ">=20.0.0",
  "pnpm": ">=8.0.0",
  "postgresql": ">=15.0",
  "mongodb": ">=7.0",
  "redis": ">=7.0"
}
```

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│      Next.js Frontend                    │
│   (Shadcn/ui, TailwindCSS)               │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼────────┐    ┌────────▼──────────┐
│  Supabase  │    │  Custom Services  │
│  (BaaS)    │    │  (Performance)    │
│            │    │                   │
│ • Auth     │    │ • Agent Service   │
│ • CRM DB   │    │ • Chat Service    │
│ • Storage  │    │ • LiveKit         │
│ • Basic    │    │ • MongoDB         │
│   Realtime │    │ • Redis           │
│            │    │ • RabbitMQ        │
│            │    │ • Pinecone        │
└────────────┘    └───────────────────┘
```

---

## Getting Started

See [README.md](./README.md) for installation and setup instructions.
