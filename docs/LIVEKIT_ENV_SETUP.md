# LiveKit Environment Setup

## Quick Setup

Use the credentials from your LiveKit dashboard to configure the following:

### Agent Service (`services/agent/.env`)

Create or update `services/agent/.env` with:

```env
LIVEKIT_URL=wss://first-app-q69ewmfi.livekit.cloud
LIVEKIT_API_KEY=APInQip8RtwNi6W
LIVEKIT_API_SECRET=FimAnQ809KgzKXltldNBLNT2vwaYCEc9d8J4Mfpz3QO
```

### Frontend (`frontend/.env.local`)

Create or update `frontend/.env.local` with:

```env
NEXT_PUBLIC_LIVEKIT_URL=wss://first-app-q69ewmfi.livekit.cloud
NEXT_PUBLIC_AGENT_SERVICE_URL=http://localhost:4002
```

## Complete Environment Variables

### Agent Service (`services/agent/.env`)

```env
# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# LiveKit
LIVEKIT_URL=wss://first-app-q69ewmfi.livekit.cloud
LIVEKIT_API_KEY=APInQip8RtwNi6W
LIVEKIT_API_SECRET=FimAnQ809KgzKXltldNBLNT2vwaYCEc9d8J4Mfpz3QO


# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Service Configuration
PORT=4002
ALLOWED_ORIGINS=http://localhost:3000

# Redis (Optional)
REDIS_URL=redis://localhost:6379
```

### Frontend (`frontend/.env.local`)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# LiveKit
NEXT_PUBLIC_LIVEKIT_URL=wss://first-app-q69ewmfi.livekit.cloud

# Service URLs
NEXT_PUBLIC_AGENT_SERVICE_URL=http://localhost:4002
NEXT_PUBLIC_CHAT_SERVICE_URL=http://localhost:4004
NEXT_PUBLIC_KNOWLEDGE_BASE_SERVICE_URL=http://localhost:4005

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Verification

After setting up the environment variables:

1. **Restart the agent service:**
   ```bash
   cd services/agent
   pnpm dev
   ```

2. **Restart the frontend:**
   ```bash
   cd frontend
   pnpm dev
   ```

3. **Test the LiveKit integration:**
   - Navigate to `/dashboard/chat`
   - Select an agent
   - Click "Start Voice Call" or "Start Video Call"
   - The voice call widget should connect to LiveKit

## Troubleshooting

- **"LiveKit configuration is invalid"**: Check that all three LiveKit variables are set in the agent service
- **Connection errors**: Verify `NEXT_PUBLIC_LIVEKIT_URL` matches `LIVEKIT_URL` (without the `wss://` prefix in some cases)
- **Token generation fails**: Ensure the agent service has access to the LiveKit API key and secret


