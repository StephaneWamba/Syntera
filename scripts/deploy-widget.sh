#!/bin/bash
# Script to build and deploy widget to frontend public directory

set -e

echo "🔨 Building widget..."
cd widget
pnpm install
pnpm build

echo "📦 Copying widget files to frontend/public..."
cd ..
cp widget/dist/widget.iife.js frontend/public/widget.js
cp widget/dist/style.css frontend/public/widget.css

echo "✅ Widget deployed to frontend/public/"
echo "   - widget.js"
echo "   - widget.css"
echo ""
echo "Widget will be available at:"
echo "   - https://syntera-tau.vercel.app/widget.js"
echo "   - https://syntera-tau.vercel.app/widget.css"
echo ""
echo "Embed code:"
echo '<script src="https://syntera-tau.vercel.app/widget.js"'
echo '        data-agent-id="your-agent-id"'
echo '        data-api-key="pub_key_your-key"'
echo '        data-api-url="https://syntera-tau.vercel.app"'
echo '        data-position="bottom-right"'
echo '        data-theme="light"></script>'

