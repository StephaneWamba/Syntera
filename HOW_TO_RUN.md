# How to Run Everything - Services & Frontend

**Complete guide to running all services and frontend in development mode**

## ⚡ Quick Reference

```bash
# Start everything (Docker + all services + frontend)
pnpm run docker:up
pnpm run dev:all

# Individual services
pnpm run dev:chat         # Chat service (port 4004)
pnpm run dev:agent        # Agent service (port 4002)
pnpm run dev:kb           # Knowledge Base (port 4005)
pnpm run dev:voice-agent  # Voice Agent (port 4008, Python)
pnpm run dev:frontend     # Frontend (port 3000)

# Voice Agent (Python) - alternative commands
cd services/voice-agent
python src/main.py --mode both    # Both API + Agent server
python src/main.py --mode api     # API server only
python src/main.py --mode agent   # Agent server only
```

---

## 🚀 Quick Start (All Services + Frontend)

### Option 1: Using Concurrently (Recommended - All in One) ✅

**Already configured!** Just run:

```bash
# 1. Start Docker services (MongoDB, Redis, RabbitMQ)
pnpm run docker:up

# 2. Run all services + frontend in one command
pnpm run dev:all
```

This will start:
- 🔵 **CHAT** service (port 4004) - Blue output
- 🟢 **AGENT** service (port 4002) - Green output  
- 🟡 **KB** (Knowledge Base) service (port 4005) - Yellow output
- 🔷 **VOICE-AGENT** service (port 4008) - Cyan output
- 🟣 **FRONTEND** (Next.js) - Magenta output

**Individual service scripts:**
```bash
pnpm run dev:chat         # Chat service only
pnpm run dev:agent        # Agent service only
pnpm run dev:kb           # Knowledge Base service only
pnpm run dev:voice-agent  # Voice Agent service only (Python)
pnpm run dev:frontend     # Frontend only
```

**Docker management:**
```bash
pnpm run docker:up      # Start Docker services
pnpm run docker:down    # Stop Docker services
pnpm run docker:logs    # View Docker logs
pnpm run docker:restart # Restart Docker services
```

---

## 📋 Prerequisites

### 1. Install Dependencies

```bash
# Root dependencies
pnpm install

# Frontend dependencies
cd frontend
pnpm install

# Shared package
cd ../shared
pnpm install

# Service dependencies
cd ../services/chat
pnpm install

cd ../agent
pnpm install

cd ../knowledge-base
pnpm install

# Voice Agent Service (Python)
cd ../voice-agent
pip install -r requirements.txt
```

### 2. Environment Variables

Make sure you have `.env` files configured:

```bash
# Root .env (for services)
# Copy from .env.example if exists

# Frontend .env.local
cd frontend
# Copy from .env.local.example if exists
```

**Required Environment Variables:**

