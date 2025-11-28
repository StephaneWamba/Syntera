# Syntera Project Framework

## 📋 Overview

**Syntera** is an AI-powered universal agent platform that enables businesses to deploy intelligent voice, video, and chat agents across multiple communication channels. The platform combines real-time communication, AI orchestration, knowledge base management, and CRM integration into a unified SaaS solution.

### Core Capabilities
- **Multi-channel Communication**: Chat, voice, video, email, SMS
- **AI Agent Orchestration**: GPT-4 Turbo powered agents with customizable personalities
- **Knowledge Base Management**: Document processing, vector embeddings, semantic search
- **Real-time Messaging**: Sub-100ms latency WebSocket communication
- **CRM Integration**: Contact management, lead tracking, interaction history
- **Analytics & Reporting**: Performance metrics, conversation analytics

---

## 🏗️ Architecture

### Microservices Architecture

The platform follows a microservices architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│              (React 19, Next.js 16, Shadcn/ui)          │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐      ┌─────────▼──────────┐
│   Supabase     │      │  Custom Services   │
│   (BaaS)       │      │  (Performance)    │
│                │      │                    │
│ • Auth         │      │ • Agent Service    │
│ • PostgreSQL   │      │ • Chat Service    │
│ • Storage      │      │ • Knowledge Base   │
│ • Realtime     │      │                    │
└───────┬────────┘      └─────────┬──────────┘
        │                         │
        └────────────┬────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐      ┌─────────▼──────────┐
│   MongoDB      │      │   External APIs   │
│ (Conversations)│      │                    │
│                │      │ • OpenAI           │
│   Redis        │      │ • Pinecone         │
│   (Cache)      │      │ • LiveKit          │
└────────────────┘      └────────────────────┘
```

### Service Overview

#### 1. **Frontend** (Next.js 16)
- **Port**: 3000 (dev), 3001 (prod)
- **Framework**: Next.js 16 with App Router
- **UI Library**: Shadcn/ui + TailwindCSS
- **State Management**: React Query + Zustand
- **Real-time**: Socket.io Client
- **Features**:
  - Dashboard with agent management
  - Real-time chat interface
  - Knowledge base management
  - User profile & settings
  - Responsive design (mobile-first)

#### 2. **Agent Service** (Port 4002)
- **Framework**: Express.js + TypeScript
- **Purpose**: AI orchestration and agent management
- **Key Responsibilities**:
  - Generate AI responses using OpenAI GPT-4 Turbo
  - Manage agent configurations
  - Integrate with Pinecone for knowledge base retrieval
  - Handle LiveKit integration (voice/video)
  - Process file attachments for context
- **Databases**:
  - Supabase PostgreSQL (agent configs)
  - Redis (optional caching)
- **External APIs**:
  - OpenAI API
  - Pinecone (vector search)
  - LiveKit (voice/video)

#### 3. **Chat Service** (Port 4004)
- **Framework**: Express.js + Socket.io + TypeScript
- **Purpose**: Real-time messaging and conversation management
- **Key Responsibilities**:
  - WebSocket connections (Socket.io)
  - Message persistence
  - Conversation management
  - Real-time message delivery
  - Typing indicators
  - Read receipts
  - Message reactions
- **Databases**:
  - MongoDB (conversations, messages)
  - Redis (caching, session management)
- **Performance**:
  - Sub-100ms latency target
  - Response compression (Gzip)
  - Connection pooling
  - Query optimization

#### 4. **Knowledge Base Service** (Port 4005)
- **Framework**: Express.js + TypeScript
- **Purpose**: Document processing and vector embeddings
- **Key Responsibilities**:
  - File upload handling (Supabase Storage)
  - Document extraction (PDF, DOCX, TXT)
  - Text chunking
  - Vector embedding generation (OpenAI)
  - Pinecone vector storage
  - Document search
- **Databases**:
  - Supabase PostgreSQL (document metadata)
  - Pinecone (vector embeddings)
  - Redis (optional queue)
- **Processing**:
  - BullMQ queue for async processing
  - Worker concurrency (2 workers)
  - Timeout protection (5min)
  - Error handling and retries

#### 5. **Shared Package** (`@syntera/shared`)
- **Purpose**: Common utilities and types
- **Contents**:
  - MongoDB models (Conversation, Message)
  - Database utilities (MongoDB, Redis)
  - Logger (Winston)
  - Type definitions
  - Seed scripts

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Shadcn/ui, TailwindCSS
- **State**: React Query v5, Zustand
- **Forms**: React Hook Form + Zod
- **Real-time**: Socket.io Client
- **Styling**: TailwindCSS + CSS Variables
- **Icons**: Lucide React

### Backend Services
- **Runtime**: Node.js 20+ (LTS)
- **Framework**: Express.js
- **Language**: TypeScript 5.9+
- **Real-time**: Socket.io 4.8+
- **Validation**: Zod 4.1+

### Databases
- **PostgreSQL**: Supabase (managed)
  - User accounts, agent configs, CRM data
  - Row Level Security (RLS)
- **MongoDB**: DocumentDB (AWS) or local
  - Conversations, messages (unstructured)
  - High write throughput
- **Redis**: ElastiCache (AWS) or local
  - Caching, session management
  - Rate limiting

### External Services
- **AI**: OpenAI GPT-4 Turbo
- **Vector DB**: Pinecone
- **Voice/Video**: LiveKit
- **Storage**: Supabase Storage
- **Auth**: Supabase Auth

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Orchestration**: AWS ECS (production)
- **IaC**: Terraform
- **CDN**: Cloudflare
- **Monitoring**: Winston (logs), Sentry (errors)

### Development Tools
- **Package Manager**: pnpm 8.15+
- **Build Tool**: TypeScript Compiler (tsc)
- **Dev Server**: tsx (watch mode)
- **Concurrency**: concurrently
- **Linting**: ESLint
- **Formatting**: Prettier

---

## 📁 Project Structure

```
Syntera/
├── frontend/                    # Next.js frontend application
│   ├── app/                     # App Router pages
│   │   ├── api/                 # API routes (proxies)
│   │   ├── auth/                # Auth callbacks
│   │   ├── dashboard/           # Dashboard pages
│   │   └── layout.tsx           # Root layout
│   ├── components/              # React components
│   │   ├── agents/              # Agent management UI
│   │   ├── chat/                # Chat interface
│   │   ├── knowledge-base/     # KB management
│   │   ├── ui/                  # Shadcn/ui components
│   │   └── shared/              # Shared components
│   ├── lib/                     # Utilities and helpers
│   │   ├── api/                 # API clients
│   │   ├── auth/                # Auth utilities
│   │   ├── constants/           # Constants
│   │   ├── schemas/             # Zod schemas
│   │   └── supabase/            # Supabase clients
│   └── public/                  # Static assets
│
├── services/                     # Backend microservices
│   ├── agent/                   # Agent Service (Port 4002)
│   │   ├── src/
│   │   │   ├── routes/          # REST API routes
│   │   │   ├── config/          # Configuration
│   │   │   └── utils/           # Utilities
│   │   ├── dist/                # Compiled JavaScript
│   │   └── package.json
│   │
│   ├── chat/                    # Chat Service (Port 4004)
│   │   ├── src/
│   │   │   ├── handlers/        # Socket.io handlers
│   │   │   ├── routes/          # REST API routes
│   │   │   ├── middleware/      # Express middleware
│   │   │   ├── config/          # Configuration
│   │   │   └── utils/           # Utilities (cache, etc.)
│   │   ├── dist/                # Compiled JavaScript
│   │   └── package.json
│   │
│   └── knowledge-base/          # Knowledge Base Service (Port 4005)
│       ├── src/
│       │   ├── routes/          # REST API routes
│       │   ├── services/        # Business logic
│       │   │   ├── processor.ts # Document processing
│       │   │   ├── extractor.ts # Text extraction
│       │   │   ├── chunker.ts   # Text chunking
│       │   │   ├── embeddings.ts # Vector embeddings
│       │   │   └── pinecone.ts  # Pinecone integration
│       │   ├── config/          # Configuration
│       │   └── utils/           # Utilities
│       ├── dist/                # Compiled JavaScript
│       └── package.json
│
├── shared/                       # Shared package
│   ├── src/
│   │   ├── database/            # DB utilities (MongoDB, Redis)
│   │   ├── models/               # Mongoose models
│   │   ├── logger/               # Winston logger
│   │   └── types/                # TypeScript types
│   ├── dist/                     # Compiled JavaScript
│   └── package.json
│
├── database/                     # Database schemas
│   └── supabase/
│       └── migrations/           # PostgreSQL migrations
│
├── terraform/                    # Infrastructure as Code
│   ├── main.tf                   # Main configuration
│   ├── ecs.tf                    # ECS service definitions
│   ├── databases.tf              # Database resources
│   └── variables.tf              # Variables
│
├── scripts/                      # Utility scripts
│   ├── check-and-seed-mongodb.ts
│   └── setup-infra.ps1
│
├── docs/                         # Documentation
│   ├── SUPABASE_SETUP.md
│   ├── AWS_SETUP.md
│   └── UI_UX_GUIDELINES.md
│
├── docker-compose.yml            # Docker Compose (dev)
├── docker-compose.performance.yml # Docker Compose (optimized)
├── package.json                  # Root package.json
├── HOW_TO_RUN.md                 # Running instructions
├── PROJECT_ROADMAP.md            # Development roadmap
├── ARCHITECTURE.md               # Architecture details
├── TECH_STACK.md                 # Technology stack
└── README.md                     # Project overview
```

---

## 🔄 Data Flow

### Message Flow (Chat)

```
User Input
    ↓
