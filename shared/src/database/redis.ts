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

  // Detect if TLS is required (rediss:// protocol or specific providers)
  const requiresTLS = uri.startsWith('rediss://') || uri.includes('upstash.io')
  
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
    connectTimeout: 10000,
    lazyConnect: false, // Try to connect immediately
  }

  // Enable TLS if required
  if (requiresTLS) {
    redisOptions.tls = {
      rejectUnauthorized: true, // Verify SSL certificate
    }
  }

  // Parse URL manually for better control over authentication
  try {
    const url = new URL(uri)
    redisOptions.host = url.hostname
    redisOptions.port = parseInt(url.port || '6379', 10)
    
    // Set password if provided
    if (url.password) {
      redisOptions.password = url.password
    }
    
    // Set username if provided (Railway Redis uses 'default', Upstash may use 'default' or omit)
    if (url.username) {
      redisOptions.username = url.username
    }
    
    // Create client with parsed options
    redisClient = new Redis(redisOptions)
  } catch (error) {
    // Fallback to URI string if parsing fails
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
      } else if (error.message.includes('WRONGPASS')) {
        // Authentication errors are important - log them
        console.error('❌ Redis authentication failed:', error.message)
        console.error('   Please verify your Redis connection string (REDIS_URL)')
        console.error('   For Upstash Redis, ensure you\'re using the Redis protocol connection string, not the REST API token')
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

