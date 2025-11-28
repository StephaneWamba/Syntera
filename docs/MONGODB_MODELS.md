# MongoDB Models Documentation

## Overview

MongoDB is used for storing conversation and message data in Syntera. All models are defined in the `shared` package for reuse across services.

---

## Models

### 1. Conversation Model

**Location**: `shared/src/models/conversation.ts`

**Purpose**: Stores conversation metadata and state

**Schema**:
```typescript
{
  agent_id: string          // Required - Agent configuration ID
  company_id: string       // Required - Company ID
  contact_id?: string      // Optional - CRM contact ID
  user_id?: string         // Optional - Authenticated user ID
  channel: 'chat' | 'voice' | 'video' | 'email' | 'sms'
  status: 'active' | 'ended' | 'archived'
  started_at: Date
  ended_at?: Date
  tags?: string[]
  metadata?: {
    source?: string
    ip_address?: string
    user_agent?: string
    custom_fields?: Record<string, unknown>
  }
  created_at: Date
  updated_at: Date
}
```

**Indexes**:
- `agent_id`
- `company_id`
- `contact_id` (sparse)
- `user_id` (sparse)
- `channel`
- `status`
- `started_at`
- Compound: `{ company_id, status, started_at }`
- Compound: `{ company_id, channel, started_at }`
- Compound: `{ agent_id, status, started_at }`
- Compound: `{ contact_id, started_at }`
- Compound: `{ user_id, started_at }`
- Text: `metadata.custom_fields`

**Usage**:
```typescript
import { Conversation } from '@syntera/shared/models'

// Create conversation
const conversation = await Conversation.create({
  agent_id: 'agent-123',
  company_id: 'company-456',
  channel: 'chat',
  status: 'active',
})

// Find active conversations
const active = await Conversation.find({
  company_id: 'company-456',
  status: 'active',
}).sort({ started_at: -1 })
```

---

### 2. Message Model

**Location**: `shared/src/models/message.ts`

**Purpose**: Stores individual messages within conversations

**Schema**:
```typescript
{
  conversation_id: string
  sender_type: 'user' | 'agent' | 'system'
  role: 'user' | 'assistant' | 'system'  // OpenAI compatibility
  content: string
  message_type: 'text' | 'audio' | 'video' | 'file' | 'image' | 'system'
  attachments?: Array<{
    url: string
    type: string
    name: string
    size?: number
  }>
  ai_metadata?: {
    model?: string
    tokens_used?: number
    response_time_ms?: number
    temperature?: number
    finish_reason?: string
  }
  metadata?: {
    read_at?: Date
    delivered_at?: Date
    edited_at?: Date
    reactions?: Array<{
      emoji: string
      user_id: string
      created_at: Date
    }>
  }
  created_at: Date
}
```

**Indexes**:
- `conversation_id`
- `sender_type`
- `message_type`
- Compound: `{ conversation_id, created_at }`
- Compound: `{ conversation_id, sender_type, created_at }`
- Compound: `{ conversation_id, message_type }`
- Compound: `{ 'ai_metadata.model', created_at }`

**Usage**:
```typescript
import { Message } from '@syntera/shared/models'

// Create message
const message = await Message.create({
  conversation_id: 'conv-123',
  sender_type: 'user',
  role: 'user',
  content: 'Hello!',
  message_type: 'text',
})

// Get conversation messages
const messages = await Message.find({
  conversation_id: 'conv-123',
}).sort({ created_at: 1 })
```

---

## Seed Data

**Location**: `shared/src/seed/seed-data.ts`

**Purpose**: Populate database with sample data for development/testing

**Usage**:
```bash
# Set MONGODB_URI environment variable
export MONGODB_URI="mongodb://..."

# Run seed script
cd shared
npm run seed
```

Or programmatically:
```typescript
import { seedData } from '@syntera/shared/seed/seed-data'

await seedData()
```

**Note**: Update `sampleCompanyId`, `sampleAgentId`, and `sampleContactId` in the seed file with actual IDs from your Supabase database.

---

## Migration Strategy

MongoDB doesn't require migrations in the same way as SQL databases, but you should:

1. **Version your schemas**: Document schema changes in this file
2. **Use migrations for data**: Create migration scripts for data transformations
3. **Test indexes**: Verify indexes are created correctly
4. **Backup before changes**: Always backup before schema changes

**Example Migration Script**:
```typescript
// migrations/add-contact-id.ts
import { Conversation } from '@syntera/shared/models'

async function addContactIdField() {
  // Add contact_id to existing conversations if missing
  await Conversation.updateMany(
    { contact_id: { $exists: false } },
    { $set: { contact_id: null } }
  )
}
```

---

## Best Practices

1. **Always use shared models**: Import from `@syntera/shared/models`
2. **Index optimization**: Add indexes for common query patterns
3. **Sparse indexes**: Use for optional fields (contact_id, user_id)
4. **Compound indexes**: Create for multi-field queries
5. **Metadata flexibility**: Use `metadata` field for extensibility
6. **Timestamps**: Always use `created_at` and `updated_at`
7. **Validation**: Mongoose schemas provide built-in validation

---

## Integration with Services

### Chat Service
- Uses `Conversation` and `Message` models
- Stores real-time chat data
- Updates conversation status

### Agent Service
- Reads `Conversation` for context
- May update `Message` with AI metadata
- Uses conversation history for RAG

### Frontend
- Queries conversations via API
- Displays messages in real-time
- Updates read receipts in metadata

---

## Performance Considerations

1. **Indexes**: All common queries are indexed
2. **Pagination**: Always paginate large result sets
3. **Projection**: Use `.select()` to limit returned fields
4. **Aggregation**: Use aggregation pipeline for complex queries
5. **Caching**: Cache frequently accessed conversations in Redis

---

## Troubleshooting

### Models not found
- Ensure `shared` package is built: `cd shared && npm run build`
- Check import path: `@syntera/shared/models`

### Index creation
- Indexes are created automatically on first model use
- Check with: `db.conversations.getIndexes()`

### Connection issues
- Verify `MONGODB_URI` environment variable
- Check MongoDB connection in `shared/src/database/mongodb.ts`

