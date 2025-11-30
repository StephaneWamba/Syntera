# Knowledge Base Service Deployment Guide

## Railway Deployment

The knowledge-base service is configured to deploy automatically to Railway when changes are pushed to the `main` or `develop` branches.

### Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **Connect GitHub to Railway**:
   - Go to Railway Dashboard → New Project → Deploy from GitHub repo
   - Select your repository
   - Railway will automatically set up deployments

### Automatic Deployment

Railway automatically deploys when:
- Code is pushed to `main` or `develop` branches (if Railway is connected to GitHub)
- Changes are made to `services/knowledge-base/**` or `shared/**` directories

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
4. Builds the knowledge-base service: `cd services/knowledge-base && pnpm build`
5. Starts the service: `node --max-old-space-size=4096 dist/index.js`

**Note**: Railway's working directory is the repository root (`/app`), so all paths are relative to the root of your monorepo.

### Environment Variables

**Railway Service Integration:**
- When you add **Redis** service in Railway, it automatically injects:
  - `REDIS_URL` (from Redis service)
- Make sure the Redis service is connected to your knowledge-base service in Railway dashboard

**Required (set manually in Railway):**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY` (for embeddings)
- `PINECONE_API_KEY` (for vector storage - serverless Pinecone)
- `PINECONE_INDEX_NAME` (default: `syntera-knowledge-base`)

**Optional:**
- `PORT` (default: 4005)
- `REDIS_URL` (Railway Redis service provides this automatically)
- `ALLOWED_ORIGINS` (comma-separated CORS origins, default: `http://localhost:3000`)

### Pinecone Configuration

The knowledge-base service uses **serverless Pinecone** for vector storage:
- API key format: `pcsk_...` (serverless)
- Requires: `PINECONE_API_KEY` and `PINECONE_INDEX_NAME`

### Monitoring

- Check Railway dashboard for deployment status
- View logs in Railway dashboard or via CLI: `railway logs`
- Health check endpoint: `GET /health`
- Queue stats endpoint: `GET /api/documents/queue/stats`

### Troubleshooting

**Build fails:**
- Check that shared package builds successfully
- Verify all dependencies are in `package.json`
- Check Railway build logs
- Ensure sufficient memory (service uses `--max-old-space-size=4096`)

**Service won't start:**
- Verify all required environment variables are set
- Check service logs in Railway dashboard
- Ensure port 4005 is exposed (or set `PORT` env var)
- Verify Pinecone API key is valid and index exists

**Document processing fails:**
- Check Redis connection (required for job queue)
- Verify Pinecone is accessible and index exists
- Check OpenAI API key is valid (required for embeddings)
- Review logs for specific error messages

**Deployment not triggered:**
- Verify GitHub secrets are set correctly
- Check workflow file path filters
- Ensure changes are in `services/knowledge-base/**` or `shared/**`

### Memory Requirements

The knowledge-base service processes large documents and creates embeddings, which requires significant memory:
- Default: 4GB (`--max-old-space-size=4096`)
- For large document processing, consider increasing to 8GB or more
- Railway automatically allocates resources, but you may need to upgrade your plan for heavy workloads

