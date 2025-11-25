# Syntera Voice Agent Service

Python-based LiveKit Agents service for voice AI capabilities.

## Overview

This service provides:
- **HTTP API Server**: REST API for agent dispatch requests
- **LiveKit Agent Server**: Registers with LiveKit and handles agent job dispatch

## Setup

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure environment variables** (create `.env` file):
   ```env
   # LiveKit Configuration
   LIVEKIT_URL=wss://your-project.livekit.cloud
   LIVEKIT_API_KEY=your-api-key
   LIVEKIT_API_SECRET=your-api-secret
   
   # Supabase Configuration
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   
   # OpenAI Configuration (for voice AI)
   OPENAI_API_KEY=your-openai-api-key
   
   # Service Configuration
   API_SERVER_PORT=4003
   AGENT_SERVER_PORT=4003
   LOG_LEVEL=INFO
   ```

## Running the Service

### Option 1: Run Both Servers (Recommended for Development)

```bash
python src/main.py --mode both
```

This runs:
- API server on port 4003 (HTTP endpoints)
- Agent server (registers with LiveKit)

### Option 2: Run API Server Only

```bash
python src/main.py --mode api
```

Useful when agent server is running separately.

### Option 3: Run Agent Server Only

```bash
python src/main.py --mode agent
```

Useful when API server is running separately.

## API Endpoints

### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy"
}
```

### `GET /`
Service information.

**Response:**
```json
{
  "service": "syntera-voice-agent",
  "version": "0.1.0",
  "status": "running"
}
```

### `POST /api/agents/dispatch`
Dispatch an agent to a LiveKit room.

**Request Body:**
```json
{
  "conversationId": "conversation-id",
  "agentId": "agent-uuid",
  "userId": "user-uuid",
  "roomName": "conversation:conversation-id",
  "token": "livekit-access-token"
}
```

**Response:**
```json
{
  "success": true,
  "agentJobId": "agent-{agentId}-{conversationId}",
  "message": "Agent dispatch request processed. Agent will connect when agent server is running."
}
```

## How It Works

1. **Agent Server Registration**: The agent server registers with LiveKit using `agents.cli.run_app()`
2. **User Joins Room**: When a user joins a LiveKit room, LiveKit can dispatch a job to the agent server
3. **Job Dispatch**: LiveKit sends a job request to the agent server
4. **Entrypoint Execution**: The `entrypoint` function in `src/agent.py` is called with the job context
5. **Agent Connection**: The agent connects to the room and starts the voice AI session

## Testing Voice Responses

### Quick Test

Run the test script to verify configuration:

```bash
cd services/voice-agent
python test_voice_response.py
```

This verifies:
- ✅ Configuration is valid
- ✅ OpenAI API key is configured
- ✅ OpenAI API is accessible
- ✅ Realtime models are available
- ✅ Agent code can be imported

### Testing in UI

1. **Start all services**:
   ```bash
   pnpm run dev:all
   ```

2. **Start a voice call** in the UI (`http://localhost:3000/dashboard/chat`)

3. **Check agent server logs** for:
   - `Agent connecting to room`
   - `OpenAI API key validated`
   - `Agent session started successfully`
   - `Agent greeting sent successfully`
   - `Agent ready for voice interaction`

4. **Speak into microphone** and verify:
   - Agent hears you (check logs for "User started speaking")
   - Agent responds (check logs for "Agent started speaking")
   - You hear the agent's response

See `TESTING.md` for detailed testing guide.

## Development

The service is integrated into the monorepo's development workflow:

```bash
# From project root
pnpm run dev:voice-agent
```

This runs the service in "both" mode (API + Agent server).

## Production Deployment

For production, consider:
- Using a process manager (systemd, supervisord, or PM2)
- Running API server and agent server in separate containers
- Using Docker Compose for orchestration
- Setting up proper logging and monitoring

## Architecture

```
┌─────────────────┐
│   Node.js       │
│   Agent Service │───POST /api/agents/dispatch───┐
└─────────────────┘                                 │
                                                    │
┌───────────────────────────────────────────────────▼──────────────┐
│              Python Voice Agent Service                           │
│  ┌──────────────────┐              ┌──────────────────┐         │
│  │   API Server     │              │  Agent Server    │         │
│  │   (FastAPI)      │              │  (LiveKit Agents) │         │
│  │   Port: 4003     │              │  Registers with  │         │
│  └──────────────────┘              │  LiveKit Cloud   │         │
│                                    └────────┬─────────┘         │
└─────────────────────────────────────────────┼───────────────────┘
                                               │
                                               │ Job Dispatch
                                               ▼
                                    ┌──────────────────┐
                                    │   LiveKit Cloud  │
                                    │   (Room Service) │
                                    └──────────────────┘
```

## Troubleshooting

### Agent Server Not Connecting

- Check LiveKit credentials in `.env`
- Verify network connectivity to LiveKit URL
- Check logs for connection errors

### API Server Not Starting

- Verify port 4003 is not in use
- Check Python dependencies are installed
- Review error logs

### Agent Not Dispatching

- Ensure agent server is running and registered
- Check dispatch rules in LiveKit configuration
- Verify room name and token are correct
