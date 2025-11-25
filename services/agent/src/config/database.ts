/**
 * Agent Service - Database Configuration
 */

import { getSupabaseClient, verifySupabaseConnection } from '@syntera/shared/database/supabase.js'
import { createRedisClient } from '@syntera/shared/database/redis.js'
import { connectMongoDB } from '@syntera/shared/database/mongodb.js'
import { createLogger } from '@syntera/shared/logger/index.js'

type Redis = Awaited<ReturnType<typeof createRedisClient>>

const logger = createLogger('agent-service')

export const supabase = getSupabaseClient()

let redis: Redis | null = null

if (process.env.REDIS_URL) {
  try {
    redis = createRedisClient(process.env.REDIS_URL)
    redis.on('error', () => {
      // Redis is optional
    })
    setTimeout(() => {
      if (redis && redis.status === 'ready') {
        logger.info('Redis connected')
      }
    }, 2000)
  } catch (error) {
    logger.warn('Failed to initialize Redis', { error })
  }
}

export function getRedis(): Redis | null {
  try {
    return redis && redis.status === 'ready' ? redis : null
  } catch {
    return null
  }
}

export async function initializeDatabase() {
  try {
    await verifySupabaseConnection('agent_configs')

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/syntera'
    
    try {
      await connectMongoDB(mongoUri)
      logger.info('MongoDB connected')
    } catch (error: any) {
      if (error?.message?.includes('ETIMEDOUT') || 
          error?.message?.includes('ECONNREFUSED') ||
          error?.message?.includes('ENOTFOUND')) {
        logger.warn('MongoDB connection failed - service will continue without MongoDB')
      } else {
        throw error
      }
    }

    setTimeout(() => {
      if (redis && redis.status === 'ready') {
        logger.info('Redis connected')
      }
    }, 1000)
  } catch (error) {
    logger.error('Database initialization failed', { error })
    throw error
  }
}




