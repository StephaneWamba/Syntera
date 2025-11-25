# Syntera Embeddable Widget

A standalone, embeddable AI chat widget with avatar support that can be easily added to any website.

## Features

- 🤖 **AI Avatar** - Animated avatar with lip-sync
- 💬 **Text Chat** - Real-time messaging
- 🎤 **Voice/Video Calls** - Start calls with AI agent
- 🎨 **Customizable** - Theme and position options
- 📱 **Mobile Responsive** - Works on all devices
- ⚡ **Lightweight** - Fast loading, minimal dependencies

## Quick Start

### 1. Build the Widget

```bash
cd widget
pnpm install
pnpm build
```

The built widget will be in `dist/widget.iife.js`

### 2. Host on CDN

Upload `dist/widget.iife.js` to your CDN (e.g., Cloudflare, AWS CloudFront, etc.)

### 3. Embed on Website

Add this script tag to any website:

```html
<script src="https://cdn.syntera.com/widget.iife.js"
        data-agent-id="your-agent-id"
        data-api-key="your-api-key"
        data-api-url="https://api.syntera.com"></script>
```

## Configuration Options

| Attribute | Required | Default | Description |
|-----------|----------|---------|-------------|
| `data-agent-id` | ✅ Yes | - | Your Syntera agent ID |
| `data-api-key` | ✅ Yes | - | Your Syntera API key |
| `data-api-url` | ❌ No | `https://api.syntera.com` | API base URL |
| `data-position` | ❌ No | `bottom-right` | Widget position: `bottom-right`, `bottom-left`, `top-right`, `top-left` |
| `data-theme` | ❌ No | `light` | Theme: `light` or `dark` |

## Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>Welcome to My Site</h1>
  
  <!-- Syntera Widget -->
  <script src="https://cdn.syntera.com/widget.js"
          data-agent-id="agent-123"
          data-api-key="pub_key_abc123"
          data-api-url="https://api.syntera.com"
          data-position="bottom-right"
          data-theme="light"></script>
</body>
</html>
```

## Advanced Usage

### Programmatic Control

The widget exposes a global API:

```javascript
// Open widget
window.synteraWidget.open()

// Close widget
window.synteraWidget.close()

// Send message programmatically
await window.synteraWidget.sendMessage('Hello!')
```

### Custom Initialization

```javascript
import { SynteraWidget } from '@syntera/widget'

const widget = new SynteraWidget({
  agentId: 'agent-123',
  apiKey: 'your-api-key',
  apiUrl: 'https://api.syntera.com',
  position: 'bottom-right',
  theme: 'dark',
})

await widget.init()
```

## Development

```bash
# Install dependencies
pnpm install

# Development mode (watch)
pnpm dev

# Build for production
pnpm build

# Type check
pnpm type-check
```

## Architecture

```
widget/
├── src/
│   ├── index.ts              # Auto-initialization
│   ├── widget.ts             # Main widget class
│   ├── api/
│   │   ├── client.ts         # HTTP API client
│   │   └── websocket.ts      # WebSocket client
│   ├── ui/
│   │   ├── chat-interface.ts  # Chat UI
│   │   └── avatar-player.ts  # Avatar video player
│   └── types.ts              # TypeScript types
├── dist/
│   └── widget.js             # Bundled output
└── package.json
```

## API Endpoints Required

The widget requires these public API endpoints:

- `GET /api/public/agents/:agentId` - Get agent config
- `POST /api/public/conversations` - Create conversation
- `POST /api/public/messages` - Send message
- `POST /api/public/livekit/token` - Get LiveKit token
- `POST /api/public/websocket/config` - Get WebSocket config
- `GET /api/public/avatar/stream/:conversationId` - Get avatar stream URL

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## License

Private - Syntera Internal Use

