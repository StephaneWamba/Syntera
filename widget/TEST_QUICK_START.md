# Quick Start: Test D-ID Integration

## 🚀 Fastest Way to Test

### 1. Start Required Services

**Terminal 1: Frontend (with D-ID proxy)**
```bash
cd frontend
pnpm dev
# Should start on http://localhost:3000
```

**Terminal 2: Agent Service**
```bash
cd services/agent
pnpm dev
# Should start on http://localhost:4002
```

**Terminal 3: Voice Agent Service (Python)**
```bash
cd services/voice-agent
python run.py
# Should start on http://localhost:4008
```

### 2. Verify Environment

Make sure `frontend/.env.local` has:
```env
DID_API_KEY=your_did_api_key_here
```

### 3. Build Widget (if not already built)

```bash
cd widget
pnpm build
```

### 4. Serve Test Page

**Option A: Python**
```bash
cd widget
python -m http.server 8080
```

**Option B: Node.js http-server**
```bash
cd widget
npx http-server -p 8080
```

**Option C: Vite Preview**
```bash
cd widget
pnpm preview
```

### 5. Open Test Page

1. Open browser: `http://localhost:8080/test.html`
2. **Update the script tag** in `test.html`:
   - Set `data-agent-id` to your actual agent ID
   - Set `data-api-key` to your API key
   - Set `data-api-url` to `http://localhost:3000` (frontend URL)

3. Open DevTools (F12) → Console tab

4. Click widget button → Start Voice Call

5. Watch console for D-ID logs:
   ```
   ✅ [D-ID Integration] Starting D-ID integration
   ✅ [D-ID] Session created
   ✅ [D-ID] WebSocket connected
   ✅ [AudioCapture] Started capturing audio
   ```

6. When agent speaks, avatar should animate! 🎉

## 🔍 Quick Debug

**In browser console:**
```javascript
// Check widget status
window.synteraWidget

// Check D-ID integration
checkDIDStatus()

// Check if audio is being captured
window.synteraWidget?.didIntegration?.audioCapture?.getIsCapturing()
```

## ✅ Success Indicators

- ✅ Widget loads without errors
- ✅ Voice call starts successfully
- ✅ D-ID session created (check Network tab)
- ✅ WebSocket connects to D-ID
- ✅ Avatar animates when agent speaks

## ❌ Common Issues

1. **"D-ID API key not configured"**
   - Add `DID_API_KEY` to `frontend/.env.local`
   - Restart frontend server

2. **"Failed to create D-ID session"**
   - Check D-ID API key is valid
   - Check Network tab for error response

3. **"WebSocket connection failed"**
   - May need D-ID Client SDK
   - See `DID_INTEGRATION_NOTES.md`

4. **No avatar animation**
   - Check if audio chunks are being sent
   - Check if video chunks are being received
   - Verify D-ID account has streaming enabled

## 📝 Next Steps

Once test.html works:
- Test in full frontend dashboard
- Test on different browsers
- Test on mobile devices
- Optimize performance

