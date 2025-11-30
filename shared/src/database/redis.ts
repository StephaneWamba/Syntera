/**
 * Redis connection utility
 * Used by Chat Service and Agent Service
 */

import Redis from 'ioredis'

let redisClient: Redis | null = null
let lastErrorLogTime = 0
const ERROR_LOG_INTERVAL = 60000 // Only log errors once per minute

export function createRedisClient(uri: string): Redis {
  if (redisClient) {
    return redisClient
  }

  // Upstash Redis requires TLS - detect if URI uses rediss:// or upstash.io domain
  const isUpstash = uri.includes('upstash.io') || uri.startsWith('rediss://')
  
  // Parse URI to extract components for better error handling
  let redisOptions: any = {
    maxRetriesPerRequest: 3,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000)
      // Stop retrying after 10 attempts (about 5 seconds)
      if (times > 10) {
        return null // Stop retrying
      }
      return delay
    },
    // Add connection timeout
    connectTimeout: 10000, // Increased to 10s for Upstash
    lazyConnect: false, // Try to connect immediately
  }

  // Enable TLS for Upstash Redis
  if (isUpstash) {
    redisOptions.tls = {
      rejectUnauthorized: true, // Verify SSL certificate
    }
    
    // For Upstash, parse the URI manually to ensure proper authentication
    try {
      const url = new URL(uri)
      const password = url.password || decodeURIComponent(url.password || '')
      const username = url.username || 'default'
      
      // Use hostname and port from URL
      redisOptions.host = url.hostname
      redisOptions.port = parseInt(url.port || '6379', 10)
      redisOptions.password = password
      redisOptions.username = username
      
      // Use the parsed options instead of the full URI
      redisClient = new Redis(redisOptions)
    } catch (error) {
      // Fallback to URI if parsing fails
      redisClient = new Redis(uri, redisOptions)
    }
  } else {
    redisClient = new Redis(uri, redisOptions)
  }

  redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully')
    lastErrorLogTime = 0 // Reset error log timer on successful connection
  })

  redisClient.on('error', (error: Error) => {
    // Only log errors once per minute to prevent spam
    const now = Date.now()
    if (now - lastErrorLogTime > ERROR_LOG_INTERVAL) {
      // Suppress connection timeout errors - they're expected if Redis isn't running
      if (error.message.includes('ETIMEDOUT') || error.message.includes('ECONNREFUSED')) {
        // Silently handle - Redis is optional
      } else {
        console.error('❌ Redis connection error:', error.message)
      }
      lastErrorLogTime = now
    }
  })

  return redisClient
}

export function getRedisClient(): Redis {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call createRedisClient first.')
  }
  return redisClient
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
    console.log('✅ Redis disconnected')
  }
}

