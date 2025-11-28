# Public API Setup for Widget

## ✅ Completed

### Public API Endpoints Created

All endpoints are now available at `/api/public/*` in the Agent Service:

1. **GET /api/public/agents/:agentId** - Get agent configuration
2. **POST /api/public/conversations** - Create conversation
3. **POST /api/public/messages** - Send message
4. **POST /api/public/livekit/token** - Get LiveKit token for calls
5. **POST /api/public/websocket/config** - Get WebSocket config for chat

### Authentication

- **API Key Authentication** - Uses `Bearer` token with format `pub_key_xxx`
- **CORS Enabled** - All public routes allow cross-origin requests
- **Rate Limiting** - Applied via existing middleware

## 🔧 Configuration

### Environment Variables

No new environment variables required. Uses existing:
- `CHAT_SERVICE_URL` (default: http://localhost:4004)
- `KNOWLEDGE_BASE_SERVICE_URL` (default: http://localhost:4005)

### API Key Format

For MVP, API keys use format: `pub_key_xxx`

**TODO:** In production, implement proper API key storage:
- Store API keys in database
- Map keys to agent_id and company_id
- Validate keys against stored values
- Add key rotation and expiration

## 📝 Usage Example

### Widget Integration

```html
<script src="https://cdn.syntera.com/widget.js"
        data-agent-id="agent-123"
        data-api-key="pub_key_abc123"
        data-api-url="https://api.syntera.com"></script>
```

### API Calls

```javascript
// Get agent
GET /api/public/agents/agent-123
Authorization: Bearer pub_key_abc123

// Create conversation
POST /api/public/conversations
Authorization: Bearer pub_key_abc123
{
  "agentId": "agent-123",
  "channel": "chat"
}

// Send message
POST /api/public/messages
Authorization: Bearer pub_key_abc123
{
  "conversationId": "conv-456",
  "content": "Hello!"
}
```

## 🔒 Security Notes

### Current Implementation (MVP)
- API key format validation (starts with `pub_key_`)
- Agent ID verification
- Company ID verification
- CORS enabled for all origins (widget can be embedded anywhere)

### Production Improvements Needed
1. **API Key Storage** - Store keys in database with proper validation
2. **Key Rotation** - Support key rotation and expiration
3. **Rate Limiting per Key** - Different limits per API key
4. **Domain Whitelist** - Optional domain restrictions per key
5. **Usage Analytics** - Track API usage per key

## 🧪 Testing

### Test the Public API

```bash
# Get agent
curl -X GET http://localhost:4002/api/public/agents/your-agent-id \
  -H "Authorization: Bearer pub_key_test123"

# Create conversation
curl -X POST http://localhost:4002/api/public/conversations \
  -H "Authorization: Bearer pub_key_test123" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "your-agent-id",
    "channel": "chat"
  }'
```

## 📋 Next Steps

1. **Test widget with public API** - Build widget and test end-to-end
2. **Implement proper API key storage** - Move from format validation to database storage
3. **Add API key management UI** - Allow users to generate/manage keys in dashboard
4. **Add usage analytics** - Track widget usage and API calls
5. **Implement rate limiting per key** - Different limits for different keys

## 🐛 Known Issues

1. **API Key Validation** - Currently only validates format, not actual key value
2. **WebSocket Auth** - Chat service needs to accept API key tokens

## 📚 Related Files

- `services/agent/src/routes/public.ts` - Public API routes
- `services/agent/src/middleware/api-key-auth.ts` - API key authentication
- `widget/src/api/client.ts` - Widget API client

