# AGENTS.md

A guide for AI coding assistants working on the Syntera project.

## Project Overview

Syntera is an AI-powered universal agent platform that provides multi-channel communication (voice, video, chat) with AI agents. The platform uses a microservices architecture with a Next.js frontend and multiple backend services.

**Key Features:**
- Real-time voice/video calls via LiveKit
- Real-time chat via Socket.io
- AI agent orchestration with OpenAI
- Knowledge base with vector search (Pinecone)
- CRM integration
- Conversation transcription (text messages stored)

## Architecture

### Project Structure

```
Syntera/
├── frontend/              # Next.js 16 frontend (App Router)
├── services/              # Backend microservices
│   ├── agent/            # Agent Service (Port 4002) - Node.js/TypeScript
│   ├── chat/             # Chat Service (Port 4004) - Node.js/TypeScript
│   ├── knowledge-base/   # Knowledge Base Service (Port 4005) - Node.js/TypeScript
│   └── voice-agent/      # Voice Agent Service (Port 4008) - Python
├── shared/               # Shared TypeScript types and utilities
├── database/             # Database schemas and migrations
│   └── supabase/        # PostgreSQL migrations
├── docs/                 # Documentation
└── terraform/            # AWS infrastructure as code
```

### Services

1. **Frontend** (Port 3000)
   - Next.js 16 with App Router
   - React 18.3+ with TypeScript
   - Shadcn/ui components
   - Real-time via Socket.io and LiveKit Client SDK

2. **Agent Service** (Port 4002)
   - Node.js/Express/TypeScript
   - AI orchestration with OpenAI
   - Integrates with Knowledge Base Service

3. **Chat Service** (Port 4004)
   - Node.js/Express/TypeScript
   - Socket.io for real-time messaging
   - MongoDB for conversation logs
   - Redis for caching

4. **Knowledge Base Service** (Port 4005)
   - Node.js/Express/TypeScript
   - Document processing and embedding
   - Pinecone for vector search
   - BullMQ for job queues

5. **Voice Agent Service** (Port 4008)
   - Python 3.10+
   - LiveKit Agents SDK
   - OpenAI Realtime API
   - HTTP API for agent dispatch

### Databases

- **Supabase PostgreSQL**: User accounts, CRM data, agent configs, analytics
- **MongoDB**: Conversation logs, message history (write-heavy workloads)
- **Redis**: Session storage, caching, rate limiting

## Setup Commands

### Prerequisites

```bash
# Install Node.js dependencies (root)
pnpm install

# Install frontend dependencies
cd frontend && pnpm install

# Install service dependencies
cd ../services/agent && pnpm install
cd ../chat && pnpm install
cd ../knowledge-base && pnpm install

# Install Python dependencies (voice-agent)
cd ../voice-agent && pip install -r requirements.txt
```

### Development

```bash
# Start Docker services (MongoDB, Redis, RabbitMQ)
pnpm run docker:up

# Start all services + frontend concurrently
pnpm run dev:all

# Or start individually:
pnpm run dev:frontend     # Frontend (port 3000)
pnpm run dev:chat         # Chat service (port 4004)
pnpm run dev:agent        # Agent service (port 4002)
pnpm run dev:kb           # Knowledge Base (port 4005)
pnpm run dev:voice-agent  # Voice Agent (port 4008, Python)
```

### Build Commands

```bash
# Build all services
pnpm run build:all

# Build individual services
cd services/agent && pnpm build
cd services/chat && pnpm build
cd services/knowledge-base && pnpm build

# Build frontend
cd frontend && pnpm build
```

### Database Migrations

```bash
# Run Supabase migrations
pnpm run db:migrate

# Seed MongoDB (if needed)
pnpm run db:seed
```

## Code Style Guidelines

### Frontend (Next.js/React/TypeScript)

#### Component Patterns

**✅ DO: Use functional components with hooks**
```tsx
'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'

interface ComponentProps {
  id: string
  onAction: (id: string) => void
}

export function Component({ id, onAction }: ComponentProps) {
  const [state, setState] = useState<string | null>(null)
  
  useEffect(() => {
    // Side effects
  }, [id])
  
  return <Card>{/* content */}</Card>
}
```

**❌ DON'T: Use class components**
```tsx
// Avoid class-based components
class Component extends React.Component { ... }
```

#### File Organization

- **Components**: `frontend/components/[category]/[component-name].tsx`
- **API clients**: `frontend/lib/api/[service-name].ts`
- **Hooks**: `frontend/hooks/use-[hook-name].ts`
- **Utils**: `frontend/lib/utils/[util-name].ts`
- **Types**: `frontend/lib/types/[type-name].ts`

#### State Management

- **Server state**: Use React Query (`@tanstack/react-query`)
  ```tsx
  import { useQuery, useMutation } from '@tanstack/react-query'
  
  const { data, isLoading } = useQuery({
    queryKey: ['key'],
    queryFn: fetchData
  })
  ```

