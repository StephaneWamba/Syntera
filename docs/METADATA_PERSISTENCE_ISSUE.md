# Metadata Persistence Issue - Follow-up

## Problem Summary

The voice agent is not finding its `agentId` from room metadata, causing it to use the default configuration instead of Mary's configuration with KB access.

## Key Finding

**THE ROOT CAUSE:** LiveKit automatically creates rooms when the first participant joins. The widget connects to LiveKit **BEFORE** calling `dispatchAgent`, so the room is created **WITHOUT metadata**. When the agent auto-connects (triggered by the participant join), it reads empty metadata. Even though `dispatchAgent` later tries to set room metadata, the agent has already connected and won't re-read it.

**THE FIX:** Create the room with metadata **BEFORE** generating the token for the widget. This ensures the room exists with metadata when the widget connects, and the agent will see the metadata immediately upon connection.

**Symptoms:**
- Logs show: `has_metadata=False`
- Logs show: `Using default agent config (agentId not found)`
- Agent cannot access KB or identify itself as "Mary"

## Root Cause Analysis

### Current Flow (PROBLEMATIC)

1. **Widget gets LiveKit token** (`widget/src/widget.ts:191-194`)
   - Calls `/api/public/livekit/token` on agent service
   - Token is generated with **participant metadata** (not room metadata)
   - **Room does not exist yet** - LiveKit creates rooms automatically when first participant joins

2. **Widget connects to LiveKit room** (`widget/src/widget.ts:247`)
   - LiveKit **automatically creates the room** when first participant joins
   - Room is created **WITHOUT metadata** (empty)
   - LiveKit may **auto-dispatch agent job** when participant joins
   - Agent connects and reads metadata → **Finds empty metadata!**

3. **Widget calls `dispatchAgent`** (`widget/src/widget.ts:252`)
   - Calls `/api/public/voice-bot/deploy` on agent service
   - Agent service calls `/api/agents/dispatch` on Python service
   - Python service tries to create/update room with metadata
   - **BUT**: Agent has already connected and read empty metadata!
   - Even if metadata is updated, agent won't re-read it

### The Timing Problem

The critical issue is **race condition**:
- Widget connects → LiveKit creates room (no metadata) → Agent auto-dispatches → Agent reads metadata (empty)
- THEN widget calls `dispatchAgent` → Tries to set room metadata (too late!)

**Key Insight:** LiveKit creates rooms automatically when the first participant joins. The room is created **without metadata** because we're not creating it explicitly before the widget connects.

**Additional Issue:** The token metadata (`token.metadata` in `livekit.ts:84`) is **participant metadata**, not **room metadata**. These are different things in LiveKit.

## Potential Solutions

### Solution 1: Call `dispatchAgent` BEFORE Connecting (RECOMMENDED)

**Change:** Move `dispatchAgent` call to happen BEFORE `liveKitClient.connect()`

**Files to modify:**
- `widget/src/widget.ts` - Reorder the calls in `handleStartCall()`

**Pros:**
- Ensures metadata is set before agent connects
- Simple fix, minimal changes

**Cons:**
- Requires room to exist or be created first
- Need to handle case where room doesn't exist yet

### Solution 2: Pass Metadata in Job Context

**Change:** Use LiveKit's job metadata instead of room metadata

**How:**
- When LiveKit dispatches the agent job, it should include metadata
- This requires configuring the agent server to pass metadata when dispatching jobs
- May require changes to how the agent server is configured

**Pros:**
- Metadata is available immediately in `ctx.job.metadata`
- No timing issues

**Cons:**
- Requires understanding LiveKit's job dispatch mechanism
- May need to configure agent server differently

### Solution 3: Set Metadata When Creating Room Token

**Change:** Include metadata in the room token generation, and ensure room is created with metadata before widget connects

**Files to modify:**
- `services/agent/src/routes/public.ts` - Set room metadata when generating token
- `services/agent/src/services/livekit.ts` - Ensure room creation includes metadata

**Pros:**
- Metadata is set before any participant joins
- No race condition

