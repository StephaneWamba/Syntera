# Widget Testing Guide

## Quick Start Testing

### 1. Build the Widget

```bash
cd widget
pnpm install
pnpm build
```

This creates `dist/widget.iife.js` (57KB, 17KB gzipped)

### 2. Start Required Services

```bash
# From project root
pnpm run docker:up          # Start MongoDB, Redis
pnpm run dev:agent          # Start Agent Service (port 4002)
pnpm run dev:chat           # Start Chat Service (port 4004)
```

### 3. Get an Agent ID

1. Log into the dashboard at `http://localhost:3000`
2. Go to Agents page
3. Create or select an agent
4. Copy the agent ID (UUID format)

### 4. Test with test.html

1. Open `widget/test.html` in a text editor
2. Update the script tag:
   ```html
   <script src="./dist/widget.iife.js"
           data-agent-id="YOUR-AGENT-ID-HERE"
           data-api-key="pub_key_test123"
           data-api-url="http://localhost:4002"
           data-position="bottom-right"
           data-theme="light"></script>
   ```
3. Save the file
4. Serve the widget directory:
   ```bash
   # Option 1: Using Python
   cd widget
   python -m http.server 8080
   
   # Option 2: Using Node.js http-server
   npx http-server widget -p 8080
   
   # Option 3: Using VS Code Live Server extension
   # Right-click test.html -> Open with Live Server
   ```
5. Open `http://localhost:8080/test.html` in your browser
6. You should see a floating button in the bottom-right corner

### 5. Test Widget Functionality

1. **Click the floating button** - Chat window should open
2. **Type a message** - Should send and receive AI response
3. **Click voice button** - Should attempt to start voice call
4. **Check browser console** - Look for any errors

## Testing Public API Endpoints

### Test Agent Endpoint

```bash
curl -X GET http://localhost:4002/api/public/agents/YOUR-AGENT-ID \
  -H "Authorization: Bearer pub_key_test123"
```

Expected response:
```json
{
  "id": "agent-id",
  "name": "Agent Name",
  "avatar_url": "...",
  "model": "gpt-4o-mini"
}
```

### Test Create Conversation

```bash
curl -X POST http://localhost:4002/api/public/conversations \
  -H "Authorization: Bearer pub_key_test123" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "YOUR-AGENT-ID",
    "channel": "chat"
  }'
```

Expected response:
```json
{
  "conversation": {
    "id": "conversation-id",
    "agent_id": "agent-id",
    "channel": "chat",
    "status": "active",
    "started_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Test Send Message

```bash
curl -X POST http://localhost:4002/api/public/messages \
  -H "Authorization: Bearer pub_key_test123" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "CONVERSATION-ID",
    "content": "Hello, how are you?"
  }'
```

Expected response:
```json
{
  "message": {
    "id": "message-id",
    "conversation_id": "conversation-id",
    "role": "user",
    "content": "Hello, how are you?",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

## Common Issues

### Widget doesn't appear

- Check browser console for errors
- Verify script tag path is correct (`./dist/widget.iife.js`)
- Make sure you're serving from the widget directory
- Check that agent ID is valid UUID format

### API errors (401, 403, 404)

- Verify API key format: `pub_key_xxx`
- Check agent ID matches the one in database
- Ensure Agent Service is running on port 4002
- Check CORS headers in browser network tab

### Messages not sending

- Check Chat Service is running on port 4004
- Verify MongoDB is running (`docker ps`)
- Check browser console for WebSocket errors
- Verify conversation was created successfully

### AI responses not appearing

- Check OpenAI API key is set in Agent Service
- Verify agent has valid system prompt
- Check Agent Service logs for errors
- Ensure Knowledge Base Service is running (if using)

## Debugging

### Enable Debug Logging

The widget logs to browser console with prefix `[Syntera]`:

```javascript
// In browser console
localStorage.setItem('syntera-debug', 'true')
// Reload page
```

### Check Network Requests

1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "api/public"
4. Check request/response details

### Check Service Logs

```bash
# Agent Service logs
# Check terminal where you ran `pnpm run dev:agent`

# Chat Service logs  
# Check terminal where you ran `pnpm run dev:chat`
```

## Next Steps

Once basic testing works:

1. **Test on different browsers** - Chrome, Firefox, Safari, Edge
2. **Test on mobile** - Use mobile browser or responsive mode
3. **Test voice calls** - Requires LiveKit setup
4. **Test avatar** - Requires Avatar Service
5. **Load testing** - Multiple concurrent widgets
6. **CDN deployment** - Upload to CDN and test from external site

