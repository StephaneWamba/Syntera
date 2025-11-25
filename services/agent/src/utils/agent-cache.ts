/**
 * Agent Configuration Caching
 * Caches agent configs in Redis to reduce database queries
 */

import { getRedis } from '../config/database.js'
import { createLogger } from '@syntera/shared/logger/index.js'
import { supabase } from '../config/database.js'
import type { AgentConfig } from '../types/agent.js'

const logger = createLogger('agent-service:agent-cache')

const CACHE_TTL = 5 * 60 // 5 minutes in seconds
const CACHE_KEY_PREFIX = 'agent:config:'

/**
 * Get agent configuration from cache or database
 */
export async function getAgentConfig(
  agentId: string,
  companyId?: string
): Promise<AgentConfig | null> {
  const redis = getRedis()
  const cacheKey = `${CACHE_KEY_PREFIX}${agentId}`

  // Try to get from cache
  if (redis) {
    try {
      const cached = await redis.get(cacheKey)
      if (cached) {
        return JSON.parse(cached) as AgentConfig
      }
    } catch (error) {
      logger.warn('Failed to read from cache', { error, agentId })
      // Continue to database lookup
    }
  }

  // Fetch from database
  try {
    let query = supabase
      .from('agent_configs')
      .select('*')
      .eq('id', agentId)

    if (companyId) {
      query = query.eq('company_id', companyId)
    }

    const { data: agent, error } = await query.single()

    if (error || !agent) {
      return null
    }

    if (redis) {
      try {
        await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(agent))
      } catch (cacheError) {
        logger.warn('Failed to cache agent config', { error: cacheError, agentId })
      }
    }

    return agent as AgentConfig
  } catch (error) {
    logger.error('Failed to fetch agent config', { error, agentId })
    return null
  }
}

/**
 * Invalidate agent config cache
 */
export async function invalidateAgentConfig(agentId: string): Promise<void> {
  const redis = getRedis()
  if (!redis) {
    return
  }

  const cacheKey = `${CACHE_KEY_PREFIX}${agentId}`
  try {
    await redis.del(cacheKey)
  } catch (error) {
    logger.warn('Failed to invalidate agent config cache', { error, agentId })
  }
}

