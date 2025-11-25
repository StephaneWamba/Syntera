# Syntera - AI-Powered Universal Agent Platform

Modern SaaS platform for AI-powered voice/video agents with multi-channel communication.

## Project Structure

```
Syntera/
├── frontend/          # Next.js 16 frontend
├── services/          # Backend microservices
│   ├── agent/        # Agent Service (Port 4002)
│   └── chat/         # Chat Service (Port 4004)
├── shared/           # Shared types and utilities
├── database/         # Database schemas and migrations
│   └── supabase/    # PostgreSQL migrations
├── terraform/        # AWS infrastructure as code
├── scripts/          # Utility scripts
└── docs/            # Documentation
```

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose (for local services)
- AWS CLI configured
- Supabase account

### 1. Clone and Install

```bash
# Install root dependencies
pnpm install

# Install frontend dependencies
cd frontend
pnpm install

# Install service dependencies
cd ../services/agent
pnpm install

cd ../chat
pnpm install

cd ../../shared
pnpm install
```

### 2. Environment Setup

```bash
# Copy environment examples
cp .env.example .env
cp frontend/.env.local.example frontend/.env.local

# Fill in your credentials
# - Supabase URL and keys
# - Database connection strings
# - API keys (OpenAI, LiveKit, Pinecone)
```

### 3. Supabase Setup

1. Create Supabase project at [supabase.com](https://supabase.com)
2. Run migrations from `database/supabase/migrations/`
3. Configure OAuth providers (Google, GitHub)
4. Set up storage buckets

See [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) for details.

### 4. Start Development

```bash
# Start frontend
cd frontend
pnpm dev

# Start services (in separate terminals)
cd services/agent
pnpm dev

cd services/chat
pnpm dev

# Or use Docker Compose
docker-compose up
```

## Deployment

### Quick Deploy (CLI)

**Frontend (Vercel):**
```bash
cd frontend
vercel login
vercel link
vercel --prod
```

**Backend Services (Railway):**
```bash
cd services/agent
railway login
railway init --name agent-service
railway up
```

**See:** [docs/DEPLOYMENT_GUIDE_CLI.md](docs/DEPLOYMENT_GUIDE_CLI.md) for complete guide

### Infrastructure (AWS - Optional)

Infrastructure is managed with Terraform:

```bash
cd terraform

# Initial setup
.\scripts\setup-infra.ps1

# Deploy infrastructure
terraform apply

# Pause infrastructure (save costs)
.\scripts\pause-infra.ps1

# Resume infrastructure
.\scripts\resume-infra.ps1
```

See [terraform/README.md](terraform/README.md) for details.

## Documentation

- [UI/UX Guidelines](docs/UI_UX_GUIDELINES.md) - Design system and best practices
- [Supabase Setup](docs/SUPABASE_SETUP.md) - Database and auth configuration
- [AWS Setup](docs/AWS_SETUP.md) - AWS CLI and credentials
- [Architecture](ARCHITECTURE.md) - System architecture
- [Tech Stack](TECH_STACK.md) - Complete technology stack
- [Project Roadmap](PROJECT_ROADMAP.md) - Development phases

## Tech Stack

- **Frontend**: Next.js 16, React 19, Shadcn/ui, TailwindCSS
- **Backend**: Node.js, Express.js, TypeScript
- **Databases**: Supabase PostgreSQL, MongoDB, Redis
- **AI**: OpenAI GPT-4 Turbo, Pinecone, LiveKit
- **Infrastructure**: AWS (ECS, DocumentDB, ElastiCache), Terraform
- **BaaS**: Supabase (Auth, Database, Storage)

## Development

### Services

- **Agent Service** (Port 4002): AI orchestration, LiveKit, OpenAI
- **Chat Service** (Port 4004): Real-time chat, Socket.io, MongoDB

### Scripts

```bash
# Frontend
cd frontend
pnpm dev          # Development server
pnpm build        # Production build
pnpm start        # Production server

# Services
cd services/agent
pnpm dev          # Development with hot reload
pnpm build        # Build TypeScript
pnpm start        # Production server
```

## License

Private - All rights reserved
