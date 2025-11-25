'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorDisplayProps {
  error: Error | string | null | undefined
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
  variant?: 'default' | 'destructive' | 'warning'
}

/**
 * Reusable error display component
 * Shows user-friendly error messages with optional retry action
 */
export function ErrorDisplay({
  error,
  title = 'Something went wrong',
  description,
  onRetry,
  className,
  variant = 'destructive',
}: ErrorDisplayProps) {
  const errorMessage =
    error instanceof Error ? error.message : error || 'An unexpected error occurred'

  const displayDescription = description || errorMessage

  return (
    <Alert
      variant={variant}
      className={cn('border-destructive/50', className)}
    >
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{displayDescription}</p>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

interface ErrorPageProps {
  error: Error | string | null | undefined
  title?: string
  onRetry?: () => void
}

/**
 * Full-page error display
 * Use for critical errors that prevent page rendering
 */
export function ErrorPage({ error, title, onRetry }: ErrorPageProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <div className="w-full max-w-md">
        <ErrorDisplay
          error={error}
          title={title}
          onRetry={onRetry}
        />
      </div>
    </div>
  )
}

