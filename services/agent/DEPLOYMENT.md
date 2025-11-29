# Agent Service Deployment Guide

## Railway Deployment

The agent service is configured to deploy automatically to Railway when changes are pushed to the `main` or `develop` branches.

### Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **Connect GitHub to Railway**:
   - Go to Railway Dashboard → New Project → Deploy from GitHub repo
   - Select your repository
   - Railway will automatically set up deployments

### Automatic Deployment

Railway automatically deploys when:
- Code is pushed to `main` or `develop` branches (if Railway is connected to GitHub)
- Changes are made to `services/agent/**` or `shared/**` directories

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
4. Builds the agent service: `cd services/agent && pnpm build`
5. Starts the service: `node dist/index.js`

**Note**: Railway's working directory is the repository root (`/app`), so all paths are relative to the root of your monorepo.

### Environment Variables

Make sure to set these environment variables in Railway:

**Required:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

**Optional:**
- `PORT` (default: 4002)
- `MONGODB_URI`
- `REDIS_URL`
- `LIVEKIT_URL`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `EMAIL_PROVIDER` (resend or sendgrid)
- `RESEND_API_KEY` or `SENDGRID_API_KEY`
- `EMAIL_FROM`
- `ENABLE_AUTO_ANALYSIS`

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
- Ensure port 4002 is exposed (or set `PORT` env var)

**Deployment not triggered:**
- Verify GitHub secrets are set correctly
- Check workflow file path filters
- Ensure changes are in `services/agent/**` or `shared/**`

