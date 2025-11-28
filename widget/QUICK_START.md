# Widget Quick Start Guide

## ✅ Services Status

All services are running:
- ✅ Agent Service (port 4002)
- ✅ Chat Service (port 4004)
- ✅ MongoDB, Redis, RabbitMQ (Docker)

## 🚀 Quick Test Steps

### Step 1: Get Your Agent ID

1. **Option A: From Dashboard**
   - Go to `http://localhost:3000/dashboard/agents`
   - Click on an agent
   - Copy the agent ID from the URL or agent details page

2. **Option B: From Database**
   ```powershell
   # Connect to Supabase and query agent_configs table
   # Or check the browser console when viewing agents
   ```

3. **Option C: Use Test Agent**
   - If you have a test agent, use its ID
   - Format: UUID like `5a2e77c0-aeff-4ea7-af4f-7e7dbed66595`

### Step 2: Test Public API

Run the test script:

```powershell
cd widget
.\test-api.ps1 -AgentId "YOUR-AGENT-ID" -ApiKey "pub_key_test123"
```

This will test all public API endpoints.

### Step 3: Update test.html

1. Open `widget/test.html`
2. Replace `your-agent-id` with your actual agent ID
3. Save the file

### Step 4: Serve and Test Widget

```powershell
# Option 1: Python
cd widget
python -m http.server 8080

# Option 2: Node.js http-server
npx http-server widget -p 8080

# Option 3: VS Code Live Server
# Right-click test.html -> Open with Live Server
```

Then open `http://localhost:8080/test.html` in your browser.

## 🔍 Troubleshooting

### API Returns 404

**Possible causes:**
1. Agent ID doesn't exist in database
2. Agent belongs to different company
3. API key format incorrect

**Solution:**
- Verify agent ID exists in `agent_configs` table
- Check agent's `company_id` matches your company
- Ensure API key starts with `pub_key_`

### Widget Doesn't Appear

**Check:**
1. Browser console for errors
2. Script path is correct (`./dist/widget.iife.js`)
3. File exists in `widget/dist/` directory
4. Server is serving from widget directory

### Messages Not Sending

**Check:**
1. Chat Service is running (port 4004)
2. MongoDB is running (`docker ps`)
3. Browser console for WebSocket errors
4. Network tab for API request failures

## 📝 Example Agent ID

If you need to create a test agent:

1. Go to `http://localhost:3000/dashboard/agents`
2. Click "Create Agent"
3. Fill in basic info
4. Save
5. Copy the agent ID from the URL or details page

## 🎯 Next Steps

Once basic testing works:
1. Test on different browsers
2. Test on mobile devices
3. Test voice calls (requires LiveKit)
4. Deploy to CDN
5. Test from external website