Frontend (Socket.io Client)
    ↓
Chat Service (Socket.io Server)
    ↓
┌─────────────────┬─────────────────┐
│                 │                 │
MongoDB        Agent Service    Redis
(Store)        (AI Response)    (Cache)
    ↓                 ↓
    └────────┬────────┘
             ↓
    Frontend (Real-time Update)
```

### Agent Response Flow

```
User Message
    ↓
Chat Service → Agent Service (HTTP POST)
    ↓
Agent Service:
  1. Retrieve context (last 20 messages)
  2. Search knowledge base (Pinecone)
  3. Process attachments (if any)
  4. Generate prompt
    ↓
OpenAI API (GPT-4 Turbo)
    ↓
Streaming Response
    ↓
Chat Service → Frontend (Socket.io)
    ↓
Store in MongoDB
```

### Document Processing Flow

```
File Upload (Frontend)
    ↓
Supabase Storage
    ↓
Knowledge Base Service
    ↓
Document Extraction (PDF/DOCX/TXT)
    ↓
Text Chunking
    ↓
Generate Embeddings (OpenAI)
    ↓
Store in Pinecone
    ↓
Update Metadata (Supabase PostgreSQL)
```

---

## 🚀 Development Workflow

### Prerequisites
- Node.js 20+
- pnpm 8.15+
- Docker & Docker Compose
- Supabase account
- Environment variables configured

### Quick Start

1. **Install Dependencies**
```bash
pnpm install
```

2. **Build All Services**
```bash
pnpm run build:all
```

3. **Start Docker Services**
```bash
pnpm run docker:up
```

4. **Start All Services (Dev Mode)**
```bash
pnpm run dev:all
```

This starts:
- Chat Service (Port 4004)
- Agent Service (Port 4002)
- Knowledge Base Service (Port 4005)
- Frontend (Port 3000)

### Individual Service Commands

```bash
# Build
pnpm run build:shared    # Build shared package
pnpm run build:chat      # Build chat service
pnpm run build:agent     # Build agent service
pnpm run build:kb        # Build knowledge base service

# Development
pnpm run dev:chat        # Chat service only
pnpm run dev:agent       # Agent service only
pnpm run dev:kb          # Knowledge base service only
pnpm run dev:frontend    # Frontend only

