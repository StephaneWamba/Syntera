# Chat Service Deployment Guide

## Railway Deployment

The chat service is configured to deploy automatically to Railway when changes are pushed to the `main` or `develop` branches.

### Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **Connect GitHub to Railway**:
   - Go to Railway Dashboard → New Project → Deploy from GitHub repo
   - Select your repository
   - Railway will automatically set up deployments

### Automatic Deployment

Railway automatically deploys when:
- Code is pushed to `main` or `develop` branches (if Railway is connected to GitHub)
- Changes are made to `services/chat/**` or `shared/**` directories

**Note**: Connect your Railway project to GitHub in Railway dashboard for automatic deployments.

### Manual Deployment

You can trigger deployments manually:

1. **Via Railway Dashboard**:
   - Go to Railway project
   - Click "Deploy" button
   - Select the branch to deploy

2. **Via Railway CLI**:
   ```bash
   railway login
   railway link
   railway up
   ```

3. **Via GitHub Actions** (CI only):
   - The workflow runs CI checks
   - Railway handles actual deployment automatically

### Build Process

The Railway build process (defined in `railway.json`):
1. Railway clones the entire repository (monorepo)
2. Installs dependencies using pnpm (from repository root)
3. Builds the shared package first: `pnpm --filter @syntera/shared build`
4. Builds the chat service: `cd services/chat && pnpm build`
5. Starts the service: `node dist/index.js`

**Note**: Railway's working directory is the repository root (`/app`), so all paths are relative to the root of your monorepo.

### Environment Variables

**Railway Service Integration:**
- When you add **MongoDB** and **Redis** services in Railway, they automatically inject:
  - `MONGO_URL` (from MongoDB service)
  - `REDIS_URL` (from Redis service)
- Make sure these services are connected to your chat service in Railway dashboard

**Required (set manually in Railway):**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AGENT_SERVICE_URL` (URL of the agent service)

**Optional:**
- `PORT` (default: 4004)
- `MONGO_URL` (Railway MongoDB service provides this automatically)
- `REDIS_URL` (Railway Redis service provides this automatically)
- `INTERNAL_SERVICE_TOKEN` (required for inter-service communication)
- `ALLOWED_ORIGINS` (comma-separated CORS origins)

### Monitoring

- Check Railway dashboard for deployment status
- View logs in Railway dashboard or via CLI: `railway logs`
- Health check endpoint: `GET /health`

### Troubleshooting

**Build fails:**
- Check that shared package builds successfully
- Verify all dependencies are in `package.json`
- Check Railway build logs

**Service won't start:**
- Verify all required environment variables are set
- Check service logs in Railway dashboard
- Ensure port 4004 is exposed (or set `PORT` env var)
- Verify MongoDB and Redis connections

**Socket.io connection issues:**
- Ensure CORS is properly configured with `ALLOWED_ORIGINS`
- Check that the frontend is using the correct chat service URL
- Verify WebSocket connections are not blocked by firewall/proxy

**Deployment not triggered:**
- Verify GitHub secrets are set correctly
- Check workflow file path filters
- Ensure changes are in `services/chat/**` or `shared/**`

