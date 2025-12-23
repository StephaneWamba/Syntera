'use client'

import { useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function WidgetPreviewContent() {
  const searchParams = useSearchParams()
  const containerRef = useRef<HTMLDivElement>(null)

  const agentId = searchParams.get('agentId')
  const apiKey = searchParams.get('apiKey')
  const position = searchParams.get('position') || 'bottom-right'
  const theme = searchParams.get('theme') || 'auto'

  useEffect(() => {
    if (!agentId || !apiKey || !containerRef.current) return

    // Clear any existing widget
    const existingScript = document.querySelector('script[data-agent-id]')
    const existingLink = document.querySelector('link[href*="widget.css"]')
    if (existingScript) existingScript.remove()
    if (existingLink) existingLink.remove()

    // Widget URLs
    const widgetUrl = process.env.NEXT_PUBLIC_WIDGET_URL || 'https://pub-487d70fa1de84574af35bd20e7e86e60.r2.dev/widget.js'
    const widgetCssUrl = process.env.NEXT_PUBLIC_WIDGET_CSS_URL || 'https://pub-487d70fa1de84574af35bd20e7e86e60.r2.dev/widget.css'
    const apiUrl = process.env.NEXT_PUBLIC_AGENT_SERVICE_URL || 'https://syntera-tau.vercel.app'

    // Load widget CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = widgetCssUrl
    document.head.appendChild(link)

    // Load widget script
    const script = document.createElement('script')
    script.src = widgetUrl
    script.setAttribute('data-agent-id', agentId)
    script.setAttribute('data-api-key', apiKey)
    script.setAttribute('data-api-url', apiUrl)
    script.setAttribute('data-position', position)
    script.setAttribute('data-theme', theme)
    script.setAttribute('data-debug', 'false')
    script.async = true
    document.head.appendChild(script)

    return () => {
      // Cleanup
      const widgetScript = document.querySelector('script[data-agent-id]')
      const widgetLink = document.querySelector('link[href*="widget.css"]')
      if (widgetScript) widgetScript.remove()
      if (widgetLink) widgetLink.remove()
    }
  }, [agentId, apiKey, position, theme])

  if (!agentId || !apiKey) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Widget Preview</h1>
          <p className="text-muted-foreground">Missing agent ID or API key</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="h-screen w-full bg-background">
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Widget Preview</h1>
        <p className="text-muted-foreground mb-8">
          This is how your widget will appear on a website. The widget button should appear in the {position} corner.
        </p>
        <div className="border rounded-lg p-8 bg-muted/50">
          <p className="text-sm text-muted-foreground">
            Your website content would appear here. The widget will float above this content.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function WidgetPreviewPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Widget Preview</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <WidgetPreviewContent />
    </Suspense>
  )
}