- **Client state**: Use `useState` or Zustand for global state
  ```tsx
  import { useStore } from '@/lib/store'
  
  const count = useStore((state) => state.count)
  ```

#### Styling

- Use **TailwindCSS** utility classes
- Use **Shadcn/ui** components from `@/components/ui/`
- Use `cn()` utility for conditional classes: `cn('base-class', condition && 'conditional-class')`
- Prefer composition over custom CSS

#### API Integration

- Use typed API clients from `frontend/lib/api/`
- Example: `frontend/lib/api/chat.ts` for chat operations
- Example: `frontend/lib/api/agents.ts` for agent operations
- Always handle loading and error states

#### Real-time Communication

- **Chat**: Use Socket.io client via `useChatSocket` hook
- **Voice/Video**: Use LiveKit Client SDK
- **Dashboard updates**: Use Supabase Realtime subscriptions

### Backend Services (Node.js/TypeScript)

#### Service Structure

```
services/[service-name]/
├── src/
│   ├── index.ts          # Entry point
│   ├── routes/           # Express routes
│   ├── services/         # Business logic
│   ├── models/           # Data models
│   ├── middleware/       # Express middleware
│   └── utils/            # Utilities
├── package.json
└── tsconfig.json
```

#### Code Patterns

**✅ DO: Use async/await with proper error handling**
```typescript
import { Request, Response, NextFunction } from 'express'

export async function handler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await someAsyncOperation()
    res.json(result)
  } catch (error) {
    next(error)
  }
}
```

**✅ DO: Use TypeScript types and interfaces**
```typescript
interface ServiceResponse {
  data: unknown
  error?: string
}

function processData(input: string): ServiceResponse {
  // Implementation
}
```

#### Database Access

**✅ DO: Use shared Supabase client utility**

```typescript
import { getSupabaseClient } from '@syntera/shared/database/supabase.js'

// Get singleton client (initialized once)
const supabase = getSupabaseClient()

// Use in routes/services
const { data, error } = await supabase
  .from('table_name')
  .select('*')
```

**Database Clients:**
- **PostgreSQL**: Use shared `getSupabaseClient()` from `@syntera/shared/database/supabase.js`
- **MongoDB**: Use Mongoose ODM
- **Redis**: Use `ioredis` client

#### Logging

- Use structured logging with Winston
- Include context fields (userId, requestId, etc.)
- Log to files and console in development

### Python (Voice Agent Service)

#### Code Style

- Use type hints for all functions
- Use async/await for I/O operations
- Follow LiveKit Agents patterns

**✅ DO: Use LiveKit Agents decorators**
```python
from livekit.agents import AgentServer, AgentSession, Agent
from livekit.plugins import openai

server = AgentServer()

@server.rtc_session()
async def entrypoint(ctx: JobContext):
    # Extract metadata
    # Load agent config
    # Create session
    await session.start(room=ctx.room, agent=Agent(...))
```

**✅ DO: Use structured logging**
```python
import logging

logger = logging.getLogger(__name__)
logger.info("Message", extra={"context": "value"})
```

## Testing Instructions

### Frontend Testing

```bash
cd frontend
pnpm test          # Run tests
pnpm test:watch    # Watch mode
```

### Service Testing

```bash
cd services/[service-name]
pnpm test          # Run tests
pnpm test:watch    # Watch mode
```

### Integration Testing

- Test API endpoints with curl or Postman
- Test real-time features with multiple browser tabs
- Test voice calls with LiveKit Playground

## Common Patterns

### Frontend Components

**Good Examples:**
- `frontend/components/chat/chat-widget.tsx` - Main chat component with Socket.io
- `frontend/components/chat/message-bubble.tsx` - Message display with reactions
- `frontend/components/voice-call/voice-call-widget.tsx` - LiveKit voice call integration

**Forms:**
- Use React Hook Form with Zod validation
- Reference: `frontend/components/auth/login-form.tsx`

**Data Fetching:**
- Use React Query hooks from `frontend/lib/api/`
- Example: `useMessages()`, `useAgent()`, `useConversation()`

**✅ DO: Use generic mutation hooks for new mutations**

```tsx
// For optimistic updates (create/update/delete with immediate UI feedback)
import { useOptimisticMutation } from '@/hooks/use-optimistic-mutation'

const createAgent = useOptimisticMutation(createAgentAPI, {
  listQueryKey: ['agents'],
  successMessage: 'Agent created successfully',
  createOptimisticData: (vars) => ({ ...vars, id: `temp-${Date.now()}`, ... }),
})

// For simple mutations (cache invalidation only)
import { useSimpleMutation } from '@/hooks/use-optimistic-mutation'

const deleteAgent = useSimpleMutation(deleteAgentAPI, {
  invalidateQueries: [['agents']],
  successMessage: 'Agent deleted successfully',
})
```

