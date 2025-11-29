# Agent Service

**Port:** 4002

The Agent Service is the core AI orchestration service for Syntera. It handles AI agent configuration, response generation, workflow execution, and integrations with OpenAI, LiveKit, and the Knowledge Base Service.

## Overview

The Agent Service provides:

- **AI Agent Management**: CRUD operations for AI agent configurations
- **Response Generation**: OpenAI-powered conversational responses with context awareness
- **Workflow Engine**: Automated workflow execution based on triggers (conversation events, contact updates, etc.)
- **Intent Detection**: Classifies user messages to improve response quality
- **Sentiment Analysis**: Analyzes message emotional tone for better customer experience
- **LiveKit Integration**: Voice/video call management and token generation
- **Knowledge Base Integration**: Context-aware responses using vector search
- **Contact Management**: Auto-creation and updates from conversations

## Architecture

```
services/agent/
├── src/
│   ├── index.ts              # Express server setup
│   ├── config/               # Configuration (database, Redis)
│   ├── routes/               # API route handlers
│   │   ├── agents.ts         # Agent CRUD
│   │   ├── responses.ts      # Response generation
│   │   ├── workflows.ts       # Workflow management
│   │   ├── livekit.ts        # LiveKit integration
│   │   ├── public.ts         # Public API (widget)
│   │   └── ...
│   ├── services/             # Business logic
│   │   ├── openai.ts         # OpenAI client & response generation
│   │   ├── workflow.ts       # Workflow CRUD operations
│   │   ├── workflow-executor.ts  # Workflow execution engine
│   │   └── livekit.ts        # LiveKit service
│   ├── utils/                # Utility functions
│   │   ├── sentiment-analysis.ts
│   │   ├── intent-detection.ts
│   │   ├── knowledge-base.ts
│   │   ├── contacts.ts
│   │   └── ...
│   ├── middleware/           # Express middleware
│   │   ├── auth.ts           # JWT authentication
│   │   └── api-key-auth.ts   # API key authentication
│   ├── schemas/              # Zod validation schemas
│   └── types/                # TypeScript types
```

## Environment Variables

### Required

```bash
# Supabase (PostgreSQL)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-...

# MongoDB (optional, for conversation history)
MONGODB_URI=mongodb://localhost:27017/syntera

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379
```

### Optional

```bash
# Server
PORT=4002                                    # Default: 4002
ALLOWED_ORIGINS=http://localhost:3000        # Comma-separated

# LiveKit (for voice/video calls)
LIVEKIT_URL=wss://your-livekit-server.com
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret

# Features
ENABLE_AUTO_ANALYSIS=true                    # Enable automatic conversation analysis

# Email (optional, for notifications)
EMAIL_PROVIDER=resend                        # Options: resend, sendgrid
RESEND_API_KEY=re_...                        # Required if EMAIL_PROVIDER=resend
SENDGRID_API_KEY=SG....                     # Required if EMAIL_PROVIDER=sendgrid
EMAIL_FROM=noreply@syntera.ai               # Default sender email
```

## API Endpoints

### Agent Management

- `GET /api/agents` - List all agents for company
- `GET /api/agents/:id` - Get agent by ID
- `POST /api/agents` - Create new agent
- `PATCH /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent

### Response Generation

- `POST /api/responses/generate` - Generate AI response
  ```json
  {
    "agentId": "uuid",
    "message": "user message",
    "conversationId": "uuid",
    "conversationHistory": [...],
    "includeKnowledgeBase": true,
    "attachments": [...]
  }
  ```

### Workflows

- `GET /api/workflows` - List workflows
- `GET /api/workflows/:id` - Get workflow
- `POST /api/workflows` - Create workflow
- `PATCH /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow
- `POST /api/workflows/:id/execute` - Manually execute workflow

### LiveKit

- `POST /api/livekit/token` - Generate LiveKit access token
- `POST /api/livekit/room` - Create/manage rooms

### Public API (Widget)

- `POST /api/public/response` - Generate response (API key auth)
- `POST /api/public/livekit/token` - Get LiveKit token (API key auth)

### Analysis

- `POST /api/analysis/analyze` - Analyze conversation
- `POST /api/sentiment` - Analyze message sentiment
- `POST /api/intent` - Detect message intent
- `POST /api/responses/summarize` - Summarize conversation

