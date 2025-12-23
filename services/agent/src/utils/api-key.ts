/**
 * API Key Utilities
 * 
 * Functions for generating and managing public API keys for widget access.
 * API keys follow the format: pub_key_{agentId}
 */

import { createLogger } from '@syntera/shared/logger/index.js'

const logger = createLogger('agent-service:api-key')

/**
 * Generate a public API key for an agent
 * Format: pub_key_{agentId}
 * 
 * @param agentId - UUID of the agent
 * @returns API key string in format pub_key_{agentId}
 */
export function generateApiKey(agentId: string): string {
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(agentId)) {
    logger.error('Invalid agent ID format for API key generation', { agentId })
    throw new Error(`Invalid agent ID format. Expected UUID, got: ${agentId}`)
  }

  const apiKey = `pub_key_${agentId}`
  logger.debug('Generated API key', { agentId, apiKeyPrefix: 'pub_key_***' })
  return apiKey
}

/**
 * Extract agent ID from API key
 * 
 * @param apiKey - API key in format pub_key_{agentId}
 * @returns Agent ID if valid, null otherwise
 */
export function extractAgentIdFromApiKey(apiKey: string): string | null {
  if (!apiKey.startsWith('pub_key_')) {
    return null
  }

  const agentId = apiKey.substring(8) // Remove 'pub_key_' prefix
  
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(agentId)) {
    return null
  }

  return agentId
}

/**
 * Validate API key format
 * 
 * @param apiKey - API key to validate
 * @returns true if valid format, false otherwise
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  return extractAgentIdFromApiKey(apiKey) !== null
}

