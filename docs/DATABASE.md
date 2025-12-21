# Syntera Database Architecture

**Database design and optimization strategies**

This document outlines the database architecture, schema design decisions, indexing strategies, and multi-tenant data isolation patterns implemented in Syntera.

---

## 🏗️ Database Architecture Overview

Syntera uses a **dual-database architecture** optimized for different data access patterns:

| Database | Purpose | Data Type | Access Pattern |
|----------|---------|-----------|----------------|
| **PostgreSQL (Supabase)** | Business data, configurations, CRM | Structured, relational | ACID transactions, complex queries |
| **MongoDB** | Conversations, messages | Document-based, high-volume writes | Flexible schemas, time-series data |
| **Redis** | Caching, sessions | Key-value | Fast lookups, temporary data |
| **Pinecone** | Vector embeddings | Vector data | Semantic search, similarity queries |

### Design Rationale

**PostgreSQL for Business Data:**
- Requires ACID transactions (CRM operations, agent configurations)
- Complex relational queries (analytics, reporting)
- Row-level security for multi-tenant isolation
- Structured schema with foreign key constraints

**MongoDB for Conversations:**
- High write throughput (messages, real-time updates)
- Flexible schema for evolving message metadata
- Time-series data patterns (message history)
- Horizontal scaling for conversation volume

---

## 📊 PostgreSQL Schema Design

### Core Tables

#### Companies Table
```sql
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_tier TEXT DEFAULT 'starter',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Design Decisions:**
- UUID primary keys for distributed system compatibility
- References Supabase `auth.users` for authentication integration
- Subscription tier for future billing features
- Automatic timestamp management via triggers

#### Users Table
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'owner')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Design Decisions:**
- Extends Supabase auth.users (no duplication)
- CASCADE delete from auth.users ensures data consistency
- SET NULL on company deletion preserves user records
- Role-based access control at database level

#### Agent Configurations
```sql
CREATE TABLE public.agent_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  system_prompt TEXT NOT NULL,
  model TEXT DEFAULT 'gpt-4o-mini',
  temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
  voice_settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Design Decisions:**
- JSONB for flexible voice settings (allows schema evolution)
- CHECK constraints for data validation (temperature range)
- Company-scoped with CASCADE delete
- Indexed on company_id for fast tenant queries

### CRM Tables

#### Contacts
```sql
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  first_name TEXT,
  last_name TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Design Decisions:**
- TEXT[] array for tags (efficient PostgreSQL array operations)
- JSONB metadata for flexible custom fields
- Optional email/phone (sparse data pattern)
- Company-scoped isolation

#### Deals (Sales Pipeline)
```sql
CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  value DECIMAL(12,2),
  stage TEXT DEFAULT 'lead' CHECK (stage IN ('lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost')),
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Design Decisions:**
- DECIMAL(12,2) for precise currency values
- ENUM-like CHECK constraints for stage validation
- SET NULL on contact deletion (preserves deal history)
- Indexed on stage for pipeline queries

### Knowledge Base Schema

```sql
CREATE TABLE public.knowledge_base_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agent_configs(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  chunk_count INTEGER DEFAULT 0,
  vector_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);
```

**Design Decisions:**
- Status tracking for async document processing
- Separate chunk_count and vector_count for monitoring
- JSONB metadata for processing errors and extracted text
- Indexed on status for processing queue queries

### Workflow Schema

```sql
CREATE TABLE public.workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN (...)),
  trigger_config JSONB DEFAULT '{}',
  nodes JSONB NOT NULL DEFAULT '[]',
  edges JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Design Decisions:**
- JSONB for nodes/edges (visual workflow builder data)
- Trigger config as JSONB (flexible trigger conditions)
- Enabled flag for workflow activation/deactivation
- Separate executions table for audit trail

---

## 🔒 Row Level Security (RLS)

### Multi-Tenant Isolation

All business tables have RLS enabled with company-scoped policies:

```sql
-- Example: Agent Configs RLS Policy
CREATE POLICY "Users can view company agent configs"
  ON public.agent_configs FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.users WHERE id = auth.uid()
    )
  );
