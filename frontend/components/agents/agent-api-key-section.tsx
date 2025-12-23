'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, Eye, EyeOff, RefreshCw, AlertTriangle } from 'lucide-react'
import { useAgent, useRegenerateApiKey } from '@/lib/api/agents'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface AgentApiKeySectionProps {
  agentId: string
}

export function AgentApiKeySection({ agentId }: AgentApiKeySectionProps) {
  const { data: agent, refetch } = useAgent(agentId)
  const regenerateApiKey = useRegenerateApiKey()
  const [isVisible, setIsVisible] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const apiKey = agent?.public_api_key || null

  const handleCopy = async () => {
    if (!apiKey) return

    try {
      await navigator.clipboard.writeText(apiKey)
      toast.success('API key copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy API key')
    }
  }

  const handleRegenerate = async () => {
    if (!confirm('Are you sure you want to regenerate the API key? This will invalidate the current key and require updating your widget embed code.')) {
      return
    }

    setIsRegenerating(true)
    try {
      await regenerateApiKey.mutateAsync(agentId)
      await refetch()
      toast.success('API key regenerated successfully. Update your widget embed code with the new key.')
    } catch (error) {
      toast.error('Failed to regenerate API key')
    } finally {
      setIsRegenerating(false)
    }
  }

  const maskApiKey = (key: string | null): string => {
    if (!key) return ''
    if (key.length <= 20) return '•'.repeat(key.length)
    return key.substring(0, 12) + '•'.repeat(key.length - 20) + key.substring(key.length - 8)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Key</CardTitle>
        <CardDescription>
          Use this API key to authenticate your widget. Keep it secure and never share it publicly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!apiKey ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No API key found. Click "Generate API Key" to create one.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="api-key">Public API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="api-key"
                  type="text"
                  value={isVisible ? apiKey : maskApiKey(apiKey)}
                  readOnly
                  className="font-mono text-sm pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setIsVisible(!isVisible)}
                >
                  {isVisible ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopy}
                title="Copy API key"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Format: pub_key_{'{'}agentId{'}'}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {!apiKey ? (
            <Button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              variant="default"
            >
              {isRegenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate API Key
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              variant="outline"
            >
              {isRegenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate API Key
                </>
              )}
            </Button>
          )}
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Important:</strong> Regenerating the API key will invalidate the current key.
            You'll need to update your widget embed code with the new key.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

