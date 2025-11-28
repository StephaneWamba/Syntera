# LiveKit Integration Guide

Complete guide for integrating LiveKit voice and video capabilities into Syntera.

---

## Table of Contents

1. [Overview](#overview)
2. [Setup](#setup)
3. [Free Tier & Pricing](#free-tier--pricing)
4. [Architecture Decisions](#architecture-decisions)
5. [Implementation Tasks](#implementation-tasks)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Overview

LiveKit provides real-time voice and video communication for Syntera. This integration enables:
- Voice calls between users and AI agents
- Video calls with screen sharing
- Real-time transcription
- AI agent voice responses (TTS)

### Architecture

- **LiveKit Cloud**: Handles WebRTC connections, room management, and media streaming
- **Agent Service**: Generates access tokens and deploys AI voice agents
- **Frontend**: Uses LiveKit Client SDK to connect to rooms
- **Chat Service**: Manages voice/video conversations

### Room Management

- **Room Naming**: `conversation:{conversationId}`
- **Participants**: User + AI Agent (via bot)
- **Permissions**: 
  - User: Can publish audio/video, subscribe to agent tracks
  - Agent: Can publish audio (TTS), subscribe to user tracks

---

## Setup

### 1. Set Up LiveKit Cloud (Recommended)

1. Go to [livekit.io](https://livekit.io)
2. Sign up for a free account
3. Create a new project
4. Get your API keys:
   - **API Key** → `LIVEKIT_API_KEY`
   - **API Secret** → `LIVEKIT_API_SECRET`
   - **Server URL** → `LIVEKIT_URL` (e.g., `wss://your-project.livekit.cloud`)

### 2. Configure Environment Variables

#### Frontend (`.env.local`)
```env
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
```

#### Agent Service (`.env`)
```env
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
```

#### Chat Service (`.env`)
```env
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret
```

### 3. Token Generation

Access tokens are generated server-side with:
- **Identity**: User ID or agent ID
- **Room**: Conversation ID
- **Permissions**: Based on participant type
- **Expiration**: 1 hour (configurable)

---

## Free Tier & Pricing

### ✅ Available in Free Tier

| Feature | Limit | Use Case |
|---------|-------|----------|
| **Agents Framework** | 1,000 min/month, 5 concurrent | Deploy AI voice agents |
| **LiveKit Inference** | $2.50 credits (~50 min) | STT, TTS, LLM access |
| **WebRTC Rooms** | 5,000 participant min/month | Voice/video calls |
| **Data Transfer** | 50GB downstream/month | Media streaming |
| **Global Edge Network** | Unlimited | Low-latency transport |
| **Session Metrics** | Basic analytics | Monitor performance |
| **Telephony (SIP)** | 1,000 min/month | Phone integration |

### ❌ NOT Available in Free Tier

- **Advanced Analytics** - Metrics export APIs (paid)
- **Team Features** - RBAC, SSO (paid)
- **Email Support** - Only community support (free)

### Free Tier Quotas (Monthly)

| Resource | Free Limit | Resets |
|----------|-----------|--------|
| Agent Session Minutes | 1,000 | Monthly |
| Concurrent Agent Sessions | 5 | Always |
| Agent Deployments | 1 | Always |
| WebRTC Participant Minutes | 5,000 | Monthly |
| Downstream Data Transfer | 50GB | Monthly |
| SIP Minutes | 1,000 | Monthly |
| Inference Credits | $2.50 (~50 min) | Monthly |

**Note**: Quotas are shared across all free projects in your account.

### Paid Pricing (Approximate)

- **Room minutes**: ~$0.004/minute per participant (after free tier)
- **Inference**: Pay-as-you-go after $2.50 free credits
- **Agent sessions**: Pay-as-you-go after 1,000 free minutes

### MVP Strategy (Free Tier)

**What We Can Use:**
- ✅ Agents Framework → Deploy AI voice agent
- ✅ LiveKit Inference STT → Transcribe user speech
- ✅ LiveKit Inference TTS → Generate agent voice
- ✅ LiveKit Inference LLM → Agent responses
- ✅ WebRTC Rooms → Voice/video calls

**What We Store:**
- ✅ Conversation transcripts → Stored as text messages in MongoDB
- ✅ Message history → All conversation messages preserved

**For MVP Testing:**
- 1,000 agent minutes = ~16 hours of conversation
- 5,000 WebRTC minutes = ~83 hours of call time
- $2.50 inference = ~50 minutes of STT/TTS
- **Sufficient for development and initial testing**

---

## Architecture Decisions

### 1. Bot Implementation: LiveKit Agents Framework ✅

**Decision**: Use LiveKit's Agents Framework

**Why:**
- ✅ Faster to implement
- ✅ Less code to maintain
- ✅ Built for AI voice agents
- ✅ Production-ready
- ✅ Available in free tier

**Alternative**: Custom implementation (more code, more maintenance)

### 2. TTS: LiveKit Inference (TTS) ✅

**Decision**: Use LiveKit Inference TTS

**Why:**
- ✅ Available in free tier ($2.50 credits)
- ✅ Simple integration
- ✅ Optimized for real-time
- ✅ Can switch to external service later if needed

**Alternative**: External TTS service (more control, more code)

### 3. Transcription: LiveKit Inference (STT) ✅

**Decision**: Use LiveKit Inference STT

**Why:**
- ✅ Available in free tier ($2.50 credits)
- ✅ Real-time transcription
- ✅ Simple integration

**Alternative**: External STT service (more control, more code)

### 4. Conversation Storage ✅

**Decision**: Store conversation transcripts as text messages

**Why:**
- ✅ All conversation messages are stored in MongoDB
- ✅ Transcripts are preserved for history and analysis
- ✅ No additional storage costs
- ✅ Simple and reliable

### Summary

| Feature | Approach | Free Tier? | Reason |
|---------|----------|------------|--------|
| **Bot Implementation** | LiveKit Agents Framework | ✅ Yes | Faster, less code |
| **TTS** | LiveKit Inference (TTS) | ✅ Yes ($2.50 credits) | Simple, optimized |
| **Transcription** | LiveKit Inference (STT) | ✅ Yes ($2.50 credits) | Real-time, simple |
| **Storage** | Text Messages | ✅ Yes | All conversations stored |

---

## Implementation Tasks

### Week 19: LiveKit Integration

#### Task 1: Environment Configuration

**Files to update:**
- `frontend/.env.local` (add `NEXT_PUBLIC_LIVEKIT_URL`)
- `services/agent/.env` (add `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`)
- `services/chat/.env` (add same LiveKit variables)

**Action:**
- Get LiveKit Cloud credentials
- Add environment variables to all services
- Document in `.env.example` files

#### Task 2: Create LiveKit Service Module

**File to create:** `services/agent/src/services/livekit.ts`

**Purpose:** Centralized LiveKit utilities for token generation and room management

**Key Functions:**
```typescript
// Generate access token for user or agent
generateAccessToken(identity: string, roomName: string, permissions: ParticipantPermissions): string

// Create room configuration
createRoomConfig(conversationId: string, agentId: string): RoomOptions

// Validate LiveKit configuration
validateLiveKitConfig(): boolean
```

#### Task 3: Create LiveKit API Endpoints

**File to create:** `services/agent/src/routes/livekit.ts`

**Endpoints needed:**
1. `POST /api/livekit/token` - Generate access token
   - Request: `{ conversationId: string, userId: string, agentId: string }`
   - Response: `{ token: string, url: string, roomName: string }`

2. `POST /api/livekit/room/create` - Create/verify room
   - Request: `{ conversationId: string }`
   - Response: `{ roomName: string, exists: boolean }`

3. `GET /api/livekit/room/:conversationId/participants` - Get participants
   - Response: `{ participants: Participant[] }`

**Integration:**
- Add router to `services/agent/src/index.ts`
- Use authentication middleware
- Validate conversation ownership

#### Task 4: Frontend LiveKit Integration

**Files to create:**
1. `frontend/lib/livekit/client.ts` - LiveKit client wrapper
2. `frontend/lib/api/livekit.ts` - API hooks for token generation
3. `frontend/components/voice-call/voice-call-widget.tsx` - Voice call UI
4. `frontend/components/voice-call/voice-controls.tsx` - Call controls

**Key Implementation:**
```typescript
// Client wrapper
export class LiveKitClient {
  private room: Room | null = null
  
  async connect(token: string, url: string): Promise<Room>
  async disconnect(): Promise<void>
  onParticipantConnected(callback: (participant: RemoteParticipant) => void)
  onTrackSubscribed(callback: (track: Track, participant: RemoteParticipant) => void)
  toggleMute(): boolean
  toggleVideo(): boolean
}

// React hook
export function useLiveKitRoom(conversationId: string) {
  // Manages room connection, tracks, participants
  // Returns: { room, isConnected, participants, localTracks, connect, disconnect }
}
```

#### Task 5: Integrate with Chat Service

**File to update:** `services/chat/src/handlers/conversations.ts`

**Changes needed:**
- When creating voice/video conversation, generate LiveKit room token
- Store room name in conversation metadata
- Emit `conversation:created` with LiveKit room info

**File to update:** `frontend/components/chat/chat-widget.tsx`

**Changes needed:**
- Detect conversation channel type (`'voice'` | `'video'`)
- Show voice/video call UI instead of text chat
- Add "Start Voice Call" / "Start Video Call" buttons

#### Task 6: Voice Call UI Component

**File to create:** `frontend/components/voice-call/voice-call-widget.tsx`

**Features:**
- Connect to LiveKit room on mount
- Display participant list (user + agent)
- Show audio level indicators
- Call controls: mute, hang up
- Connection status indicator
- Error handling and reconnection logic

**UI Elements:**
- Participant avatars
- Mute/unmute button
- Hang up button
- Connection status badge
- Audio waveform visualization (optional)

#### Task 7: Update Conversation Creation

**File to update:** `frontend/app/dashboard/chat/page.tsx`

**Changes:**
- Add "Voice Call" and "Video Call" options when creating conversation
- Pass channel type: `'voice'` or `'video'` to conversation creation
- After creation, automatically connect to LiveKit room

**File to update:** `services/chat/src/handlers/conversations.ts`

**Changes:**
- Handle `channel: 'voice' | 'video'` in conversation creation
- Generate LiveKit room token via agent service
- Store room info in conversation metadata

---

## Testing

### Basic Connection
- [ ] Generate access token successfully
- [ ] Connect to LiveKit room from frontend
- [ ] Verify room creation in LiveKit dashboard
- [ ] Test token expiration handling

### Audio/Video
- [ ] User can publish audio track
- [ ] User can publish video track (for video calls)
- [ ] Audio levels are detected
- [ ] Mute/unmute works correctly

### Agent Integration
- [ ] Agent bot can join room
- [ ] Agent can receive user audio
- [ ] Agent can publish audio (TTS)
- [ ] Transcription works

### Error Handling
- [ ] Network disconnection recovery
- [ ] Token expiration refresh
- [ ] Room not found handling
- [ ] Permission errors

---

## Troubleshooting

### Connection Issues
- **Check firewall**: WebRTC requires UDP ports 50000-50100
- **Verify API keys**: Ensure `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` are correct
- **Check URL format**: Must be `wss://` (secure WebSocket)

### Token Errors
- **Verify expiration**: Tokens expire after 1 hour (configurable)
- **Check permissions**: Ensure token has correct room permissions
- **Validate identity**: Identity must match participant type

### No Audio
- **Browser permissions**: Check microphone access in browser settings
- **Track publishing**: Verify tracks are being published to room
- **Audio devices**: Check system audio device settings

### Agent Not Responding
- **Bot deployment**: Verify agent bot is deployed and running
- **Room connection**: Check if bot successfully joined room
- **Track subscription**: Ensure bot is subscribing to user audio tracks
- **TTS configuration**: Verify TTS is configured correctly

### Free Tier Limits
- **Monitor usage**: Check LiveKit dashboard for quota usage
- **Set alerts**: Configure alerts before hitting limits
- **Plan upgrade**: Upgrade to paid plan if needed for production

---

## Key Files Reference

### Existing Files (Review)
- `shared/src/models/conversation.ts` - Channel type: `'voice' | 'video'`
- `frontend/lib/api/agents.ts` - VoiceSettings interface exists
- `frontend/components/agents/agent-voice-settings-form.tsx` - Voice settings UI
- `services/agent/src/index.ts` - Agent service entry point

### New Files to Create
1. `services/agent/src/services/livekit.ts` - LiveKit utilities
2. `services/agent/src/routes/livekit.ts` - LiveKit API routes
3. `frontend/lib/livekit/client.ts` - LiveKit client wrapper
4. `frontend/lib/api/livekit.ts` - React Query hooks for LiveKit
5. `frontend/components/voice-call/voice-call-widget.tsx` - Main voice call component
6. `frontend/components/voice-call/voice-controls.tsx` - Call controls
7. `frontend/components/video-call/video-call-widget.tsx` - Video call component (Week 21)

### Dependencies
- ✅ `livekit-client@^2.0.0` (frontend) - Already installed
- ✅ `livekit-server-sdk@^2.0.0` (backend) - Already installed

---

## Next Phase (Week 20-22)

### Week 20: Voice Features
- Speech-to-text (LiveKit Inference STT)
- Text-to-speech (LiveKit Inference TTS)
- Real-time transcription
- Conversation history

### Week 21: Video Features
- Video call support
- Screen sharing
- Video controls
- Call quality indicators

### Week 22: Integration & Testing
- Integrate voice/video with agent
- Test real-time transcription accuracy
- Optimize call quality
- Test with multiple concurrent calls
- Load testing
- Bug fixes

---

## Questions Resolved

1. **Bot SDK vs Custom**: ✅ Use LiveKit Agents Framework (faster, free tier)
2. **TTS**: ✅ Use LiveKit Inference TTS (free tier, simple)
3. **Transcription**: ✅ Use LiveKit Inference STT (free tier, real-time)
4. **Storage**: ✅ Store conversation transcripts as text messages

---

**Status**: Ready for Week 19 implementation. All decisions made, free tier strategy confirmed.








