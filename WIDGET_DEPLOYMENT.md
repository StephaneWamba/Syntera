# Widget Deployment Guide

## Overview

The Syntera widget is a standalone, embeddable JavaScript file that can be added to any website. It needs to be built and deployed to a CDN or static hosting service.

## Deployment Options

### Option 1: Deploy Widget to Vercel (Recommended)

The widget can be deployed as a separate Vercel project that serves the built JavaScript file.

#### Steps:

1. **Build the widget:**
   ```bash
   cd widget
   pnpm install
   pnpm build
   ```

2. **Create a new Vercel project for the widget:**
   - Go to Vercel Dashboard
   - Create a new project
   - Connect it to your GitHub repository
   - Set root directory to `widget`
   - Configure build settings:
     - **Build Command:** `pnpm install && pnpm build`
     - **Output Directory:** `dist`
     - **Install Command:** `pnpm install --frozen-lockfile`

3. **Configure Vercel for static file serving:**
   - Add `vercel.json` in the `widget/` directory (see below)

4. **Get the widget CDN URL:**
   - After deployment, Vercel will provide a URL like: `https://widget-syntera.vercel.app/widget.iife.js`
   - Or use a custom domain: `https://cdn.syntera.com/widget.iife.js`

### Option 2: Deploy to Cloudflare Pages/CDN

1. **Build the widget:**
   ```bash
   cd widget
   pnpm install
   pnpm build
   ```

2. **Upload to Cloudflare:**
   - Upload `dist/widget.iife.js` to Cloudflare CDN
   - Or use Cloudflare Pages with build command: `pnpm install && pnpm build`

3. **Get CDN URL:**
   - Example: `https://cdn.syntera.com/widget.iife.js`

### Option 3: Serve from Vercel Frontend (Current Setup)

You can serve the widget from your existing Vercel frontend project:

1. **Build the widget:**
   ```bash
   cd widget
   pnpm install
   pnpm build
   ```

2. **Copy widget to frontend public directory:**
   ```bash
   cp widget/dist/widget.iife.js frontend/public/widget.js
   cp widget/dist/style.css frontend/public/widget.css
   ```

3. **Widget will be available at:**
   - `https://syntera-tau.vercel.app/widget.js`
   - `https://syntera-tau.vercel.app/widget.css`

## Widget Configuration

### API URL Configuration

The widget's `data-api-url` should point to your **Vercel frontend URL** (not the backend services directly), because:

1. The frontend has CORS-enabled public API routes (`/api/public/*`)
2. The frontend proxies requests to backend services
3. The frontend handles authentication and routing

**Example:**
```html
<script src="https://syntera-tau.vercel.app/widget.js"
        data-agent-id="your-agent-id"
        data-api-key="pub_key_your-key"
        data-api-url="https://syntera-tau.vercel.app"></script>
```

### Required Environment Variables

For the widget to work, ensure these are set in your **Vercel frontend project**:

- `AGENT_SERVICE_URL` - Backend agent service URL (Railway)
- `CHAT_SERVICE_URL` - Backend chat service URL (Railway)
- `KNOWLEDGE_BASE_SERVICE_URL` - Backend knowledge base service URL (Railway)
- `LIVEKIT_URL` - LiveKit server URL
- `LIVEKIT_API_KEY` - LiveKit API key
- `LIVEKIT_API_SECRET` - LiveKit API secret

## Build Script

Add this to your root `package.json`:

```json
{
  "scripts": {
    "build:widget": "cd widget && pnpm install && pnpm build",
    "deploy:widget": "pnpm build:widget && cp widget/dist/widget.iife.js frontend/public/widget.js && cp widget/dist/style.css frontend/public/widget.css"
  }
}
```

## Testing the Widget

1. **Build the widget:**
   ```bash
   cd widget
   pnpm build
   ```

2. **Test locally:**
   ```bash
   cd widget
   pnpm preview
   # Or open widget/test.html in a browser
   ```

3. **Test with deployed API:**
   - Update `widget/test.html` with your Vercel URL
   - Open in browser and test widget functionality

## Embedding the Widget

Once deployed, embed on any website:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>Welcome</h1>
  
  <!-- Syntera Widget -->
  <script src="https://syntera-tau.vercel.app/widget.js"
          data-agent-id="your-agent-id"
          data-api-key="pub_key_your-key"
          data-api-url="https://syntera-tau.vercel.app"
          data-position="bottom-right"
          data-theme="light"></script>
</body>
</html>
```

## Recommended Setup

**For Production:**

1. **Separate Vercel Project for Widget:**
   - Better caching and CDN performance
   - Independent versioning
   - Custom domain: `cdn.syntera.com`

2. **Widget Versioning:**
   - Use versioned URLs: `widget-v1.0.0.js`
   - Allows gradual rollout and rollback

3. **API URL:**
   - Point to production frontend: `https://app.syntera.com`
   - Or use API subdomain: `https://api.syntera.com`

## Troubleshooting

### Widget not loading:
- Check browser console for errors
- Verify script URL is accessible
- Check CORS headers on API endpoints

### API errors:
- Verify `data-api-url` points to Vercel frontend (not backend)
- Check environment variables in Vercel
- Verify API key format: `pub_key_xxx`

### Build errors:
- Ensure all dependencies are installed: `pnpm install`
- Check Node.js version (should be 18+)
- Clear `node_modules` and rebuild