### Backend Services

**API Routes:**
- RESTful endpoints in `src/routes/`
- Use Express Router for route organization
- Validate input with Zod schemas from `@syntera/shared/schemas/`

**✅ DO: Use shared validation schemas**

```typescript
import { CreateAgentSchema, UpdateAgentSchema } from '@syntera/shared/schemas/agent.js'

// In route handlers:
const validated = CreateAgentSchema.parse(req.body)
```

**Real-time:**
- Chat Service: Socket.io server in `src/socket/`
- Voice Agent: LiveKit Agents SDK

**Database:**
- Supabase: Use typed client from `@supabase/supabase-js`
- MongoDB: Use Mongoose models in `src/models/`

### Error Handling

**✅ DO: Use shared error utilities**

**Backend Services:**
```typescript
import { handleError, notFound, forbidden, badRequest } from '@syntera/shared/utils/errors.js'

// In route handlers:
try {
  const result = await operation()
  res.json(result)
} catch (error) {
  handleError(error, res) // Automatically handles AppError and generic errors
}

// Or use specific helpers:
if (!resource) {
  return notFound(res, 'Resource', id)
}
if (!hasPermission) {
  return forbidden(res, 'Access denied')
}
if (!isValid) {
  return badRequest(res, 'Invalid input')
}
```

**Frontend:**
```tsx
import { handleApiError, showErrorToast } from '@/lib/utils/errors'

try {
  await mutation.mutateAsync(data)
} catch (error) {
  showErrorToast(error) // Uses shared error handling + toast
  // Or get structured error:
  const appError = handleApiError(error)
  console.error(appError.message, appError.code)
}
```

**Error Middleware (Backend):**
```typescript
import { handleError } from '@syntera/shared/utils/errors.js'

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  handleError(err, res)
})
```

## Important Notes

### Environment Variables

**Required for all services:**
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `MONGODB_URI` - MongoDB connection string
- `REDIS_URL` - Redis connection string

**Frontend (.env.local):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_CHAT_SERVICE_URL`
- `NEXT_PUBLIC_AGENT_SERVICE_URL`
- `NEXT_PUBLIC_LIVEKIT_URL`

**Voice Agent Service:**
- `LIVEKIT_URL` - LiveKit server URL
- `LIVEKIT_API_KEY` - LiveKit API key
- `LIVEKIT_API_SECRET` - LiveKit API secret
- `OPENAI_API_KEY` - OpenAI API key

### Service Communication

- Services communicate via REST APIs
- Frontend calls services via Next.js API routes (`frontend/app/api/`)
- Real-time: Socket.io for chat, LiveKit for voice/video

### Database Usage

- **PostgreSQL (Supabase)**: User data, CRM, agent configs, analytics
- **MongoDB**: Conversation logs, message history (high write throughput)
- **Redis**: Caching, sessions, rate limiting

### LiveKit Integration

- **Frontend**: Use LiveKit Client SDK for voice/video calls
- **Backend**: Use LiveKit Server SDK for room management
- **Voice Agent**: Use LiveKit Agents SDK for AI voice interactions
- See `docs/LIVEKIT_ENV_SETUP.md` for configuration

### Security

- All API routes require authentication (Supabase Auth)
- Use Supabase Row Level Security (RLS) for database access
- Validate all user input with Zod schemas
- Use environment variables for secrets (never commit)

## Documentation

- [README.md](README.md) - Project overview and quick start
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [TECH_STACK.md](TECH_STACK.md) - Complete technology stack
- [HOW_TO_RUN.md](HOW_TO_RUN.md) - Running all services
- [docs/](docs/) - Additional documentation

## Common Issues

1. **Port already in use**: Check if service is already running, kill process
2. **MongoDB connection**: Ensure Docker container is running (`docker ps`)
3. **Supabase connection**: Verify environment variables are set
4. **LiveKit connection**: Check LIVEKIT_URL, API_KEY, and API_SECRET
5. **Type errors**: Run `pnpm install` in affected service/frontend

## Best Practices

1. **Always use TypeScript** - Type safety is critical
2. **Follow existing patterns** - Check similar components/services before creating new ones
3. **Use shared types** - Import from `shared/` package when possible
4. **Handle errors gracefully** - Show user-friendly error messages
5. **Test real-time features** - Use multiple browser tabs/devices
6. **Keep components small** - Extract reusable logic into hooks/utils
7. **Use React Query** - For all server state management
8. **Follow naming conventions** - PascalCase for components, camelCase for functions

## Getting Help

- Check existing code in similar components/services
- Review documentation in `docs/` directory
- Check service-specific AGENTS.md (e.g., `services/voice-agent/AGENTS.md`)
- Review error logs in service `logs/` directories