**Cons:**
- Requires room to be created before token generation
- May need to modify room creation logic

### Solution 4: Use LiveKit Room Creation with Metadata

**Change:** Create the room with metadata BEFORE generating the token

**Files to modify:**
- `services/agent/src/routes/public.ts` - Create room with metadata first
- `services/agent/src/routes/public.ts` - Then generate token

**Pros:**
- Room exists with metadata before any connection
- Agent will see metadata immediately

**Cons:**
- Need to handle room already exists case
- May need to update room metadata if it already exists

## Recommended Implementation: Solution 4 (Create Room with Metadata First)

### Step 1: Create Room with Metadata When Generating Token

In `services/agent/src/routes/public.ts`, in the `/api/public/livekit/token` endpoint, **before generating the token**:

```typescript
// Import LiveKit API
import { LiveKitApi, CreateRoomRequest } from 'livekit-server-sdk'

// In the token endpoint, BEFORE generating token:
const roomName = getRoomName(conversationId)
const roomMetadata = JSON.stringify({
  agentId,
  conversationId,
  userId: 'widget-user',
})

// Create room with metadata FIRST (or update if exists)
const lkApi = new LiveKitApi(
  process.env.LIVEKIT_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
)

try {
  await lkApi.room.createRoom(
    new CreateRoomRequest({
      name: roomName,
      metadata: roomMetadata,
      emptyTimeout: 300,
      maxParticipants: 10,
    })
  )
  logger.info('Room created with metadata', { roomName, agentId })
} catch (error) {
  // Room might already exist, try to update metadata
  if (error.message?.includes('already exists')) {
    await lkApi.room.updateRoomMetadata(roomName, roomMetadata)
    logger.info('Room metadata updated', { roomName, agentId })
  } else {
    throw error
  }
}

// NOW generate token (room exists with metadata)
const token = await generateAccessToken({...})
```

### Step 2: Keep Widget Call Order (No Change Needed)

The widget can keep the current order because the room will already exist with metadata when it connects.

### Step 3: Improve Agent Metadata Reading

In `services/voice-agent/src/agent.py`, add better logging and retry logic:

```python
# Try to read metadata with retry if not found immediately
# (in case of slight timing issues)
```

## Additional Investigation Needed

1. **Verify room creation timing:**
   - ✅ **CONFIRMED**: Room is created automatically by LiveKit when first participant joins
   - ✅ **CONFIRMED**: Room is created WITHOUT metadata if not explicitly set
   - ✅ **CONFIRMED**: We need to create room with metadata BEFORE widget connects

2. **Check LiveKit job dispatch timing:**
   - ✅ **CONFIRMED**: Agent job is dispatched automatically when participant joins
   - ✅ **CONFIRMED**: Agent reads metadata immediately upon connection
   - ⚠️ **ISSUE**: If metadata is empty at connection time, agent won't re-read it later

3. **Check if metadata can be passed in job dispatch:**
   - ❓ **UNKNOWN**: Can we configure agent server to include metadata in job dispatch?
   - ❓ **UNKNOWN**: Is there a way to pass metadata when agent connects via job context?
   - **NOTE**: Current approach uses room metadata, which should work if set before agent connects

## Files to Review

1. `widget/src/widget.ts` - Widget connection flow
2. `services/agent/src/routes/public.ts` - Token generation and dispatch
3. `services/agent/src/services/livekit.ts` - Token and room creation
4. `services/voice-agent/src/main.py` - Room metadata setting
5. `services/voice-agent/src/agent.py` - Metadata reading

## Next Steps

1. **Immediate fix:** Reorder widget calls (Solution 1)
2. **Better fix:** Ensure room metadata is set before room is used (Solution 4)
3. **Long-term:** Consider using job metadata instead of room metadata (Solution 2)

## Testing

After implementing fixes:

1. Start voice call from widget
2. Check agent logs for:
   - `has_metadata=True`
   - `agent_id` found in logs
   - KB access enabled
3. Ask agent "What is your name?" - should respond with "Mary" (or configured name)
4. Ask agent about products - should have KB context

