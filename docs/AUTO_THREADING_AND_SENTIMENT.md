# Auto-Threading and Sentiment Analysis Implementation Guide

## Overview

This document outlines the LLM-powered batch processing implementation for automatic thread creation and sentiment analysis.

**Key Features:**
- ✅ **LLM-Powered**: Uses GPT-4o-mini for accurate topic detection and sentiment analysis
- ✅ **Batch Processed**: Analyzes conversations after they end, not in real-time
- ✅ **Automatic**: Scheduled job processes ended conversations every 5 minutes
- ✅ **Efficient**: Processes conversations in batches of 50

## 1. Auto-Threading (LLM-Powered, Batch Processed)

### Implementation

**Location**: `services/agent/src/services/threading-analyzer.ts`

**How it works:**
1. After conversation ends, LLM analyzes all messages
2. LLM identifies topic shifts and creates thread boundaries
3. Threads are created in MongoDB with assigned messages
4. Processed in batches for efficiency

**LLM Prompt:**
- Analyzes entire conversation context
- Identifies distinct topics/subjects
- Returns structured JSON with thread boundaries
- Uses GPT-4o-mini for cost efficiency

**Features:**
- Minimum 2 messages per thread
- Maximum 5-7 threads per conversation
- Threads can overlap if messages are relevant to multiple topics
- Thread titles are concise and descriptive (max 50 chars)

## 2. Sentiment Analysis (LLM-Powered, Batch Processed)

### Implementation

**Location**: `services/agent/src/services/threading-analyzer.ts`

**How it works:**
1. After conversation ends, LLM analyzes all user messages
2. LLM provides sentiment for each message and overall conversation
3. Sentiment scores stored in message and conversation metadata
4. Processed in batches for efficiency

**LLM Analysis:**
- Analyzes each user message individually
- Provides sentiment score (-1 to 1)
- Calculates overall conversation sentiment
- Detects sentiment trends (improving/declining/stable)

**Storage:**
- Message metadata: `sentiment`, `sentiment_score`, `sentiment_confidence`
- Conversation metadata: `overall_sentiment`, `sentiment_score`, `sentiment_trend`, `sentiment_analyzed_at`

## 3. Batch Processing Architecture

### Flow

```
Conversation Ends
    ↓
Scheduled Job (every 5 min)
    ↓
Find Unprocessed Conversations (status='ended')
    ↓
Batch Process (50 at a time)
    ↓
For each conversation:
    ├─ Fetch all messages
    ├─ LLM Threading Analysis → Create threads
    └─ LLM Sentiment Analysis → Update metadata
    ↓
Mark as processed (metadata.sentiment_analyzed_at)
```

### Scheduled Processing

**Location**: `services/agent/src/jobs/analysis-processor.ts`

- Runs every 5 minutes
- Processes 50 conversations per batch
- Only processes conversations with `status='ended'`
- Skips already processed conversations

### Database Schema Updates

```typescript
// Message metadata
interface MessageMetadata {
  sentiment?: {
    label: 'positive' | 'neutral' | 'negative'
    score: number
    confidence: number
  }
  topic?: string
  intent?: string
  auto_threaded?: boolean
}

// Conversation metadata
interface ConversationMetadata {
  overall_sentiment?: {
    average_score: number
    trend: 'improving' | 'declining' | 'stable'
    last_updated: Date
  }
  auto_threads_enabled?: boolean
}
```

## 4. API Endpoints

### POST /api/analysis/batch-process
Manually trigger batch processing for specific conversations or filtered conversations.

**Request:**
```json
{
  "conversationIds": ["id1", "id2"],  // Optional: specific conversations
  "analyzeThreading": true,
  "analyzeSentiment": true,
  "filter": {  // Optional: filter conversations
    "status": "ended",
    "dateFrom": "2024-01-01",
    "dateTo": "2024-12-31",
    "limit": 100
  }
}
```

### POST /api/analysis/process-ended
Process all ended conversations that haven't been analyzed yet.

**Request:**
```json
{
  "analyzeThreading": true,
  "analyzeSentiment": true,
  "limit": 50
}
```

## 5. Automatic Processing

The analysis processor runs automatically:
- **Interval**: Every 5 minutes
- **Batch Size**: 50 conversations
- **Enabled by**: `ENABLE_AUTO_ANALYSIS` env var (default: true)

To disable: Set `ENABLE_AUTO_ANALYSIS=false`

## 6. Configuration

### Environment Variables
```bash
# Enable/disable automatic batch processing
ENABLE_AUTO_ANALYSIS=true  # Default: true

# LLM Configuration (uses existing OpenAI config)
OPENAI_API_KEY=...  # Required for LLM analysis
```

### Processing Settings
Edit `services/agent/src/jobs/analysis-processor.ts`:
- `BATCH_SIZE`: Number of conversations per batch (default: 50)
- `PROCESS_INTERVAL_MS`: Processing interval (default: 5 minutes)

## 7. Usage

### Automatic Processing
The system automatically processes ended conversations every 5 minutes. No action needed.

### Manual Processing
```bash
# Process specific conversations
curl -X POST http://localhost:4002/api/analysis/batch-process \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationIds": ["conv1", "conv2"],
    "analyzeThreading": true,
    "analyzeSentiment": true
  }'

# Process all unprocessed ended conversations
curl -X POST http://localhost:4002/api/analysis/process-ended \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "analyzeThreading": true,
    "analyzeSentiment": true,
    "limit": 100
  }'
```

## 8. Frontend Integration

### Display Sentiment
- Show sentiment indicators in transcripts page
- Color-code messages by sentiment
- Display overall conversation sentiment

### Display Threads
- Show auto-generated threads in sidebar
- Allow users to view/filter by thread
- Show thread titles and message counts

## 9. Implementation Status

✅ **Completed:**
- LLM-powered threading analysis
- LLM-powered sentiment analysis
- Batch processing service
- Scheduled job processor
- API endpoints

🔄 **Next Steps:**
- Add UI for sentiment visualization
- Add thread management UI
- Add sentiment alerts/notifications