```

**Security Pattern:**
1. User authenticates via Supabase Auth (JWT token)
2. `auth.uid()` extracts user ID from JWT
3. Policy checks user's company_id
4. Only returns rows matching user's company

**Benefits:**
- Database-level security (cannot be bypassed by application code)
- Automatic tenant isolation for all queries
- No manual WHERE clause filtering required
- Prevents data leakage between companies

### Policy Types

**SELECT Policies:**
- Users can view their company's data
- Automatic filtering by company_id

**INSERT/UPDATE/DELETE Policies:**
- Users can manage their company's resources
- Role-based restrictions (owner/admin only for workflows)

**Service Role Bypass:**
- Service role key bypasses RLS (for background jobs)
- Used by microservices for system operations

---

## 📈 Indexing Strategy

### Single-Column Indexes

**Company ID Indexes:**
```sql
CREATE INDEX idx_agent_configs_company_id ON public.agent_configs(company_id);
CREATE INDEX idx_contacts_company_id ON public.contacts(company_id);
CREATE INDEX idx_deals_company_id ON public.deals(company_id);
```

**Purpose:** Fast tenant-scoped queries (most common access pattern)

**Status Indexes:**
```sql
CREATE INDEX idx_kb_documents_status ON public.knowledge_base_documents(status);
CREATE INDEX idx_workflows_enabled ON public.workflows(enabled);
```

**Purpose:** Filter active/enabled resources efficiently

**Timestamp Indexes:**
```sql
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX idx_call_recordings_started_at ON public.call_recordings(started_at DESC);
```

**Purpose:** Time-range queries for analytics and history

### Compound Indexes

**Company + Status:**
```sql
CREATE INDEX idx_kb_documents_company_status 
ON public.knowledge_base_documents(company_id, status);
```

**Purpose:** Filter by company and status in single index lookup

**Company + Timestamp:**
```sql
CREATE INDEX idx_kb_documents_company_created 
ON public.knowledge_base_documents(company_id, created_at DESC);
```

**Purpose:** Efficient pagination and sorting within tenant

**Multi-Column Analytics:**
```sql
CREATE INDEX idx_call_history_company_started 
ON public.call_history(company_id, started_at DESC);
```

**Purpose:** Time-series queries scoped to company

### Partial Indexes

**Sparse Data:**
```sql
CREATE INDEX idx_agent_configs_public_api_key 
ON public.agent_configs(public_api_key) 
WHERE public_api_key IS NOT NULL;
```

**Purpose:** Index only rows with non-null values (reduces index size)

---

## 🍃 MongoDB Schema Design

### Conversation Model

```typescript
{
  agent_id: string,
  company_id: string,
  contact_id?: string,
  channel: 'chat' | 'voice' | 'email',
  status: 'active' | 'ended' | 'archived',
  started_at: Date,
  ended_at?: Date,
  threads?: Array<{
    id: string,
    title: string,
    created_at: Date
  }>,
  summary?: string,
  metadata: {}
}
```

**Design Decisions:**
- Flexible metadata object for evolving requirements
- Threads array for conversation organization
- Optional fields (contact_id, ended_at) for sparse data
- Timestamps for time-series queries

**Indexes:**
```typescript
// Compound indexes for common queries
{ company_id: 1, status: 1, started_at: -1 }
{ company_id: 1, channel: 1, started_at: -1 }
{ agent_id: 1, status: 1, started_at: -1 }
{ contact_id: 1, started_at: -1 }
```

### Message Model

```typescript
{
  conversation_id: string,
  thread_id?: string,
  sender_type: 'user' | 'agent' | 'system',
  content: string,
  message_type: 'text' | 'audio' | 'file',
  ai_metadata?: {
    model: string,
    tokens_used: number,
    response_time_ms: number
  },
  metadata: {
    intent?: {},
    sentiment?: {},
    reactions?: []
  }
}
```

**Design Decisions:**
- Nested metadata for AI analysis results
- Sparse indexes on optional fields (thread_id)
- Compound indexes for conversation queries
- Timestamps only on creation (messages immutable)

**Indexes:**
```typescript
{ conversation_id: 1, created_at: 1 }
{ conversation_id: 1, sender_type: 1, created_at: -1 }
{ conversation_id: 1, thread_id: 1, created_at: 1 }
{ 'ai_metadata.model': 1, created_at: -1 }
```

---

## 🔄 Connection Management

### PostgreSQL Connection Pooling

**Supabase Client:**
- Automatic connection pooling via Supabase SDK
- Connection limits managed by Supabase infrastructure
- Service role key for elevated permissions

**Connection Pattern:**
```typescript
const supabase = getSupabaseClient() // Singleton pattern
const { data } = await supabase
  .from('agent_configs')
  .select('*')
  .eq('company_id', companyId)
```

### MongoDB Connection Pooling

**Configuration:**
```typescript
await mongoose.connect(uri, {
  maxPoolSize: 50,
  minPoolSize: 10,
  maxIdleTimeMS: 30000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 30000
})
```

**Design Decisions:**
- Connection pool sizing based on service load
- Idle timeout for resource cleanup
- Server selection timeout for failover
- Buffer commands disabled for immediate errors

---

## 🔍 Query Optimization Patterns

### Tenant-Scoped Queries

**Always filter by company_id first:**
```typescript
// ✅ Good: Company filter first
const agents = await supabase
  .from('agent_configs')
  .select('*')
  .eq('company_id', companyId)
  .eq('enabled', true)

