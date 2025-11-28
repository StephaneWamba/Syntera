# Sample Agent Configuration

## 📋 Complete Agent Configuration Example

Here's a sample agent configuration that you can use for testing:

### Example 1: Customer Support Agent

```json
{
  "name": "Customer Support Agent",
  "description": "Helpful customer support assistant for handling inquiries and resolving issues",
  "system_prompt": "You are a professional customer support assistant. Your role is to:\n- Help customers resolve issues quickly and efficiently\n- Provide clear, step-by-step instructions\n- Show empathy and understanding when customers are frustrated\n- Escalate complex issues when needed\n- Always be polite, patient, and professional\n- Use the knowledge base to provide accurate information\n\nBe concise and direct. Keep responses under 100 words unless detailed explanation is necessary.",
  "model": "gpt-4o-mini",
  "temperature": 0.7,
  "max_tokens": 800,
  "enabled": true,
  "voice_settings": {
    "voice": "nova",
    "language": "en-US",
    "speed": 1.0,
    "pitch": 1.0,
    "video_enabled": false,
    "screen_sharing_enabled": false
  }
}
```

### Example 2: Sales Agent

```json
{
  "name": "Sales Assistant",
  "description": "Enthusiastic sales agent for product inquiries and lead qualification",
  "system_prompt": "You are a professional sales assistant. Your role is to:\n- Answer product questions accurately and enthusiastically\n- Qualify leads based on budget, timeline, and needs\n- Highlight key features and benefits\n- Overcome objections with facts and benefits\n- Be friendly but professional\n- Always ask for the sale when appropriate\n\nBe concise and direct. Keep responses under 100 words unless detailed explanation is necessary.",
  "model": "gpt-4o-mini",
  "temperature": 0.8,
  "max_tokens": 800,
  "enabled": true,
  "voice_settings": {
    "voice": "echo",
    "language": "en-US",
    "speed": 1.1,
    "pitch": 1.0,
    "video_enabled": false,
    "screen_sharing_enabled": false
  }
}
```

### Example 3: Technical Support Agent

```json
{
  "name": "Technical Support Specialist",
  "description": "Technical expert for troubleshooting and technical questions",
  "system_prompt": "You are a technical support specialist. Your role is to:\n- Provide accurate technical information\n- Troubleshoot issues systematically\n- Explain technical concepts in simple terms\n- Guide users through step-by-step solutions\n- Escalate complex technical issues when needed\n- Be patient and thorough\n\nBe concise and direct. Keep responses under 100 words unless detailed explanation is necessary.",
  "model": "gpt-4o-mini",
  "temperature": 0.6,
  "max_tokens": 1000,
  "enabled": true,
  "voice_settings": {
    "voice": "onyx",
    "language": "en-US",
    "speed": 1.0,
    "pitch": 0.9,
    "video_enabled": false,
    "screen_sharing_enabled": false
  }
}
```

---

## 🔧 Field Descriptions

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | string | Agent name (1-100 chars) | "Customer Support Agent" |
| `system_prompt` | string | Instructions for the AI (10-10000 chars) | "You are a helpful assistant..." |

### Optional Fields

| Field | Type | Default | Description | Example |
|-------|------|---------|-------------|---------|
| `description` | string | `null` | Agent description (max 500 chars) | "Helpful customer support assistant" |
| `model` | string | `"gpt-4o-mini"` | OpenAI model to use | `"gpt-4o-mini"`, `"gpt-3.5-turbo"`, `"gpt-4-turbo"` |
| `temperature` | number | `0.7` | Creativity (0-2) | `0.7` (balanced), `0.3` (focused), `1.0` (creative) |
| `max_tokens` | number | `800` | Max response length (100-4000) | `800` (concise), `1500` (detailed) |
| `enabled` | boolean | `true` | Whether agent is active | `true` or `false` |
| `voice_settings` | object | `{}` | Voice configuration | See below |

### Voice Settings

