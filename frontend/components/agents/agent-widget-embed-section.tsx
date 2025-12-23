'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Copy, Check, Code, ExternalLink } from 'lucide-react'
import { useAgent } from '@/lib/api/agents'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

interface AgentWidgetEmbedSectionProps {
  agentId: string
}

export function AgentWidgetEmbedSection({ agentId }: AgentWidgetEmbedSectionProps) {
  const { data: agent } = useAgent(agentId)
  const [copied, setCopied] = useState(false)
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right')
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto')

  const apiKey = agent?.public_api_key
  const apiUrl = process.env.NEXT_PUBLIC_AGENT_SERVICE_URL || 'https://api.syntera.com'
  const widgetUrl = process.env.NEXT_PUBLIC_WIDGET_URL || 'https://cdn.syntera.com/widget.js'
  const widgetCssUrl = process.env.NEXT_PUBLIC_WIDGET_CSS_URL || 'https://cdn.syntera.com/widget.css'

  const generateEmbedCode = (): string => {
    if (!apiKey || !agentId) {
      return '<!-- API key or agent ID missing -->'
    }

    return `<!-- Syntera AI Chat Widget -->
<script src="${widgetUrl}"
        data-agent-id="${agentId}"
        data-api-key="${apiKey}"
        data-api-url="${apiUrl}"
        data-position="${position}"
        data-theme="${theme}"
        data-debug="false">
</script>
<link rel="stylesheet" href="${widgetCssUrl}">`
  }

  const embedCode = generateEmbedCode()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopied(true)
      toast.success('Embed code copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy embed code')
    }
  }

  const getPreviewUrl = () => {
    if (typeof window === 'undefined' || !agent || !apiKey) return null
    return `${window.location.origin}/widget-preview?agentId=${agentId}&apiKey=${apiKey}&position=${position}&theme=${theme}`
  }

  const previewUrl = getPreviewUrl()

  if (!apiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Widget Embed</CardTitle>
          <CardDescription>
            Generate an embed code to add your AI agent to any website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Please generate an API key first in the API Key section above.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Widget Embed</CardTitle>
        <CardDescription>
          Copy the embed code below and paste it into your website's HTML to add your AI agent
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="code" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="code">
              <Code className="mr-2 h-4 w-4" />
              Embed Code
            </TabsTrigger>
            <TabsTrigger value="preview">
              <ExternalLink className="mr-2 h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="code" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Widget Position</Label>
                  <Select value={position} onValueChange={(value: typeof position) => setPosition(value)}>
                    <SelectTrigger id="position">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="top-left">Top Left</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={theme} onValueChange={(value: typeof theme) => setTheme(value)}>
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto (System)</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="embed-code">Embed Code</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  id="embed-code"
                  value={embedCode}
                  readOnly
                  className="font-mono text-xs min-h-[200px]"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {previewUrl ? (
              <div className="space-y-2">
                <Label>Widget Preview</Label>
                <div className="border rounded-lg overflow-hidden" style={{ height: '600px' }}>
                  <iframe
                    src={previewUrl}
                    className="w-full h-full"
                    title="Widget Preview"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  This is a preview of how your widget will appear on a website
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Preview unavailable</p>
            )}
          </TabsContent>
        </Tabs>

        <div className="border-t pt-4 space-y-3">
          <h4 className="text-sm font-semibold">Installation Instructions</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Copy the embed code above</li>
            <li>Paste it into your website's HTML, preferably just before the closing <code className="bg-muted px-1 rounded">&lt;/body&gt;</code> tag</li>
            <li>The widget will automatically appear on your website</li>
            <li>Users can click the widget button to start chatting with your AI agent</li>
          </ol>
        </div>

        <div className="border-t pt-4 space-y-2">
          <h4 className="text-sm font-semibold">Configuration Options</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>data-position:</strong> Widget position on the page (bottom-right, bottom-left, top-right, top-left)</p>
            <p><strong>data-theme:</strong> Widget theme (light, dark, auto)</p>
            <p><strong>data-debug:</strong> Enable debug logging (true/false)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