// ❌ Bad: Missing company filter (RLS handles, but explicit is better)
const agents = await supabase
  .from('agent_configs')
  .select('*')
  .eq('enabled', true)
```

### Pagination Patterns

**Cursor-based pagination:**
```typescript
const conversations = await Conversation.find({
  company_id: companyId,
  started_at: { $lt: lastTimestamp }
})
.sort({ started_at: -1 })
.limit(20)
```

**Offset pagination (PostgreSQL):**
```typescript
const deals = await supabase
  .from('deals')
  .select('*')
  .eq('company_id', companyId)
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1)
```

### Aggregation Queries

**MongoDB Analytics:**
```typescript
const stats = await Conversation.aggregate([
  { $match: { company_id, started_at: { $gte: startDate } } },
  { $group: {
    _id: '$channel',
    count: { $sum: 1 },
    avgDuration: { $avg: { $subtract: ['$ended_at', '$started_at'] } }
  }},
  { $sort: { count: -1 } }
])
```

**PostgreSQL Analytics:**
```sql
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as conversation_count,
  AVG(EXTRACT(EPOCH FROM (ended_at - started_at))) as avg_duration
FROM conversations
WHERE company_id = $1
  AND created_at >= $2
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;
```

---

## 🔄 Migration Strategy

### Versioned Migrations

**File naming:** `001_initial_schema.sql`, `002_row_level_security.sql`

**Migration pattern:**
1. Create new tables/columns
2. Add indexes after data migration
3. Update RLS policies
4. Add triggers for automation

**Rollback considerations:**
- Migrations are additive (no destructive changes)
- New columns are nullable or have defaults
- Indexes can be dropped if needed
- RLS policies can be disabled

### Schema Evolution

**Adding new fields:**
```sql
-- Add nullable column
ALTER TABLE public.agent_configs 
ADD COLUMN avatar_url TEXT;

-- Add with default
ALTER TABLE public.contacts 
ADD COLUMN tags TEXT[] DEFAULT '{}';
```

**JSONB flexibility:**
- Metadata fields use JSONB for schema evolution
- No migrations needed for new metadata keys
- Application code handles JSONB structure

---

## 🚀 Performance Considerations

### Index Maintenance

**Monitor index usage:**
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

**Unused indexes:**
- Remove indexes with zero scans
- Review compound indexes for query patterns
- Balance query speed vs. write performance

### Query Performance

**EXPLAIN ANALYZE:**
```sql
EXPLAIN ANALYZE
SELECT * FROM agent_configs
WHERE company_id = 'uuid'
  AND enabled = true;
```

**Common optimizations:**
- Use indexes for WHERE clauses
- Limit result sets with pagination
- Use SELECT specific columns (not *)
- Avoid N+1 queries with joins

### MongoDB Performance

**Query profiling:**
```typescript
// Enable profiling for slow queries
db.setProfilingLevel(1, { slowms: 100 })

// Analyze query plans
db.conversations.find({ company_id: '...' }).explain('executionStats')
```

**Optimization patterns:**
- Compound indexes match query patterns
- Use projection to limit returned fields
- Batch operations for bulk updates
- TTL indexes for automatic cleanup

---

## 🔐 Data Isolation Patterns

### Company-Level Isolation

**PostgreSQL (RLS):**
- Automatic filtering at database level
- No application-level filtering required
- Prevents accidental cross-tenant access

**MongoDB:**
- Application-level filtering required
- Always include company_id in queries
- Compound indexes include company_id

### Data Deletion

**CASCADE Deletes:**
```sql
-- Company deletion cascades to all related data
ON DELETE CASCADE -- agent_configs, contacts, deals

-- Contact deletion preserves deal history
ON DELETE SET NULL -- deals.contact_id
```

**Soft Deletes:**
- Some tables use status flags instead of deletion
- Conversations archived instead of deleted
- Preserves audit trail and analytics

---

## 📊 Monitoring & Maintenance

### Database Health

**Connection monitoring:**
- Track active connections vs. pool size
- Monitor connection errors and timeouts
- Alert on connection pool exhaustion

**Query performance:**
- Log slow queries (>100ms)
- Monitor index usage statistics
- Track query execution times

**Storage management:**
- Monitor table sizes and growth
- Plan for data archival strategies
- Clean up old analytics events

### Backup Strategy

**PostgreSQL (Supabase):**
- Automated daily backups
- Point-in-time recovery available
- Manual backup exports via Supabase dashboard

**MongoDB (Railway):**
- Automated backups via Railway
- Backup retention policies
- Manual backup exports available

---

**Database architecture designed for multi-tenant scalability, performance, and data isolation.**