**Services (.env in each service directory or root):**
- `MONGODB_URI` - MongoDB connection string
- `REDIS_URL` - Redis connection string
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `OPENAI_API_KEY` - OpenAI API key
- `PINECONE_API_KEY` - Pinecone API key
- `PINECONE_INDEX_NAME` - Pinecone index name
- `AGENT_SERVICE_URL` - Agent service URL (default: http://localhost:4002)
- `ALLOWED_ORIGINS` - CORS allowed origins (comma-separated)
- `LIVEKIT_URL` - LiveKit server URL
- `LIVEKIT_API_KEY` - LiveKit API key
- `LIVEKIT_API_SECRET` - LiveKit API secret

**Voice Agent Service (.env in services/voice-agent/):**
- `LIVEKIT_URL` - LiveKit server URL
- `LIVEKIT_API_KEY` - LiveKit API key
- `LIVEKIT_API_SECRET` - LiveKit API secret
- `OPENAI_API_KEY` - OpenAI API key (required for voice responses)
- `AGENT_SERVER_PORT` - Agent server port (default: 4009)
- `API_SERVER_PORT` - API server port (default: 4008)

**Frontend (.env.local):**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_CHAT_SERVICE_URL` - Chat service URL (default: http://localhost:4004)
- `NEXT_PUBLIC_AGENT_SERVICE_URL` - Agent service URL (default: http://localhost:4002)
- `NEXT_PUBLIC_LIVEKIT_URL` - LiveKit server URL
- `PYTHON_AGENT_SERVICE_URL` - Python voice agent service URL (default: http://localhost:4008)

---

## 🏃 Running Individual Services

### Chat Service (Port 4004)

```bash
cd services/chat
pnpm dev
```

**What it does:**
- Handles real-time chat via Socket.io
- Manages conversations and messages in MongoDB
- Connects to Redis for caching

### Agent Service (Port 4002)

```bash
cd services/agent
pnpm dev
```

**What it does:**
- Handles AI agent orchestration
- Generates AI responses using OpenAI
- Integrates with Knowledge Base Service

**Required Environment Variables (services/agent/.env):**
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `LIVEKIT_URL` - LiveKit server URL (e.g., wss://your-project.livekit.cloud)
- `LIVEKIT_API_KEY` - LiveKit API key
- `LIVEKIT_API_SECRET` - LiveKit API secret
- `SUPABASE_STORAGE_ACCESS_KEY` - Supabase Storage S3 access key (for direct upload)
- `SUPABASE_STORAGE_SECRET_KEY` - Supabase Storage S3 secret key (for direct upload)

### Knowledge Base Service (Port 4005)

```bash
cd services/knowledge-base
pnpm dev
```

**What it does:**
- Processes documents (extract, chunk, embed)
- Stores vectors in Pinecone
- Manages document queue with BullMQ

### Voice Agent Service (Port 4008)

```bash
cd services/voice-agent
python src/main.py --mode both
```

**Or using pnpm script:**
```bash
pnpm run dev:voice-agent
```

**What it does:**
- HTTP API server for agent dispatch (port 4008)
- LiveKit Agent Server for voice interactions
- Handles voice call routing and agent responses

**Run modes:**
```bash
# API server only
python src/main.py --mode api

# Agent server only
python src/main.py --mode agent

# Both (default)
python src/main.py --mode both
```

**Prerequisites:**
- Python 3.10+
- Install dependencies: `pip install -r requirements.txt`
- Set environment variables (see Prerequisites section)

### Frontend (Port 3000)

```bash
cd frontend
pnpm dev
```

**What it does:**
- Next.js development server
- React frontend with Socket.io client
- Connects to all backend services

---

## 🐳 Docker Services

### Start Infrastructure Services

```bash
# Start MongoDB, Redis, RabbitMQ
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Service Ports

- **MongoDB**: `27017`
- **Redis**: `6379`
- **RabbitMQ**: `5672` (AMQP), `15672` (Management UI)

---

## 🔧 Development Scripts

### Frontend

```bash
cd frontend
pnpm dev          # Development server (port 3000)
pnpm build        # Production build
pnpm start        # Production server
pnpm lint         # Run ESLint
```

### Services

Each service has similar scripts:

```bash
cd services/[service-name]
pnpm dev          # Development with hot reload
pnpm build        # Build TypeScript
pnpm start        # Production server
```

---

## 📝 Available Scripts

**All scripts are already configured in root `package.json`:**

### Development Scripts
```bash
pnpm run dev:all        # Run all services + frontend concurrently
pnpm run dev:chat       # Chat service only
pnpm run dev:agent      # Agent service only
pnpm run dev:kb         # Knowledge Base service only
pnpm run dev:frontend   # Frontend only
```

### Docker Scripts
```bash
pnpm run docker:up      # Start Docker services (MongoDB, Redis, RabbitMQ)
pnpm run docker:down    # Stop Docker services
pnpm run docker:logs    # View Docker logs
pnpm run docker:restart # Restart Docker services
```

### Quick Start Workflow
```bash
# 1. Start Docker services
pnpm run docker:up

# 2. Start all services + frontend
pnpm run dev:all
```

---

## ✅ Verification

### Check Service Health

```bash
# Chat Service
curl http://localhost:4004/health

# Agent Service
curl http://localhost:4002/health

# Knowledge Base Service
curl http://localhost:4005/health

# Voice Agent Service
curl http://localhost:4008/health
```

### Check Frontend

Open browser: `http://localhost:3000`

### Check Docker Services

```bash
# Check running containers
docker ps

# Check MongoDB
docker exec -it syntera-mongodb-1 mongosh

# Check Redis
docker exec -it syntera-redis-1 redis-cli ping
```

---

## 🐛 Troubleshooting

### Port Already in Use

If a port is already in use:

```bash
# Windows
netstat -ano | findstr :4004
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:4004 | xargs kill -9
```

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
docker ps | grep mongo

# Check MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

### Redis Connection Issues

```bash
# Check if Redis is running
docker ps | grep redis

# Test Redis connection
docker exec -it syntera-redis-1 redis-cli ping
```

### Service Not Starting

1. Check environment variables are set
2. Check service logs
3. Verify dependencies are installed (`pnpm install`)
4. Check port availability

---

## 📊 Service URLs

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Chat Service | http://localhost:4004 | 4004 |
| Agent Service | http://localhost:4002 | 4002 |
| Knowledge Base | http://localhost:4005 | 4005 |
| Voice Agent Service | http://localhost:4008 | 4008 |
| MongoDB | mongodb://localhost:27017 | 27017 |
| Redis | redis://localhost:6379 | 6379 |
| RabbitMQ UI | http://localhost:15672 | 15672 |

---

## 🎯 Recommended Development Workflow

1. **Start Docker services** (MongoDB, Redis, RabbitMQ)
   ```bash
   docker-compose up -d
   ```

2. **Start backend services** (in separate terminals or use concurrently)
   ```bash
   # Terminal 1
   cd services/chat && pnpm dev
   
   # Terminal 2
   cd services/agent && pnpm dev
   
   # Terminal 3
   cd services/knowledge-base && pnpm dev
   
   # Terminal 4 (Voice Agent - Python)
   cd services/voice-agent && python src/main.py --mode both
   ```

3. **Start frontend**
   ```bash
   cd frontend && pnpm dev
   ```

4. **Open browser**
   - Frontend: http://localhost:3000
   - RabbitMQ UI: http://localhost:15672 (guest/guest)

---

## 🚀 Production Build

### Build All Services

```bash
# Build each service
cd services/chat && pnpm build
cd ../agent && pnpm build
cd ../knowledge-base && pnpm build

# Build frontend
cd ../../frontend && pnpm build
```

### Run Production

```bash
# Services
cd services/chat && pnpm start
cd ../agent && pnpm start
cd ../knowledge-base && pnpm start

# Frontend
cd ../../frontend && pnpm start
```

---

## 📚 Additional Resources

- [README.md](README.md) - Project overview
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [TECH_STACK.md](TECH_STACK.md) - Technology stack
- [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) - Supabase configuration


**Complete guide to running all services and frontend in development mode**