| Field | Type | Default | Description | Options |
|-------|------|---------|-------------|---------|
| `voice` | string | - | Voice selection | `"alloy"`, `"echo"`, `"fable"`, `"onyx"`, `"nova"`, `"shimmer"` |
| `language` | string | - | Language code | `"en-US"`, `"en-GB"`, etc. |
| `speed` | number | `1.0` | Speech speed (0.5-2.0) | `0.8` (slow), `1.0` (normal), `1.5` (fast) |
| `pitch` | number | `1.0` | Voice pitch (0.5-2.0) | `0.8` (lower), `1.0` (normal), `1.2` (higher) |
| `video_enabled` | boolean | `false` | Enable video calls | `true` or `false` |
| `screen_sharing_enabled` | boolean | `false` | Enable screen sharing | `true` or `false` |
| `video_quality` | string | - | Video quality | `"sd"`, `"hd"`, `"full-hd"` |

---

## 📝 Minimal Configuration

**Minimum required fields:**

```json
{
  "name": "Basic Agent",
  "system_prompt": "You are a helpful assistant. Answer questions clearly and concisely."
}
```

All other fields will use defaults:
- `model`: `"gpt-4o-mini"`
- `temperature`: `0.7`
- `max_tokens`: `800`
- `enabled`: `true`
- `voice_settings`: `{}`

---

## 🎯 Recommended Configurations by Use Case

### Customer Support (Empathetic)
```json
{
  "name": "Support Agent",
  "system_prompt": "You are a customer support assistant. Be empathetic, patient, and solution-oriented. When customers express frustration, acknowledge their feelings and work towards resolution.",
  "temperature": 0.7,
  "max_tokens": 800
}
```

### Sales (Enthusiastic)
```json
{
  "name": "Sales Agent",
  "system_prompt": "You are a sales assistant. Be enthusiastic, highlight benefits, and guide customers towards making a purchase decision.",
  "temperature": 0.8,
  "max_tokens": 600
}
```

### Technical (Precise)
```json
{
  "name": "Technical Agent",
  "system_prompt": "You are a technical support specialist. Provide accurate, step-by-step technical guidance. Be precise and thorough.",
  "temperature": 0.5,
  "max_tokens": 1200
}
```

### General Assistant (Balanced)
```json
{
  "name": "General Assistant",
  "system_prompt": "You are a helpful AI assistant. Answer questions accurately, provide useful information, and be friendly and professional.",
  "temperature": 0.7,
  "max_tokens": 800
}
```

---

## 🔄 Creating via API

### Using cURL

```bash
curl -X POST http://localhost:4002/api/agents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Customer Support Agent",
    "description": "Helpful customer support assistant",
    "system_prompt": "You are a professional customer support assistant. Help customers resolve issues quickly and efficiently.",
    "model": "gpt-4o-mini",
    "temperature": 0.7,
    "max_tokens": 800,
    "enabled": true
  }'
```

### Using the UI

1. Navigate to `/dashboard/agents/new`
2. Fill in the form:
   - **Name**: Enter agent name
   - **Description**: (Optional) Brief description
   - **System Prompt**: Instructions for the agent
   - **Model**: Select from dropdown (default: gpt-4o-mini)
   - **Temperature**: Adjust slider (0-2)
   - **Max Tokens**: Adjust slider (100-4000)
   - **Voice Settings**: (Optional) Configure voice options
3. Click "Create Agent"

---

## 💡 Tips

1. **System Prompt**: Be specific about the agent's role and behavior
2. **Temperature**: 
   - Lower (0.3-0.5): More focused, consistent
   - Medium (0.7): Balanced creativity and consistency
   - Higher (0.9-1.2): More creative, varied responses
3. **Max Tokens**: 
   - 500-800: Concise responses (recommended for chat)
   - 1000-1500: Detailed responses
   - 2000+: Very detailed (use sparingly)
4. **Model Selection**:
   - `gpt-4o-mini`: Fast, cost-effective, good quality (recommended)
   - `gpt-3.5-turbo`: Fastest, cheapest, good for simple tasks
   - `gpt-4-turbo`: Best quality, slower, more expensive

---

## ✅ Testing Your Agent

After creating an agent:

1. Go to `/dashboard/chat`
2. Select your agent from the dropdown
3. Start a conversation
4. Test different message types to see:
   - Intent detection badges
   - Sentiment analysis badges
   - Agent response quality
   - Response time

---

## 📊 Example Agent IDs for Testing

If you need to reference an agent ID in API calls or testing, you can:

1. Create an agent via UI
2. Check the agent list at `/dashboard/agents`
3. Copy the agent ID from the URL or API response

The agent ID will be a UUID like: `5a2e77c0-aeff-4ea7-af4f-7e7dbed66595`



