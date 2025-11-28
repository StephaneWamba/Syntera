# AGENTS.md

A guide for AI coding assistants working on the Syntera Voice Agent Service.

## Project Overview

This is a LiveKit Agents-based voice AI service that provides real-time voice interactions. The agent uses OpenAI's Realtime API for speech-to-speech communication.

## Architecture

- **Entry Point**: `src/agent.py` - Main agent implementation using `@server.rtc_session()` decorator
- **Agent Server**: `src/agent_server.py` - Runs the agent server using `cli.run_app(server)`
- **API Server**: `src/main.py` - HTTP API for agent dispatch (runs separately or together)
- **Configuration**: `src/config.py` - Environment variables and settings
- **Supabase Client**: `src/supabase_client.py` - Fetches agent configurations from Supabase

## Key Patterns

### Agent Entrypoint

The agent follows LiveKit's recommended pattern:

```python
from livekit.agents import AgentServer, AgentSession, Agent, room_io, cli
from livekit.plugins import openai

server = AgentServer()

@server.rtc_session()
async def entrypoint(ctx: JobContext):
    # Extract metadata
    # Load agent config
    # Create session
    # Start session with room_options
    await session.start(room=ctx.room, agent=Agent(...), room_options=...)
```

### Session Configuration

- Uses `room_io.RoomOptions(close_on_disconnect=False)` to keep session alive indefinitely
- Session only ends when user manually disconnects (room disconnects)
- AgentSession handles connection automatically - no need for `ctx.connect()` when using AgentSession

### Metadata Extraction

Metadata is extracted from multiple sources in priority order:
1. Job metadata (`ctx.job.metadata`)
2. Room metadata (`ctx.room.metadata`)
3. Participant metadata (from token)

## Setup Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Run agent server only
python src/main.py --mode agent

# Run API server only
python src/main.py --mode api

# Run both (default)
python src/main.py --mode both

# Or use agent_server.py directly
python src/agent_server.py
```

## Code Style

- **Type hints**: Use type hints for all function parameters and return types
- **Async/await**: All I/O operations use async/await
- **Error handling**: Use try/except with proper logging
- **Logging**: Use structured logging with context fields via `ctx.log_context_fields`
- **Imports**: Group imports: standard library, third-party, local

## LiveKit Best Practices

1. **Use `@server.rtc_session()` decorator** - This is the recommended way to define entrypoints
2. **Let AgentSession handle connection** - Don't call `ctx.connect()` when using AgentSession
3. **Use `room_io.RoomOptions`** - Configure room behavior via RoomOptions, not deprecated RoomInputOptions
4. **Set `close_on_disconnect=False`** - Keep session alive during temporary disconnects
5. **Use `ctx.log_context_fields`** - Add custom fields to logs for better observability
6. **Extract metadata from `ctx.job.metadata`** - Use job metadata for per-session configuration

## Important Notes

- **Session Lifecycle**: The session runs until the room disconnects (user manually disconnects)
- **No Manual Connection**: When using AgentSession, connection is handled automatically
- **Metadata Priority**: Job metadata > Room metadata > Participant metadata
- **Default Config**: Falls back to "unknown" agent config if agentId not found
- **OpenAI Realtime**: Uses `openai.realtime.RealtimeModel` for speech-to-speech

## Testing

The agent can be tested using:
- LiveKit Playground (when running in `dev` mode)
- Terminal console mode (Python only)
- Custom frontend using LiveKit client SDK

## Documentation

- [LiveKit Agents Documentation](https://docs.livekit.io/agents/)
- [LiveKit Docs MCP Server](https://docs.livekit.io/home/get-started/mcp-server.md) - Use `.md` suffix for markdown versions
- [Agent Session Guide](https://docs.livekit.io/agents/build/sessions.md)
- [Job Lifecycle](https://docs.livekit.io/agents/server/job.md)

## Common Issues

1. **Session closes prematurely**: Ensure `close_on_disconnect=False` in RoomOptions
2. **Metadata not found**: Check job metadata, room metadata, and participant metadata in order
3. **Connection errors**: Verify LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET are set
4. **No voice response**: Verify OPENAI_API_KEY is configured and valid

