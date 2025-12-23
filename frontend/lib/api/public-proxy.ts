/**
 * Public API Proxy Utility
 * 
 * Helper functions for proxying public API requests to backend services.
 * Handles URL protocol normalization and error handling.
 */

import { logger } from '@/lib/utils/logger'

/**
 * Normalize service URL by ensuring it has a protocol
 */
export function normalizeServiceUrl(url: string): string {
  let normalized = url.replace(/\/$/, '') // Remove trailing slash
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = `https://${normalized}`
  }
  return normalized
}

/**
 * Handle non-JSON responses from backend services
 */
export async function handleResponse(response: Response, context: { agentId?: string; endpoint?: string }) {
  const contentType = response.headers.get('content-type')
  
  if (contentType?.includes('application/json')) {
    return await response.json()
  } else {
    const text = await response.text()
    logger.error('Non-JSON response from backend service', {
      status: response.status,
      contentType,
      text: text.substring(0, 200),
      ...context,
    })
    throw new Error(`Invalid response from service: ${text.substring(0, 200)}`)
  }
}

