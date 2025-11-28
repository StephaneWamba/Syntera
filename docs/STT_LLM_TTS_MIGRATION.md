# STT-LLM-TTS Pipeline Migration

## Overview

The voice agent has been migrated from OpenAI Realtime API to an STT-LLM-TTS pipeline with dynamic knowledge base queries. This provides:

- **Dynamic KB queries**: Knowledge base is queried for each user message, not just once at session start
- **More natural voices**: Uses Cartesia Sonic-3 TTS with better voice quality
- **Telephony optimization**: Automatic noise cancellation for phone calls
- **Better control**: Full control over each pipeline stage

## What Changed

### Dependencies

**Updated `requirements.txt` and `pyproject.toml`:**
- Added `livekit-agents[silero,turn-detector]>=1.2.0`
- Added `livekit-plugins-noise-cancellation>=0.2.0`

### Agent Architecture

**Before (OpenAI Realtime):**
```python
session = AgentSession(
    llm=openai.realtime.RealtimeModel(voice="coral")
)
```

**After (STT-LLM-TTS):**
```python
session = AgentSession(
    stt="assemblyai/universal-streaming:en",
    llm="openai/gpt-4.1-mini",
    tts="cartesia/sonic-3:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc",
    vad=silero.VAD.load(),
    turn_detection=MultilingualModel(),
)
```

### Dynamic KB Integration

**Before:** KB context was queried once at session start with a generic query.

**After:** KB is queried dynamically for each user message using the `on_user_turn_completed` hook:

```python
class DynamicKBAgent(Agent):
    async def on_user_turn_completed(self, turn_ctx: ChatContext, new_message: ChatMessage):
        # Query KB with actual user question
        kb_context = await get_knowledge_base_context(
            query=user_text,
            company_id=self.company_id,
            agent_id=self.agent_id,
            top_k=5
        )
        # Inject into chat context for LLM
        turn_ctx.add_message(role="assistant", content=f"KB context: {kb_context}")
```

### Telephony Optimization

Automatic noise cancellation based on participant type:
- **SIP participants** (phone calls): `BVCTelephony()` - optimized for telephony
- **Web participants**: `BVC()` - standard noise cancellation

## Benefits

1. **Dynamic KB Queries**: Each user message triggers a fresh KB query with the actual question
2. **Better Voice Quality**: Cartesia Sonic-3 provides more natural, expressive voices
3. **Telephony Ready**: Optimized for phone calls with HD Voice support
4. **More Control**: Can customize each pipeline stage (STT, LLM, TTS)
5. **Lower Cost**: STT-LLM-TTS is cheaper than OpenAI Realtime API

## Configuration

### Voice Settings

The TTS voice can be configured via agent `voice_settings`:

```json
{
  "voice_settings": {
    "tts_voice": "cartesia/sonic-3:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc"
  }
}
```

Available Cartesia voices:
- `cartesia/sonic-3:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc` - Jacqueline (Confident, young American adult female)
- `cartesia/sonic-3:a167e0f3-df7e-4d52-a9c3-f949145efdab` - Blake (Energetic American adult male)
- See [LiveKit TTS docs](https://docs.livekit.io/agents/models/tts/) for more voices

### Knowledge Base

KB queries are automatic when:
- `company_id` is set in agent config
- `agent_id` is not "unknown"

No additional configuration needed - the agent automatically queries KB for each user message.

## Testing

1. **Install dependencies:**
   ```bash
   cd services/voice-agent
   pip install -r requirements.txt
   # Or if using uv:
   uv sync
   ```

2. **Download model files:**
   ```bash
   python src/agent.py download-files
   ```

3. **Run agent:**
   ```bash
   python src/agent.py dev
   ```

4. **Test with phone call:**
   - Make a call to your LiveKit phone number
   - Ask a question that should trigger KB lookup
   - Verify KB context is retrieved and used in response

## Migration Notes

- **Latency**: Slightly higher (~300-500ms vs ~200ms) but still very responsive
- **Cost**: Lower overall cost (3 separate APIs vs 1 combined API)
- **Voice**: Different voice options (Cartesia vs OpenAI voices)
- **Events**: Some event names may have changed - check logs for any warnings

## Troubleshooting

### KB Not Querying

- Check logs for "Dynamic KB context injected" messages
- Verify `company_id` is set in agent config
- Check KB service is accessible from voice agent

### Voice Issues

- Verify Cartesia voice ID is correct
- Check LiveKit Inference is configured
- Review TTS logs for errors

### Telephony Issues

- Verify SIP trunk is configured
- Check noise cancellation is working (should auto-detect SIP participants)
- Review telephony logs

## Next Steps

- Consider adding emotion detection to match TTS emotion to user sentiment
- Add voice cloning support for custom voices
- Implement KB query caching for common questions
- Add metrics for KB query performance



