/**
 * MongoDB connection utility
 * Used by Chat Service and Agent Service
 */

import mongoose, { ConnectOptions } from 'mongoose'

export async function connectMongoDB(uri: string): Promise<void> {
  try {
    
    // Connection pool configuration optimized for production scalability
    // Increased pool sizes for better concurrent request handling
    // Default: min 10, max 50 (can be overridden via env vars)
    const minPoolSize = parseInt(process.env.MONGODB_MIN_POOL_SIZE || process.env.MONGODB_POOL_SIZE || '10', 10)
    const maxPoolSize = parseInt(process.env.MONGODB_MAX_POOL_SIZE || '50', 10)
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      // Connection pool settings - increased for production scalability
      maxPoolSize, // Maximum concurrent connections (50 default, 3-5x increase from previous 10)
      minPoolSize, // Minimum pool size (10 default, increased from 5)
      maxIdleTimeMS: 30000, // Close connections after 30s of inactivity
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    } as ConnectOptions)
    
    // Disable mongoose buffering (set after connection)
    mongoose.set('bufferCommands', false)
    console.log('✅ MongoDB connected successfully')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    throw error
  }
}

export async function disconnectMongoDB(): Promise<void> {
  try {
    await mongoose.disconnect()
    console.log('✅ MongoDB disconnected')
  } catch (error) {
    console.error('❌ MongoDB disconnection error:', error)
    throw error
  }
}

