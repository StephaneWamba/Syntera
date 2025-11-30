# PowerShell script to build and deploy widget to frontend public directory

Write-Host "🔨 Building widget..." -ForegroundColor Cyan
Set-Location widget
pnpm install
pnpm build

Write-Host "📦 Copying widget files to frontend/public..." -ForegroundColor Cyan
Set-Location ..
Copy-Item widget/dist/widget.iife.js frontend/public/widget.js -Force
Copy-Item widget/dist/style.css frontend/public/widget.css -Force

Write-Host "✅ Widget deployed to frontend/public/" -ForegroundColor Green
Write-Host "   - widget.js" -ForegroundColor Gray
Write-Host "   - widget.css" -ForegroundColor Gray
Write-Host ""
Write-Host "Widget will be available at:" -ForegroundColor Yellow
Write-Host "   - https://syntera-tau.vercel.app/widget.js" -ForegroundColor Gray
Write-Host "   - https://syntera-tau.vercel.app/widget.css" -ForegroundColor Gray
Write-Host ""
Write-Host "Embed code:" -ForegroundColor Yellow
Write-Host '<script src="https://syntera-tau.vercel.app/widget.js"' -ForegroundColor Gray
Write-Host '        data-agent-id="your-agent-id"' -ForegroundColor Gray
Write-Host '        data-api-key="pub_key_your-key"' -ForegroundColor Gray
Write-Host '        data-api-url="https://syntera-tau.vercel.app"' -ForegroundColor Gray
Write-Host '        data-position="bottom-right"' -ForegroundColor Gray
Write-Host '        data-theme="light"></script>' -ForegroundColor Gray