## Setup

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker (for MongoDB, Redis)

### Installation

```bash
# Install dependencies
pnpm install

# Start Docker services (MongoDB, Redis)
pnpm run docker:up

# Copy environment variables
cp .env.example .env
# Edit .env with your credentials
```

### Development

```bash
# Start in development mode (with hot reload)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Key Features

### Response Generation

The service generates AI responses using OpenAI with:

- **Context Awareness**: Maintains conversation history and references previous messages
- **Knowledge Base Integration**: Searches vector database for relevant context
- **Intent Detection**: Adjusts response style based on detected intent
- **Sentiment Analysis**: Adapts tone based on message sentiment
- **Conversation Summarization**: Reduces token usage by summarizing old messages

### Workflow Engine

Automated workflows execute based on triggers:

- **Triggers**: `conversation_started`, `conversation_ended`, `contact_created`, `contact_updated`, `message_received`
- **Actions**: Create/update deals, update contacts, send notifications, webhooks, update metadata
- **Conditions**: Filter workflows based on agent, channel, sentiment, etc.

### Caching

- **Agent Configs**: Cached in Redis to reduce database queries
- **Conversation History**: Cached to improve response generation speed

## Database Schema

### Supabase (PostgreSQL)

- `agent_configs` - Agent configurations
- `workflows` - Workflow definitions
- `workflow_executions` - Workflow execution history
- `contacts` - Contact information
- `deals` - CRM deals

### MongoDB

- `conversations` - Conversation metadata
- `messages` - Message history

## Error Handling

All errors are handled consistently:

- **400 Bad Request**: Invalid input (validation errors)
- **401 Unauthorized**: Missing/invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server errors

Errors are logged using Winston.

## Logging

Structured logging using Winston:

- **Info**: Normal operations (agent creation, response generation)
- **Warn**: Non-critical issues (missing optional services)
- **Error**: Errors that need attention
- **Debug**: Detailed debugging information

Logs are written to:
- `logs/agent-service.log` - All logs
- `logs/agent-service-error.log` - Errors only
- Console (in development)

## Testing

```bash
# Run tests (if available)
pnpm test

# Test API endpoints
curl http://localhost:4002/health
```

## Dependencies

- **express**: Web framework
- **openai**: OpenAI API client
- **livekit-server-sdk**: LiveKit integration
- **@supabase/supabase-js**: Supabase client
- **zod**: Schema validation
- **winston**: Logging

## Related Services

- **Chat Service** (4004): Real-time messaging via Socket.io
- **Knowledge Base Service** (4005): Vector search and document processing
- **Voice Agent Service** (4008): Python service for voice interactions

## Troubleshooting

### OpenAI not working

- Check `OPENAI_API_KEY` is set
- Verify API key is valid
- Check rate limits

### Database connection errors

- Ensure Supabase credentials are correct
- Check MongoDB is running (`docker ps`)
- Verify Redis connection (optional, service continues without it)

### Workflow not executing

- Check workflow is enabled
- Verify trigger conditions match
- Check logs for execution errors

## Unimplemented Features

The following features are planned but not yet implemented:

### Workflow Test Execution

- **Endpoint**: `POST /api/workflows/:id/test`
- **Status**: Stub implementation - only validates workflow structure
- **Missing**: Actual test execution engine that runs workflows in dry-run mode
- **Current Behavior**: Returns validation success without executing the workflow

### API Key Database Storage

- **Location**: `src/middleware/api-key-auth.ts`
- **Status**: MVP implementation using simple format validation
- **Missing**:
  - Database storage of API keys with agent_id mapping
  - Per-agent key validation against stored keys
  - API key rotation and management
  - Key expiration and revocation
- **Current Behavior**: Validates API key format (`pub_key_{agentId}`) and extracts agent ID

### JWT Token Generation for WebSocket

- **Location**: `src/routes/public.ts`
- **Status**: MVP implementation using base64-encoded tokens
- **Missing**: Proper JWT token generation with signing and expiration
- **Current Behavior**: Returns base64-encoded JSON token

## Contributing

1. Follow TypeScript best practices
2. Use Zod schemas for validation
3. Add JSDoc comments for exported functions
4. Use Winston for logging
5. Handle errors gracefully with proper HTTP status codes