# Docker
pnpm run docker:up       # Start Docker services
pnpm run docker:down     # Stop Docker services
pnpm run docker:logs     # View Docker logs
pnpm run docker:restart  # Restart Docker services
```

### Development Mode

Services use `tsx watch` for hot reload:
- TypeScript files are watched
- Changes trigger automatic rebuild
- Services restart automatically

For faster startup, build services first:
```bash
pnpm run build:all
# Then run dev mode (uses compiled dist/ files)
```

---

## 🔌 Service Communication

### Frontend ↔ Services

**REST API** (via Next.js API Routes):
- `/api/agents/*` → Agent Service
- `/api/chat/*` → Chat Service
- `/api/knowledge-base/*` → Knowledge Base Service

**WebSocket** (Direct):
- Socket.io connection to Chat Service (Port 4004)
- Real-time message delivery
- Typing indicators
- Read receipts

### Service-to-Service

**HTTP REST APIs**:
- Chat Service → Agent Service: `POST /api/responses/generate`
- Frontend → Services: Via Next.js API routes (proxies)

**Shared Package**:
- All services import from `@syntera/shared`
- Common models, utilities, types

### Authentication

**Supabase Auth**:
- JWT tokens for API authentication
- Socket.io authentication via token
- Row Level Security (RLS) in PostgreSQL

---

## 💾 Database Strategy

### PostgreSQL (Supabase)
**Use Cases**:
- User accounts & authentication
- Agent configurations
- Knowledge base document metadata
- CRM data (future)

**Features**:
- Row Level Security (RLS)
- Automatic backups
- Connection pooling
- Real-time subscriptions

### MongoDB
**Use Cases**:
- Conversations (unstructured)
- Messages (high write volume)
- AI metadata (token usage, costs)

**Features**:
- Flexible schema
- High write throughput
- Horizontal scaling
- Document-based storage

### Redis
**Use Cases**:
- API response caching
- Session management
- Rate limiting
- Real-time data

**Features**:
- In-memory storage
- Sub-millisecond latency
- Pub/sub for real-time
- TTL support

### Pinecone
**Use Cases**:
- Vector embeddings storage
- Semantic search
- Knowledge base retrieval

**Features**:
- High-dimensional vectors
- Fast similarity search
- Namespace isolation
- Managed service

---

## ⚡ Performance Optimizations

### Backend

1. **MongoDB Connection Pooling**
   - `maxPoolSize`: 10
   - `minPoolSize`: 5
   - `maxIdleTimeMS`: 30000

2. **Response Compression**
   - Gzip compression enabled
   - Reduces payload size by ~70%

3. **Redis Caching**
   - 30-second TTL for messages
   - Cache invalidation on updates
   - Reduces database load

4. **Database Query Optimization**
   - Field selection (`.select()`)
   - Query limits (`.limit()`)
   - Indexed queries

5. **Request Body Limits**
   - Chat/Agent: 10MB
   - Knowledge Base: 50MB

### Frontend

1. **React Query Caching**
   - `staleTime`: 30s
   - `gcTime`: 5min
   - Request deduplication

2. **Debouncing**
   - Search: 300ms
   - Read receipts: 500ms

3. **Optimistic Updates**
   - Agent CRUD operations
   - Rollback on error

4. **Code Splitting**
   - Dynamic imports
   - Route-based splitting

5. **Image Optimization**
   - Next.js Image component
   - Lazy loading

---

## 🐳 Docker Configuration

### Development (`docker-compose.yml`)
- MongoDB (Port 27017)
- Redis (Port 6379)
- RabbitMQ (Port 5672)

### Performance (`docker-compose.performance.yml`)
- Resource limits (CPU, memory)
- MongoDB WiredTiger cache optimization
- Redis maxmemory configuration
- Connection pooling

---

## 📦 Build System

### TypeScript Compilation
- All services compile to `dist/` folders
- Shared package compiles first
- Services depend on shared package

### Build Order
1. `@syntera/shared` (base package)
2. `@syntera/chat-service`
3. `@syntera/agent-service`
4. `@syntera/knowledge-base-service`

### Production Builds
- Frontend: `next build` → `.next/` folder
- Services: `tsc` → `dist/` folders
- Shared: `tsc` → `dist/` folder

---

## 🔐 Security

### Authentication
- Supabase Auth (JWT tokens)
- Socket.io authentication
- API route protection

### Data Protection
- Row Level Security (RLS) in PostgreSQL
- Environment variables for secrets
- HTTPS in production

### Rate Limiting
- Express rate limiter
- Per-IP limits
- Per-user limits

---

## 📊 Monitoring & Logging

### Logging
- **Winston** logger (file-based)
- Structured JSON logs
- Service-specific log files
- Error tracking

### Error Handling
- Try-catch blocks
- Error boundaries (frontend)
- Graceful degradation
- Error logging

### Performance Monitoring
- Response time tracking
- Database query monitoring
- Cache hit rates
- API usage metrics

---

## 🚢 Deployment

### Development
- Local Docker Compose
- Services run on localhost
- Hot reload enabled

### Production (AWS)
- **ECS**: Container orchestration
- **DocumentDB**: MongoDB-compatible
- **ElastiCache**: Redis
- **Cloudflare**: CDN & DDoS protection
- **Terraform**: Infrastructure as Code

### Environment Variables
- `.env` files for local development
- AWS Secrets Manager (production)
- Supabase environment variables

---

## 📚 Key Documentation

- **[HOW_TO_RUN.md](HOW_TO_RUN.md)**: Running instructions
- **[PROJECT_ROADMAP.md](PROJECT_ROADMAP.md)**: Development phases
- **[ARCHITECTURE.md](ARCHITECTURE.md)**: System architecture
- **[TECH_STACK.md](TECH_STACK.md)**: Technology details
- **[docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)**: Supabase configuration
- **[docs/AWS_SETUP.md](docs/AWS_SETUP.md)**: AWS setup guide

---

## 🎯 Current Status

### Completed ✅
- Authentication & user management
- Agent configuration UI
- Real-time chat interface
- Knowledge base upload & processing
- AI agent responses with context
- File attachments support
- Performance optimizations
- Build system

### In Progress 🚧
- Chat settings page
- Conversation threads
- Load testing
- Response time optimization

### Planned 📋
- Voice & video integration (LiveKit)
- CRM module
- Analytics dashboard
- Workflow automation

---

## 🔄 Version Control

- **Package Manager**: pnpm 8.15+
- **Node.js**: 20+ (LTS)
- **TypeScript**: 5.9+
- **Next.js**: 14.2+
- **React**: 18.3+

---

## 📝 Notes

- All services use TypeScript for type safety
- Shared package must be built before services
- Docker services (MongoDB, Redis) should be running before starting services
- Environment variables must be configured in `.env` files
- Production builds are optimized for performance

---

**Last Updated**: 2025-01-17
**Version**: 0.1.0


## 📋 Overview

**Syntera** is an AI-powered universal agent platform that enables businesses to deploy intelligent voice, video, and chat agents across multiple communication channels. The platform combines real-time communication, AI orchestration, knowledge base management, and CRM integration into a unified SaaS solution.

### Core Capabilities
- **Multi-channel Communication**: Chat, voice, video, email, SMS
- **AI Agent Orchestration**: GPT-4 Turbo powered agents with customizable personalities
- **Knowledge Base Management**: Document processing, vector embeddings, semantic search
- **Real-time Messaging**: Sub-100ms latency WebSocket communication
- **CRM Integration**: Contact management, lead tracking, interaction history
- **Analytics & Reporting**: Performance metrics, conversation analytics

---

## 🏗️ Architecture

### Microservices Architecture

The platform follows a microservices architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│              (React 19, Next.js 16, Shadcn/ui)          │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐      ┌─────────▼──────────┐
│   Supabase     │      │  Custom Services   │
│   (BaaS)       │      │  (Performance)    │
│                │      │                    │
│ • Auth         │      │ • Agent Service    │
│ • PostgreSQL   │      │ • Chat Service    │
│ • Storage      │      │ • Knowledge Base   │
│ • Realtime     │      │                    │
└───────┬────────┘      └─────────┬──────────┘
        │                         │
        └────────────┬────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐      ┌─────────▼──────────┐
│   MongoDB      │      │   External APIs   │
│ (Conversations)│      │                    │
│                │      │ • OpenAI           │
│   Redis        │      │ • Pinecone         │
│   (Cache)      │      │ • LiveKit          │
└────────────────┘      └────────────────────┘
```

### Service Overview

#### 1. **Frontend** (Next.js 16)
- **Port**: 3000 (dev), 3001 (prod)
- **Framework**: Next.js 16 with App Router
- **UI Library**: Shadcn/ui + TailwindCSS
- **State Management**: React Query + Zustand
- **Real-time**: Socket.io Client
- **Features**:
  - Dashboard with agent management
  - Real-time chat interface
  - Knowledge base management
  - User profile & settings
  - Responsive design (mobile-first)

#### 2. **Agent Service** (Port 4002)
- **Framework**: Express.js + TypeScript
- **Purpose**: AI orchestration and agent management
- **Key Responsibilities**:
  - Generate AI responses using OpenAI GPT-4 Turbo
  - Manage agent configurations
  - Integrate with Pinecone for knowledge base retrieval
  - Handle LiveKit integration (voice/video)
  - Process file attachments for context
- **Databases**:
  - Supabase PostgreSQL (agent configs)
  - Redis (optional caching)
- **External APIs**:
  - OpenAI API
  - Pinecone (vector search)
  - LiveKit (voice/video)

#### 3. **Chat Service** (Port 4004)
- **Framework**: Express.js + Socket.io + TypeScript
- **Purpose**: Real-time messaging and conversation management
- **Key Responsibilities**:
  - WebSocket connections (Socket.io)
  - Message persistence
  - Conversation management
  - Real-time message delivery
  - Typing indicators
  - Read receipts
  - Message reactions
- **Databases**:
  - MongoDB (conversations, messages)
  - Redis (caching, session management)
- **Performance**:
  - Sub-100ms latency target
  - Response compression (Gzip)
  - Connection pooling
  - Query optimization

#### 4. **Knowledge Base Service** (Port 4005)
- **Framework**: Express.js + TypeScript
- **Purpose**: Document processing and vector embeddings
- **Key Responsibilities**:
  - File upload handling (Supabase Storage)
  - Document extraction (PDF, DOCX, TXT)
  - Text chunking
  - Vector embedding generation (OpenAI)
  - Pinecone vector storage
  - Document search
- **Databases**:
  - Supabase PostgreSQL (document metadata)
  - Pinecone (vector embeddings)
  - Redis (optional queue)
- **Processing**:
  - BullMQ queue for async processing
  - Worker concurrency (2 workers)
  - Timeout protection (5min)
  - Error handling and retries

#### 5. **Shared Package** (`@syntera/shared`)
- **Purpose**: Common utilities and types
- **Contents**:
  - MongoDB models (Conversation, Message)
  - Database utilities (MongoDB, Redis)
  - Logger (Winston)
  - Type definitions
  - Seed scripts

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Shadcn/ui, TailwindCSS
- **State**: React Query v5, Zustand
- **Forms**: React Hook Form + Zod
- **Real-time**: Socket.io Client
- **Styling**: TailwindCSS + CSS Variables
- **Icons**: Lucide React

### Backend Services
- **Runtime**: Node.js 20+ (LTS)
- **Framework**: Express.js
- **Language**: TypeScript 5.9+
- **Real-time**: Socket.io 4.8+
- **Validation**: Zod 4.1+

### Databases
- **PostgreSQL**: Supabase (managed)
  - User accounts, agent configs, CRM data
  - Row Level Security (RLS)
- **MongoDB**: DocumentDB (AWS) or local
  - Conversations, messages (unstructured)
  - High write throughput
- **Redis**: ElastiCache (AWS) or local
  - Caching, session management
  - Rate limiting

### External Services
- **AI**: OpenAI GPT-4 Turbo
- **Vector DB**: Pinecone
- **Voice/Video**: LiveKit
- **Storage**: Supabase Storage
- **Auth**: Supabase Auth

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Orchestration**: AWS ECS (production)
- **IaC**: Terraform
- **CDN**: Cloudflare
- **Monitoring**: Winston (logs), Sentry (errors)

### Development Tools
- **Package Manager**: pnpm 8.15+
- **Build Tool**: TypeScript Compiler (tsc)
- **Dev Server**: tsx (watch mode)
- **Concurrency**: concurrently
- **Linting**: ESLint
- **Formatting**: Prettier

---

## 📁 Project Structure

```
Syntera/
├── frontend/                    # Next.js frontend application
│   ├── app/                     # App Router pages
│   │   ├── api/                 # API routes (proxies)
│   │   ├── auth/                # Auth callbacks
│   │   ├── dashboard/           # Dashboard pages
│   │   └── layout.tsx           # Root layout
│   ├── components/              # React components
│   │   ├── agents/              # Agent management UI
│   │   ├── chat/                # Chat interface
│   │   ├── knowledge-base/     # KB management
│   │   ├── ui/                  # Shadcn/ui components
│   │   └── shared/              # Shared components
│   ├── lib/                     # Utilities and helpers
│   │   ├── api/                 # API clients
│   │   ├── auth/                # Auth utilities
│   │   ├── constants/           # Constants
│   │   ├── schemas/             # Zod schemas
│   │   └── supabase/            # Supabase clients
│   └── public/                  # Static assets
│
├── services/                     # Backend microservices
│   ├── agent/                   # Agent Service (Port 4002)
│   │   ├── src/
│   │   │   ├── routes/          # REST API routes
│   │   │   ├── config/          # Configuration
│   │   │   └── utils/           # Utilities
│   │   ├── dist/                # Compiled JavaScript
│   │   └── package.json
│   │
│   ├── chat/                    # Chat Service (Port 4004)
│   │   ├── src/
│   │   │   ├── handlers/        # Socket.io handlers
│   │   │   ├── routes/          # REST API routes
│   │   │   ├── middleware/      # Express middleware
│   │   │   ├── config/          # Configuration
│   │   │   └── utils/           # Utilities (cache, etc.)
│   │   ├── dist/                # Compiled JavaScript
│   │   └── package.json
│   │
│   └── knowledge-base/          # Knowledge Base Service (Port 4005)
│       ├── src/
│       │   ├── routes/          # REST API routes
│       │   ├── services/        # Business logic
│       │   │   ├── processor.ts # Document processing
│       │   │   ├── extractor.ts # Text extraction
│       │   │   ├── chunker.ts   # Text chunking
│       │   │   ├── embeddings.ts # Vector embeddings
│       │   │   └── pinecone.ts  # Pinecone integration
│       │   ├── config/          # Configuration
│       │   └── utils/           # Utilities
│       ├── dist/                # Compiled JavaScript
│       └── package.json
│
├── shared/                       # Shared package
│   ├── src/
│   │   ├── database/            # DB utilities (MongoDB, Redis)
│   │   ├── models/               # Mongoose models
│   │   ├── logger/               # Winston logger
│   │   └── types/                # TypeScript types
│   ├── dist/                     # Compiled JavaScript
│   └── package.json
│
├── database/                     # Database schemas
│   └── supabase/
│       └── migrations/           # PostgreSQL migrations
│
├── terraform/                    # Infrastructure as Code
│   ├── main.tf                   # Main configuration
│   ├── ecs.tf                    # ECS service definitions
│   ├── databases.tf              # Database resources
│   └── variables.tf              # Variables
│
├── scripts/                      # Utility scripts
│   ├── check-and-seed-mongodb.ts
│   └── setup-infra.ps1
│
├── docs/                         # Documentation
│   ├── SUPABASE_SETUP.md
│   ├── AWS_SETUP.md
│   └── UI_UX_GUIDELINES.md
│
├── docker-compose.yml            # Docker Compose (dev)
├── docker-compose.performance.yml # Docker Compose (optimized)
├── package.json                  # Root package.json
├── HOW_TO_RUN.md                 # Running instructions
├── PROJECT_ROADMAP.md            # Development roadmap
├── ARCHITECTURE.md               # Architecture details
├── TECH_STACK.md                 # Technology stack
└── README.md                     # Project overview
```

---

## 🔄 Data Flow

### Message Flow (Chat)

```
User Input
    ↓
Frontend (Socket.io Client)
    ↓
Chat Service (Socket.io Server)
    ↓
┌─────────────────┬─────────────────┐
│                 │                 │
MongoDB        Agent Service    Redis
(Store)        (AI Response)    (Cache)
    ↓                 ↓
    └────────┬────────┘
             ↓
    Frontend (Real-time Update)
```

### Agent Response Flow

```
User Message
    ↓
Chat Service → Agent Service (HTTP POST)
    ↓
Agent Service:
  1. Retrieve context (last 20 messages)
  2. Search knowledge base (Pinecone)
  3. Process attachments (if any)
  4. Generate prompt
    ↓
OpenAI API (GPT-4 Turbo)
    ↓
Streaming Response
    ↓
Chat Service → Frontend (Socket.io)
    ↓
Store in MongoDB
```

### Document Processing Flow

```
File Upload (Frontend)
    ↓
Supabase Storage
    ↓
Knowledge Base Service
    ↓
Document Extraction (PDF/DOCX/TXT)
    ↓
Text Chunking
    ↓
Generate Embeddings (OpenAI)
    ↓
Store in Pinecone
    ↓
Update Metadata (Supabase PostgreSQL)
```

---

## 🚀 Development Workflow

### Prerequisites
- Node.js 20+
- pnpm 8.15+
- Docker & Docker Compose
- Supabase account
- Environment variables configured

### Quick Start

1. **Install Dependencies**
```bash
pnpm install
```

2. **Build All Services**
```bash
pnpm run build:all
```

3. **Start Docker Services**
```bash
pnpm run docker:up
```

4. **Start All Services (Dev Mode)**
```bash
pnpm run dev:all
```

This starts:
- Chat Service (Port 4004)
- Agent Service (Port 4002)
- Knowledge Base Service (Port 4005)
- Frontend (Port 3000)

### Individual Service Commands

```bash
# Build
pnpm run build:shared    # Build shared package
pnpm run build:chat      # Build chat service
pnpm run build:agent     # Build agent service
pnpm run build:kb        # Build knowledge base service

# Development
pnpm run dev:chat        # Chat service only
pnpm run dev:agent       # Agent service only
pnpm run dev:kb          # Knowledge base service only
pnpm run dev:frontend    # Frontend only

# Docker
pnpm run docker:up       # Start Docker services
pnpm run docker:down     # Stop Docker services
pnpm run docker:logs     # View Docker logs
pnpm run docker:restart  # Restart Docker services
```

### Development Mode

Services use `tsx watch` for hot reload:
- TypeScript files are watched
- Changes trigger automatic rebuild
- Services restart automatically

For faster startup, build services first:
```bash
pnpm run build:all
# Then run dev mode (uses compiled dist/ files)
```

---

## 🔌 Service Communication

### Frontend ↔ Services

**REST API** (via Next.js API Routes):
- `/api/agents/*` → Agent Service
- `/api/chat/*` → Chat Service
- `/api/knowledge-base/*` → Knowledge Base Service

**WebSocket** (Direct):
- Socket.io connection to Chat Service (Port 4004)
- Real-time message delivery
- Typing indicators
- Read receipts

### Service-to-Service

**HTTP REST APIs**:
- Chat Service → Agent Service: `POST /api/responses/generate`
- Frontend → Services: Via Next.js API routes (proxies)

**Shared Package**:
- All services import from `@syntera/shared`
- Common models, utilities, types

### Authentication

**Supabase Auth**:
- JWT tokens for API authentication
- Socket.io authentication via token
- Row Level Security (RLS) in PostgreSQL

---

## 💾 Database Strategy

### PostgreSQL (Supabase)
**Use Cases**:
- User accounts & authentication
- Agent configurations
- Knowledge base document metadata
- CRM data (future)

**Features**:
- Row Level Security (RLS)
- Automatic backups
- Connection pooling
- Real-time subscriptions

### MongoDB
**Use Cases**:
- Conversations (unstructured)
- Messages (high write volume)
- AI metadata (token usage, costs)

**Features**:
- Flexible schema
- High write throughput
- Horizontal scaling
- Document-based storage

### Redis
**Use Cases**:
- API response caching
- Session management
- Rate limiting
- Real-time data

**Features**:
- In-memory storage
- Sub-millisecond latency
- Pub/sub for real-time
- TTL support

### Pinecone
**Use Cases**:
- Vector embeddings storage
- Semantic search
- Knowledge base retrieval

**Features**:
- High-dimensional vectors
- Fast similarity search
- Namespace isolation
- Managed service

---

## ⚡ Performance Optimizations

### Backend

1. **MongoDB Connection Pooling**
   - `maxPoolSize`: 10
   - `minPoolSize`: 5
   - `maxIdleTimeMS`: 30000

2. **Response Compression**
   - Gzip compression enabled
   - Reduces payload size by ~70%

3. **Redis Caching**
   - 30-second TTL for messages
   - Cache invalidation on updates
   - Reduces database load

4. **Database Query Optimization**
   - Field selection (`.select()`)
   - Query limits (`.limit()`)
   - Indexed queries

5. **Request Body Limits**
   - Chat/Agent: 10MB
   - Knowledge Base: 50MB

### Frontend

1. **React Query Caching**
   - `staleTime`: 30s
   - `gcTime`: 5min
   - Request deduplication

2. **Debouncing**
   - Search: 300ms
   - Read receipts: 500ms

3. **Optimistic Updates**
   - Agent CRUD operations
   - Rollback on error

4. **Code Splitting**
   - Dynamic imports
   - Route-based splitting

5. **Image Optimization**
   - Next.js Image component
   - Lazy loading

---

## 🐳 Docker Configuration

### Development (`docker-compose.yml`)
- MongoDB (Port 27017)
- Redis (Port 6379)
- RabbitMQ (Port 5672)

### Performance (`docker-compose.performance.yml`)
- Resource limits (CPU, memory)
- MongoDB WiredTiger cache optimization
- Redis maxmemory configuration
- Connection pooling

---

## 📦 Build System

### TypeScript Compilation
- All services compile to `dist/` folders
- Shared package compiles first
- Services depend on shared package

### Build Order
1. `@syntera/shared` (base package)
2. `@syntera/chat-service`
3. `@syntera/agent-service`
4. `@syntera/knowledge-base-service`

### Production Builds
- Frontend: `next build` → `.next/` folder
- Services: `tsc` → `dist/` folders
- Shared: `tsc` → `dist/` folder

---

## 🔐 Security

### Authentication
- Supabase Auth (JWT tokens)
- Socket.io authentication
- API route protection

### Data Protection
- Row Level Security (RLS) in PostgreSQL
- Environment variables for secrets
- HTTPS in production

### Rate Limiting
- Express rate limiter
- Per-IP limits
- Per-user limits

---

## 📊 Monitoring & Logging

### Logging
- **Winston** logger (file-based)
- Structured JSON logs
- Service-specific log files
- Error tracking

### Error Handling
- Try-catch blocks
- Error boundaries (frontend)
- Graceful degradation
- Error logging

### Performance Monitoring
- Response time tracking
- Database query monitoring
- Cache hit rates
- API usage metrics

---

## 🚢 Deployment

### Development
- Local Docker Compose
- Services run on localhost
- Hot reload enabled

### Production (AWS)
- **ECS**: Container orchestration
- **DocumentDB**: MongoDB-compatible
- **ElastiCache**: Redis
- **Cloudflare**: CDN & DDoS protection
- **Terraform**: Infrastructure as Code

### Environment Variables
- `.env` files for local development
- AWS Secrets Manager (production)
- Supabase environment variables

---

## 📚 Key Documentation

- **[HOW_TO_RUN.md](HOW_TO_RUN.md)**: Running instructions
- **[PROJECT_ROADMAP.md](PROJECT_ROADMAP.md)**: Development phases
- **[ARCHITECTURE.md](ARCHITECTURE.md)**: System architecture
- **[TECH_STACK.md](TECH_STACK.md)**: Technology details
- **[docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)**: Supabase configuration
- **[docs/AWS_SETUP.md](docs/AWS_SETUP.md)**: AWS setup guide

---

## 🎯 Current Status

### Completed ✅
- Authentication & user management
- Agent configuration UI
- Real-time chat interface
- Knowledge base upload & processing
- AI agent responses with context
- File attachments support
- Performance optimizations
- Build system

### In Progress 🚧
- Chat settings page
- Conversation threads
- Load testing
- Response time optimization

### Planned 📋
- Voice & video integration (LiveKit)
- CRM module
- Analytics dashboard
- Workflow automation

---

## 🔄 Version Control

- **Package Manager**: pnpm 8.15+
- **Node.js**: 20+ (LTS)
- **TypeScript**: 5.9+
- **Next.js**: 14.2+
- **React**: 18.3+

---

## 📝 Notes

- All services use TypeScript for type safety
- Shared package must be built before services
- Docker services (MongoDB, Redis) should be running before starting services
- Environment variables must be configured in `.env` files
- Production builds are optimized for performance

---

**Last Updated**: 2025-01-17
**Version**: 0.1.0


## 📋 Overview

**Syntera** is an AI-powered universal agent platform that enables businesses to deploy intelligent voice, video, and chat agents across multiple communication channels. The platform combines real-time communication, AI orchestration, knowledge base management, and CRM integration into a unified SaaS solution.

### Core Capabilities
- **Multi-channel Communication**: Chat, voice, video, email, SMS
- **AI Agent Orchestration**: GPT-4 Turbo powered agents with customizable personalities
- **Knowledge Base Management**: Document processing, vector embeddings, semantic search
- **Real-time Messaging**: Sub-100ms latency WebSocket communication
- **CRM Integration**: Contact management, lead tracking, interaction history
- **Analytics & Reporting**: Performance metrics, conversation analytics

---

## 🏗️ Architecture

### Microservices Architecture

The platform follows a microservices architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│              (React 19, Next.js 16, Shadcn/ui)          │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐      ┌─────────▼──────────┐
│   Supabase     │      │  Custom Services   │
│   (BaaS)       │      │  (Performance)    │
│                │      │                    │
│ • Auth         │      │ • Agent Service    │
│ • PostgreSQL   │      │ • Chat Service    │
│ • Storage      │      │ • Knowledge Base   │
│ • Realtime     │      │                    │
└───────┬────────┘      └─────────┬──────────┘
        │                         │
        └────────────┬────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐      ┌─────────▼──────────┐
│   MongoDB      │      │   External APIs   │
│ (Conversations)│      │                    │
│                │      │ • OpenAI           │
│   Redis        │      │ • Pinecone         │
│   (Cache)      │      │ • LiveKit          │
└────────────────┘      └────────────────────┘
```

### Service Overview

#### 1. **Frontend** (Next.js 16)
- **Port**: 3000 (dev), 3001 (prod)
- **Framework**: Next.js 16 with App Router
- **UI Library**: Shadcn/ui + TailwindCSS
- **State Management**: React Query + Zustand
- **Real-time**: Socket.io Client
- **Features**:
  - Dashboard with agent management
  - Real-time chat interface
  - Knowledge base management
  - User profile & settings
  - Responsive design (mobile-first)

#### 2. **Agent Service** (Port 4002)
- **Framework**: Express.js + TypeScript
- **Purpose**: AI orchestration and agent management
- **Key Responsibilities**:
  - Generate AI responses using OpenAI GPT-4 Turbo
  - Manage agent configurations
  - Integrate with Pinecone for knowledge base retrieval
  - Handle LiveKit integration (voice/video)
  - Process file attachments for context
- **Databases**:
  - Supabase PostgreSQL (agent configs)
  - Redis (optional caching)
- **External APIs**:
  - OpenAI API
  - Pinecone (vector search)
  - LiveKit (voice/video)

#### 3. **Chat Service** (Port 4004)
- **Framework**: Express.js + Socket.io + TypeScript
- **Purpose**: Real-time messaging and conversation management
- **Key Responsibilities**:
  - WebSocket connections (Socket.io)
  - Message persistence
  - Conversation management
  - Real-time message delivery
  - Typing indicators
  - Read receipts
  - Message reactions
- **Databases**:
  - MongoDB (conversations, messages)
  - Redis (caching, session management)
- **Performance**:
  - Sub-100ms latency target
  - Response compression (Gzip)
  - Connection pooling
  - Query optimization

#### 4. **Knowledge Base Service** (Port 4005)
- **Framework**: Express.js + TypeScript
- **Purpose**: Document processing and vector embeddings
- **Key Responsibilities**:
  - File upload handling (Supabase Storage)
  - Document extraction (PDF, DOCX, TXT)
  - Text chunking
  - Vector embedding generation (OpenAI)
  - Pinecone vector storage
  - Document search
- **Databases**:
  - Supabase PostgreSQL (document metadata)
  - Pinecone (vector embeddings)
  - Redis (optional queue)
- **Processing**:
  - BullMQ queue for async processing
  - Worker concurrency (2 workers)
  - Timeout protection (5min)
  - Error handling and retries

#### 5. **Shared Package** (`@syntera/shared`)
- **Purpose**: Common utilities and types
- **Contents**:
  - MongoDB models (Conversation, Message)
  - Database utilities (MongoDB, Redis)
  - Logger (Winston)
  - Type definitions
  - Seed scripts

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Shadcn/ui, TailwindCSS
- **State**: React Query v5, Zustand
- **Forms**: React Hook Form + Zod
- **Real-time**: Socket.io Client
- **Styling**: TailwindCSS + CSS Variables
- **Icons**: Lucide React

### Backend Services
- **Runtime**: Node.js 20+ (LTS)
- **Framework**: Express.js
- **Language**: TypeScript 5.9+
- **Real-time**: Socket.io 4.8+
- **Validation**: Zod 4.1+

### Databases
- **PostgreSQL**: Supabase (managed)
  - User accounts, agent configs, CRM data
  - Row Level Security (RLS)
- **MongoDB**: DocumentDB (AWS) or local
  - Conversations, messages (unstructured)
  - High write throughput
- **Redis**: ElastiCache (AWS) or local
  - Caching, session management
  - Rate limiting

### External Services
- **AI**: OpenAI GPT-4 Turbo
- **Vector DB**: Pinecone
- **Voice/Video**: LiveKit
- **Storage**: Supabase Storage
- **Auth**: Supabase Auth

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Orchestration**: AWS ECS (production)
- **IaC**: Terraform
- **CDN**: Cloudflare
- **Monitoring**: Winston (logs), Sentry (errors)

### Development Tools
- **Package Manager**: pnpm 8.15+
- **Build Tool**: TypeScript Compiler (tsc)
- **Dev Server**: tsx (watch mode)
- **Concurrency**: concurrently
- **Linting**: ESLint
- **Formatting**: Prettier

---

## 📁 Project Structure

```
Syntera/
├── frontend/                    # Next.js frontend application
│   ├── app/                     # App Router pages
│   │   ├── api/                 # API routes (proxies)
│   │   ├── auth/                # Auth callbacks
│   │   ├── dashboard/           # Dashboard pages
│   │   └── layout.tsx           # Root layout
│   ├── components/              # React components
│   │   ├── agents/              # Agent management UI
│   │   ├── chat/                # Chat interface
│   │   ├── knowledge-base/     # KB management
│   │   ├── ui/                  # Shadcn/ui components
│   │   └── shared/              # Shared components
│   ├── lib/                     # Utilities and helpers
│   │   ├── api/                 # API clients
│   │   ├── auth/                # Auth utilities
│   │   ├── constants/           # Constants
│   │   ├── schemas/             # Zod schemas
│   │   └── supabase/            # Supabase clients
│   └── public/                  # Static assets
│
├── services/                     # Backend microservices
│   ├── agent/                   # Agent Service (Port 4002)
│   │   ├── src/
│   │   │   ├── routes/          # REST API routes
│   │   │   ├── config/          # Configuration
│   │   │   └── utils/           # Utilities
│   │   ├── dist/                # Compiled JavaScript
│   │   └── package.json
│   │
│   ├── chat/                    # Chat Service (Port 4004)
│   │   ├── src/
│   │   │   ├── handlers/        # Socket.io handlers
│   │   │   ├── routes/          # REST API routes
│   │   │   ├── middleware/      # Express middleware
│   │   │   ├── config/          # Configuration
│   │   │   └── utils/           # Utilities (cache, etc.)
│   │   ├── dist/                # Compiled JavaScript
│   │   └── package.json
│   │
│   └── knowledge-base/          # Knowledge Base Service (Port 4005)
│       ├── src/
│       │   ├── routes/          # REST API routes
│       │   ├── services/        # Business logic
│       │   │   ├── processor.ts # Document processing
│       │   │   ├── extractor.ts # Text extraction
│       │   │   ├── chunker.ts   # Text chunking
│       │   │   ├── embeddings.ts # Vector embeddings
│       │   │   └── pinecone.ts  # Pinecone integration
│       │   ├── config/          # Configuration
│       │   └── utils/           # Utilities
│       ├── dist/                # Compiled JavaScript
│       └── package.json
│
├── shared/                       # Shared package
│   ├── src/
│   │   ├── database/            # DB utilities (MongoDB, Redis)
│   │   ├── models/               # Mongoose models
│   │   ├── logger/               # Winston logger
│   │   └── types/                # TypeScript types
│   ├── dist/                     # Compiled JavaScript
│   └── package.json
│
├── database/                     # Database schemas
│   └── supabase/
│       └── migrations/           # PostgreSQL migrations
│
├── terraform/                    # Infrastructure as Code
│   ├── main.tf                   # Main configuration
│   ├── ecs.tf                    # ECS service definitions
│   ├── databases.tf              # Database resources
│   └── variables.tf              # Variables
│
├── scripts/                      # Utility scripts
│   ├── check-and-seed-mongodb.ts
│   └── setup-infra.ps1
│
├── docs/                         # Documentation
│   ├── SUPABASE_SETUP.md
│   ├── AWS_SETUP.md
│   └── UI_UX_GUIDELINES.md
│
├── docker-compose.yml            # Docker Compose (dev)
├── docker-compose.performance.yml # Docker Compose (optimized)
├── package.json                  # Root package.json
├── HOW_TO_RUN.md                 # Running instructions
├── PROJECT_ROADMAP.md            # Development roadmap
├── ARCHITECTURE.md               # Architecture details
├── TECH_STACK.md                 # Technology stack
└── README.md                     # Project overview
```

---

## 🔄 Data Flow

### Message Flow (Chat)

```
User Input
    ↓
Frontend (Socket.io Client)
    ↓
Chat Service (Socket.io Server)
    ↓
┌─────────────────┬─────────────────┐
│                 │                 │
MongoDB        Agent Service    Redis
(Store)        (AI Response)    (Cache)
    ↓                 ↓
    └────────┬────────┘
             ↓
    Frontend (Real-time Update)
```

### Agent Response Flow

```
User Message
    ↓
Chat Service → Agent Service (HTTP POST)
    ↓
Agent Service:
  1. Retrieve context (last 20 messages)
  2. Search knowledge base (Pinecone)
  3. Process attachments (if any)
  4. Generate prompt
    ↓
OpenAI API (GPT-4 Turbo)
    ↓
Streaming Response
    ↓
Chat Service → Frontend (Socket.io)
    ↓
Store in MongoDB
```

### Document Processing Flow

```
File Upload (Frontend)
    ↓
Supabase Storage
    ↓
Knowledge Base Service
    ↓
Document Extraction (PDF/DOCX/TXT)
    ↓
Text Chunking
    ↓
Generate Embeddings (OpenAI)
    ↓
Store in Pinecone
    ↓
Update Metadata (Supabase PostgreSQL)
```

---

## 🚀 Development Workflow

### Prerequisites
- Node.js 20+
- pnpm 8.15+
- Docker & Docker Compose
- Supabase account
- Environment variables configured

### Quick Start

1. **Install Dependencies**
```bash
pnpm install
```

2. **Build All Services**
```bash
pnpm run build:all
```

3. **Start Docker Services**
```bash
pnpm run docker:up
```

4. **Start All Services (Dev Mode)**
```bash
pnpm run dev:all
```

This starts:
- Chat Service (Port 4004)
- Agent Service (Port 4002)
- Knowledge Base Service (Port 4005)
- Frontend (Port 3000)

### Individual Service Commands

```bash
# Build
pnpm run build:shared    # Build shared package
pnpm run build:chat      # Build chat service
pnpm run build:agent     # Build agent service
pnpm run build:kb        # Build knowledge base service

# Development
pnpm run dev:chat        # Chat service only
pnpm run dev:agent       # Agent service only
pnpm run dev:kb          # Knowledge base service only
pnpm run dev:frontend    # Frontend only

# Docker
pnpm run docker:up       # Start Docker services
pnpm run docker:down     # Stop Docker services
pnpm run docker:logs     # View Docker logs
pnpm run docker:restart  # Restart Docker services
```

### Development Mode

Services use `tsx watch` for hot reload:
- TypeScript files are watched
- Changes trigger automatic rebuild
- Services restart automatically

For faster startup, build services first:
```bash
pnpm run build:all
# Then run dev mode (uses compiled dist/ files)
```

---

## 🔌 Service Communication

### Frontend ↔ Services

**REST API** (via Next.js API Routes):
- `/api/agents/*` → Agent Service
- `/api/chat/*` → Chat Service
- `/api/knowledge-base/*` → Knowledge Base Service

**WebSocket** (Direct):
- Socket.io connection to Chat Service (Port 4004)
- Real-time message delivery
- Typing indicators
- Read receipts

### Service-to-Service

**HTTP REST APIs**:
- Chat Service → Agent Service: `POST /api/responses/generate`
- Frontend → Services: Via Next.js API routes (proxies)

**Shared Package**:
- All services import from `@syntera/shared`
- Common models, utilities, types

### Authentication

**Supabase Auth**:
- JWT tokens for API authentication
- Socket.io authentication via token
- Row Level Security (RLS) in PostgreSQL

---

## 💾 Database Strategy

### PostgreSQL (Supabase)
**Use Cases**:
- User accounts & authentication
- Agent configurations
- Knowledge base document metadata
- CRM data (future)

**Features**:
- Row Level Security (RLS)
- Automatic backups
- Connection pooling
- Real-time subscriptions

### MongoDB
**Use Cases**:
- Conversations (unstructured)
- Messages (high write volume)
- AI metadata (token usage, costs)

**Features**:
- Flexible schema
- High write throughput
- Horizontal scaling
- Document-based storage

### Redis
**Use Cases**:
- API response caching
- Session management
- Rate limiting
- Real-time data

**Features**:
- In-memory storage
- Sub-millisecond latency
- Pub/sub for real-time
- TTL support

### Pinecone
**Use Cases**:
- Vector embeddings storage
- Semantic search
- Knowledge base retrieval

**Features**:
- High-dimensional vectors
- Fast similarity search
- Namespace isolation
- Managed service

---

## ⚡ Performance Optimizations

### Backend

1. **MongoDB Connection Pooling**
   - `maxPoolSize`: 10
   - `minPoolSize`: 5
   - `maxIdleTimeMS`: 30000

2. **Response Compression**
   - Gzip compression enabled
   - Reduces payload size by ~70%

3. **Redis Caching**
   - 30-second TTL for messages
   - Cache invalidation on updates
   - Reduces database load

4. **Database Query Optimization**
   - Field selection (`.select()`)
   - Query limits (`.limit()`)
   - Indexed queries

5. **Request Body Limits**
   - Chat/Agent: 10MB
   - Knowledge Base: 50MB

### Frontend

1. **React Query Caching**
   - `staleTime`: 30s
   - `gcTime`: 5min
   - Request deduplication

2. **Debouncing**
   - Search: 300ms
   - Read receipts: 500ms

3. **Optimistic Updates**
   - Agent CRUD operations
   - Rollback on error

4. **Code Splitting**
   - Dynamic imports
   - Route-based splitting

5. **Image Optimization**
   - Next.js Image component
   - Lazy loading

---

## 🐳 Docker Configuration

### Development (`docker-compose.yml`)
- MongoDB (Port 27017)
- Redis (Port 6379)
- RabbitMQ (Port 5672)

### Performance (`docker-compose.performance.yml`)
- Resource limits (CPU, memory)
- MongoDB WiredTiger cache optimization
- Redis maxmemory configuration
- Connection pooling

---

## 📦 Build System

### TypeScript Compilation
- All services compile to `dist/` folders
- Shared package compiles first
- Services depend on shared package

### Build Order
1. `@syntera/shared` (base package)
2. `@syntera/chat-service`
3. `@syntera/agent-service`
4. `@syntera/knowledge-base-service`

### Production Builds
- Frontend: `next build` → `.next/` folder
- Services: `tsc` → `dist/` folders
- Shared: `tsc` → `dist/` folder

---

## 🔐 Security

### Authentication
- Supabase Auth (JWT tokens)
- Socket.io authentication
- API route protection

### Data Protection
- Row Level Security (RLS) in PostgreSQL
- Environment variables for secrets
- HTTPS in production

### Rate Limiting
- Express rate limiter
- Per-IP limits
- Per-user limits

---

## 📊 Monitoring & Logging

### Logging
- **Winston** logger (file-based)
- Structured JSON logs
- Service-specific log files
- Error tracking

### Error Handling
- Try-catch blocks
- Error boundaries (frontend)
- Graceful degradation
- Error logging

### Performance Monitoring
- Response time tracking
- Database query monitoring
- Cache hit rates
- API usage metrics

---

## 🚢 Deployment

### Development
- Local Docker Compose
- Services run on localhost
- Hot reload enabled

### Production (AWS)
- **ECS**: Container orchestration
- **DocumentDB**: MongoDB-compatible
- **ElastiCache**: Redis
- **Cloudflare**: CDN & DDoS protection
- **Terraform**: Infrastructure as Code

### Environment Variables
- `.env` files for local development
- AWS Secrets Manager (production)
- Supabase environment variables

---

## 📚 Key Documentation

- **[HOW_TO_RUN.md](HOW_TO_RUN.md)**: Running instructions
- **[PROJECT_ROADMAP.md](PROJECT_ROADMAP.md)**: Development phases
- **[ARCHITECTURE.md](ARCHITECTURE.md)**: System architecture
- **[TECH_STACK.md](TECH_STACK.md)**: Technology details
- **[docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)**: Supabase configuration
- **[docs/AWS_SETUP.md](docs/AWS_SETUP.md)**: AWS setup guide

---

## 🎯 Current Status

### Completed ✅
- Authentication & user management
- Agent configuration UI
- Real-time chat interface
- Knowledge base upload & processing
- AI agent responses with context
- File attachments support
- Performance optimizations
- Build system

### In Progress 🚧
- Chat settings page
- Conversation threads
- Load testing
- Response time optimization

### Planned 📋
- Voice & video integration (LiveKit)
- CRM module
- Analytics dashboard
- Workflow automation

---

## 🔄 Version Control

- **Package Manager**: pnpm 8.15+
- **Node.js**: 20+ (LTS)
- **TypeScript**: 5.9+
- **Next.js**: 14.2+
- **React**: 18.3+

---

## 📝 Notes

- All services use TypeScript for type safety
- Shared package must be built before services
- Docker services (MongoDB, Redis) should be running before starting services
- Environment variables must be configured in `.env` files
- Production builds are optimized for performance

---

**Last Updated**: 2025-01-17
**Version**: 0.1.0


## 📋 Overview

**Syntera** is an AI-powered universal agent platform that enables businesses to deploy intelligent voice, video, and chat agents across multiple communication channels. The platform combines real-time communication, AI orchestration, knowledge base management, and CRM integration into a unified SaaS solution.

### Core Capabilities
- **Multi-channel Communication**: Chat, voice, video, email, SMS
- **AI Agent Orchestration**: GPT-4 Turbo powered agents with customizable personalities
- **Knowledge Base Management**: Document processing, vector embeddings, semantic search
- **Real-time Messaging**: Sub-100ms latency WebSocket communication
- **CRM Integration**: Contact management, lead tracking, interaction history
- **Analytics & Reporting**: Performance metrics, conversation analytics

---

## 🏗️ Architecture

### Microservices Architecture

The platform follows a microservices architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│              (React 19, Next.js 16, Shadcn/ui)          │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐      ┌─────────▼──────────┐
│   Supabase     │      │  Custom Services   │
│   (BaaS)       │      │  (Performance)    │
│                │      │                    │
│ • Auth         │      │ • Agent Service    │
│ • PostgreSQL   │      │ • Chat Service    │
│ • Storage      │      │ • Knowledge Base   │
│ • Realtime     │      │                    │
└───────┬────────┘      └─────────┬──────────┘
        │                         │
        └────────────┬────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐      ┌─────────▼──────────┐
│   MongoDB      │      │   External APIs   │
│ (Conversations)│      │                    │
│                │      │ • OpenAI           │
│   Redis        │      │ • Pinecone         │
│   (Cache)      │      │ • LiveKit          │
└────────────────┘      └────────────────────┘
```

### Service Overview

#### 1. **Frontend** (Next.js 16)
- **Port**: 3000 (dev), 3001 (prod)
- **Framework**: Next.js 16 with App Router
- **UI Library**: Shadcn/ui + TailwindCSS
- **State Management**: React Query + Zustand
- **Real-time**: Socket.io Client
- **Features**:
  - Dashboard with agent management
  - Real-time chat interface
  - Knowledge base management
  - User profile & settings
  - Responsive design (mobile-first)

#### 2. **Agent Service** (Port 4002)
- **Framework**: Express.js + TypeScript
- **Purpose**: AI orchestration and agent management
- **Key Responsibilities**:
  - Generate AI responses using OpenAI GPT-4 Turbo
  - Manage agent configurations
  - Integrate with Pinecone for knowledge base retrieval
  - Handle LiveKit integration (voice/video)
  - Process file attachments for context
- **Databases**:
  - Supabase PostgreSQL (agent configs)
  - Redis (optional caching)
- **External APIs**:
  - OpenAI API
  - Pinecone (vector search)
  - LiveKit (voice/video)

#### 3. **Chat Service** (Port 4004)
- **Framework**: Express.js + Socket.io + TypeScript
- **Purpose**: Real-time messaging and conversation management
- **Key Responsibilities**:
  - WebSocket connections (Socket.io)
  - Message persistence
  - Conversation management
  - Real-time message delivery
  - Typing indicators
  - Read receipts
  - Message reactions
- **Databases**:
  - MongoDB (conversations, messages)
  - Redis (caching, session management)
- **Performance**:
  - Sub-100ms latency target
  - Response compression (Gzip)
  - Connection pooling
  - Query optimization

#### 4. **Knowledge Base Service** (Port 4005)
- **Framework**: Express.js + TypeScript
- **Purpose**: Document processing and vector embeddings
- **Key Responsibilities**:
  - File upload handling (Supabase Storage)
  - Document extraction (PDF, DOCX, TXT)
  - Text chunking
  - Vector embedding generation (OpenAI)
  - Pinecone vector storage
  - Document search
- **Databases**:
  - Supabase PostgreSQL (document metadata)
  - Pinecone (vector embeddings)
  - Redis (optional queue)
- **Processing**:
  - BullMQ queue for async processing
  - Worker concurrency (2 workers)
  - Timeout protection (5min)
  - Error handling and retries

#### 5. **Shared Package** (`@syntera/shared`)
- **Purpose**: Common utilities and types
- **Contents**:
  - MongoDB models (Conversation, Message)
  - Database utilities (MongoDB, Redis)
  - Logger (Winston)
  - Type definitions
  - Seed scripts

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Shadcn/ui, TailwindCSS
- **State**: React Query v5, Zustand
- **Forms**: React Hook Form + Zod
- **Real-time**: Socket.io Client
- **Styling**: TailwindCSS + CSS Variables
- **Icons**: Lucide React

### Backend Services
- **Runtime**: Node.js 20+ (LTS)
- **Framework**: Express.js
- **Language**: TypeScript 5.9+
- **Real-time**: Socket.io 4.8+
- **Validation**: Zod 4.1+

### Databases
- **PostgreSQL**: Supabase (managed)
  - User accounts, agent configs, CRM data
  - Row Level Security (RLS)
- **MongoDB**: DocumentDB (AWS) or local
  - Conversations, messages (unstructured)
  - High write throughput
- **Redis**: ElastiCache (AWS) or local
  - Caching, session management
  - Rate limiting

### External Services
- **AI**: OpenAI GPT-4 Turbo
- **Vector DB**: Pinecone
- **Voice/Video**: LiveKit
- **Storage**: Supabase Storage
- **Auth**: Supabase Auth

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Orchestration**: AWS ECS (production)
- **IaC**: Terraform
- **CDN**: Cloudflare
- **Monitoring**: Winston (logs), Sentry (errors)

### Development Tools
- **Package Manager**: pnpm 8.15+
- **Build Tool**: TypeScript Compiler (tsc)
- **Dev Server**: tsx (watch mode)
- **Concurrency**: concurrently
- **Linting**: ESLint
- **Formatting**: Prettier

---

## 📁 Project Structure

```
Syntera/
├── frontend/                    # Next.js frontend application
│   ├── app/                     # App Router pages
│   │   ├── api/                 # API routes (proxies)
│   │   ├── auth/                # Auth callbacks
│   │   ├── dashboard/           # Dashboard pages
│   │   └── layout.tsx           # Root layout
│   ├── components/              # React components
│   │   ├── agents/              # Agent management UI
│   │   ├── chat/                # Chat interface
│   │   ├── knowledge-base/     # KB management
│   │   ├── ui/                  # Shadcn/ui components
│   │   └── shared/              # Shared components
│   ├── lib/                     # Utilities and helpers
│   │   ├── api/                 # API clients
│   │   ├── auth/                # Auth utilities
│   │   ├── constants/           # Constants
│   │   ├── schemas/             # Zod schemas
│   │   └── supabase/            # Supabase clients
│   └── public/                  # Static assets
│
├── services/                     # Backend microservices
│   ├── agent/                   # Agent Service (Port 4002)
│   │   ├── src/
│   │   │   ├── routes/          # REST API routes
│   │   │   ├── config/          # Configuration
│   │   │   └── utils/           # Utilities
│   │   ├── dist/                # Compiled JavaScript
│   │   └── package.json
│   │
│   ├── chat/                    # Chat Service (Port 4004)
│   │   ├── src/
│   │   │   ├── handlers/        # Socket.io handlers
│   │   │   ├── routes/          # REST API routes
│   │   │   ├── middleware/      # Express middleware
│   │   │   ├── config/          # Configuration
│   │   │   └── utils/           # Utilities (cache, etc.)
│   │   ├── dist/                # Compiled JavaScript
│   │   └── package.json
│   │
│   └── knowledge-base/          # Knowledge Base Service (Port 4005)
│       ├── src/
│       │   ├── routes/          # REST API routes
│       │   ├── services/        # Business logic
│       │   │   ├── processor.ts # Document processing
│       │   │   ├── extractor.ts # Text extraction
│       │   │   ├── chunker.ts   # Text chunking
│       │   │   ├── embeddings.ts # Vector embeddings
│       │   │   └── pinecone.ts  # Pinecone integration
│       │   ├── config/          # Configuration
│       │   └── utils/           # Utilities
│       ├── dist/                # Compiled JavaScript
│       └── package.json
│
├── shared/                       # Shared package
│   ├── src/
│   │   ├── database/            # DB utilities (MongoDB, Redis)
│   │   ├── models/               # Mongoose models
│   │   ├── logger/               # Winston logger
│   │   └── types/                # TypeScript types
│   ├── dist/                     # Compiled JavaScript
│   └── package.json
│
├── database/                     # Database schemas
│   └── supabase/
│       └── migrations/           # PostgreSQL migrations
│
├── terraform/                    # Infrastructure as Code
│   ├── main.tf                   # Main configuration
│   ├── ecs.tf                    # ECS service definitions
│   ├── databases.tf              # Database resources
│   └── variables.tf              # Variables
│
├── scripts/                      # Utility scripts
│   ├── check-and-seed-mongodb.ts
│   └── setup-infra.ps1
│
├── docs/                         # Documentation
│   ├── SUPABASE_SETUP.md
│   ├── AWS_SETUP.md
│   └── UI_UX_GUIDELINES.md
│
├── docker-compose.yml            # Docker Compose (dev)
├── docker-compose.performance.yml # Docker Compose (optimized)
├── package.json                  # Root package.json
├── HOW_TO_RUN.md                 # Running instructions
├── PROJECT_ROADMAP.md            # Development roadmap
├── ARCHITECTURE.md               # Architecture details
├── TECH_STACK.md                 # Technology stack
└── README.md                     # Project overview
```

---

## 🔄 Data Flow

### Message Flow (Chat)

```
User Input
    ↓
Frontend (Socket.io Client)
    ↓
Chat Service (Socket.io Server)
    ↓
┌─────────────────┬─────────────────┐
│                 │                 │
MongoDB        Agent Service    Redis
(Store)        (AI Response)    (Cache)
    ↓                 ↓
    └────────┬────────┘
             ↓
    Frontend (Real-time Update)
```

### Agent Response Flow

```
User Message
    ↓
Chat Service → Agent Service (HTTP POST)
    ↓
Agent Service:
  1. Retrieve context (last 20 messages)
  2. Search knowledge base (Pinecone)
  3. Process attachments (if any)
  4. Generate prompt
    ↓
OpenAI API (GPT-4 Turbo)
    ↓
Streaming Response
    ↓
Chat Service → Frontend (Socket.io)
    ↓
Store in MongoDB
```

### Document Processing Flow

```
File Upload (Frontend)
    ↓
Supabase Storage
    ↓
Knowledge Base Service
    ↓
Document Extraction (PDF/DOCX/TXT)
    ↓
Text Chunking
    ↓
Generate Embeddings (OpenAI)
    ↓
Store in Pinecone
    ↓
Update Metadata (Supabase PostgreSQL)
```

---

## 🚀 Development Workflow

### Prerequisites
- Node.js 20+
- pnpm 8.15+
- Docker & Docker Compose
- Supabase account
- Environment variables configured

### Quick Start

1. **Install Dependencies**
```bash
pnpm install
```

2. **Build All Services**
```bash
pnpm run build:all
```

3. **Start Docker Services**
```bash
pnpm run docker:up
```

4. **Start All Services (Dev Mode)**
```bash
pnpm run dev:all
```

This starts:
- Chat Service (Port 4004)
- Agent Service (Port 4002)
- Knowledge Base Service (Port 4005)
- Frontend (Port 3000)

### Individual Service Commands

```bash
# Build
pnpm run build:shared    # Build shared package
pnpm run build:chat      # Build chat service
pnpm run build:agent     # Build agent service
pnpm run build:kb        # Build knowledge base service

# Development
pnpm run dev:chat        # Chat service only
pnpm run dev:agent       # Agent service only
pnpm run dev:kb          # Knowledge base service only
pnpm run dev:frontend    # Frontend only

# Docker
pnpm run docker:up       # Start Docker services
pnpm run docker:down     # Stop Docker services
pnpm run docker:logs     # View Docker logs
pnpm run docker:restart  # Restart Docker services
```

### Development Mode

Services use `tsx watch` for hot reload:
- TypeScript files are watched
- Changes trigger automatic rebuild
- Services restart automatically

For faster startup, build services first:
```bash
pnpm run build:all
# Then run dev mode (uses compiled dist/ files)
```

---

## 🔌 Service Communication

### Frontend ↔ Services

**REST API** (via Next.js API Routes):
- `/api/agents/*` → Agent Service
- `/api/chat/*` → Chat Service
- `/api/knowledge-base/*` → Knowledge Base Service

**WebSocket** (Direct):
- Socket.io connection to Chat Service (Port 4004)
- Real-time message delivery
- Typing indicators
- Read receipts

### Service-to-Service

**HTTP REST APIs**:
- Chat Service → Agent Service: `POST /api/responses/generate`
- Frontend → Services: Via Next.js API routes (proxies)

**Shared Package**:
- All services import from `@syntera/shared`
- Common models, utilities, types

### Authentication

**Supabase Auth**:
- JWT tokens for API authentication
- Socket.io authentication via token
- Row Level Security (RLS) in PostgreSQL

---

## 💾 Database Strategy

### PostgreSQL (Supabase)
**Use Cases**:
- User accounts & authentication
- Agent configurations
- Knowledge base document metadata
- CRM data (future)

**Features**:
- Row Level Security (RLS)
- Automatic backups
- Connection pooling
- Real-time subscriptions

### MongoDB
**Use Cases**:
- Conversations (unstructured)
- Messages (high write volume)
- AI metadata (token usage, costs)

**Features**:
- Flexible schema
- High write throughput
- Horizontal scaling
- Document-based storage

### Redis
**Use Cases**:
- API response caching
- Session management
- Rate limiting
- Real-time data

**Features**:
- In-memory storage
- Sub-millisecond latency
- Pub/sub for real-time
- TTL support

### Pinecone
**Use Cases**:
- Vector embeddings storage
- Semantic search
- Knowledge base retrieval

**Features**:
- High-dimensional vectors
- Fast similarity search
- Namespace isolation
- Managed service

---

## ⚡ Performance Optimizations

### Backend

1. **MongoDB Connection Pooling**
   - `maxPoolSize`: 10
   - `minPoolSize`: 5
   - `maxIdleTimeMS`: 30000

2. **Response Compression**
   - Gzip compression enabled
   - Reduces payload size by ~70%

3. **Redis Caching**
   - 30-second TTL for messages
   - Cache invalidation on updates
   - Reduces database load

4. **Database Query Optimization**
   - Field selection (`.select()`)
   - Query limits (`.limit()`)
   - Indexed queries

5. **Request Body Limits**
   - Chat/Agent: 10MB
   - Knowledge Base: 50MB

### Frontend

1. **React Query Caching**
   - `staleTime`: 30s
   - `gcTime`: 5min
   - Request deduplication

2. **Debouncing**
   - Search: 300ms
   - Read receipts: 500ms

3. **Optimistic Updates**
   - Agent CRUD operations
   - Rollback on error

4. **Code Splitting**
   - Dynamic imports
   - Route-based splitting

5. **Image Optimization**
   - Next.js Image component
   - Lazy loading

---

## 🐳 Docker Configuration

### Development (`docker-compose.yml`)
- MongoDB (Port 27017)
- Redis (Port 6379)
- RabbitMQ (Port 5672)

### Performance (`docker-compose.performance.yml`)
- Resource limits (CPU, memory)
- MongoDB WiredTiger cache optimization
- Redis maxmemory configuration
- Connection pooling

---

## 📦 Build System

### TypeScript Compilation
- All services compile to `dist/` folders
- Shared package compiles first
- Services depend on shared package

### Build Order
1. `@syntera/shared` (base package)
2. `@syntera/chat-service`
3. `@syntera/agent-service`
4. `@syntera/knowledge-base-service`

### Production Builds
- Frontend: `next build` → `.next/` folder
- Services: `tsc` → `dist/` folders
- Shared: `tsc` → `dist/` folder

---

## 🔐 Security

### Authentication
- Supabase Auth (JWT tokens)
- Socket.io authentication
- API route protection

### Data Protection
- Row Level Security (RLS) in PostgreSQL
- Environment variables for secrets
- HTTPS in production

### Rate Limiting
- Express rate limiter
- Per-IP limits
- Per-user limits

---

## 📊 Monitoring & Logging

### Logging
- **Winston** logger (file-based)
- Structured JSON logs
- Service-specific log files
- Error tracking

### Error Handling
- Try-catch blocks
- Error boundaries (frontend)
- Graceful degradation
- Error logging

### Performance Monitoring
- Response time tracking
- Database query monitoring
- Cache hit rates
- API usage metrics

---

## 🚢 Deployment

### Development
- Local Docker Compose
- Services run on localhost
- Hot reload enabled

### Production (AWS)
- **ECS**: Container orchestration
- **DocumentDB**: MongoDB-compatible
- **ElastiCache**: Redis
- **Cloudflare**: CDN & DDoS protection
- **Terraform**: Infrastructure as Code

### Environment Variables
- `.env` files for local development
- AWS Secrets Manager (production)
- Supabase environment variables

---

## 📚 Key Documentation

- **[HOW_TO_RUN.md](HOW_TO_RUN.md)**: Running instructions
- **[PROJECT_ROADMAP.md](PROJECT_ROADMAP.md)**: Development phases
- **[ARCHITECTURE.md](ARCHITECTURE.md)**: System architecture
- **[TECH_STACK.md](TECH_STACK.md)**: Technology details
- **[docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)**: Supabase configuration
- **[docs/AWS_SETUP.md](docs/AWS_SETUP.md)**: AWS setup guide

---

## 🎯 Current Status

### Completed ✅
- Authentication & user management
- Agent configuration UI
- Real-time chat interface
- Knowledge base upload & processing
- AI agent responses with context
- File attachments support
- Performance optimizations
- Build system

### In Progress 🚧
- Chat settings page
- Conversation threads
- Load testing
- Response time optimization

### Planned 📋
- Voice & video integration (LiveKit)
- CRM module
- Analytics dashboard
- Workflow automation

---

## 🔄 Version Control

- **Package Manager**: pnpm 8.15+
- **Node.js**: 20+ (LTS)
- **TypeScript**: 5.9+
- **Next.js**: 14.2+
- **React**: 18.3+

---

## 📝 Notes

- All services use TypeScript for type safety
- Shared package must be built before services
- Docker services (MongoDB, Redis) should be running before starting services
- Environment variables must be configured in `.env` files
- Production builds are optimized for performance

---

**Last Updated**: 2025-01-17
**Version**: 0.1.0













