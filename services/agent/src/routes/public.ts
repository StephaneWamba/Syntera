/**
 * Public API Routes for Widget
 * These endpoints are used by the embeddable widget
 * Authentication via API key (not user JWT)
 */

import express from 'express'
import { z } from 'zod'
import { authenticateApiKey, ApiKeyRequest } from '../middleware/api-key-auth.js'
import { supabase } from '../config/database.js'
import { generateAccessToken, getRoomName, getLiveKitUrl, getUserPermissions, getAgentPermissions } from '../services/livekit.js'
import { handleError, badRequest } from '../utils/errors.js'
import { createLogger } from '@syntera/shared/logger/index.js'
import { Conversation, Message } from '@syntera/shared/models/index.js'
import { generateResponse } from '../services/openai.js'
import { extractContactInfoLLM } from '../utils/contact-extractor-llm.js'
import { findOrCreateContact, updateContact } from '../utils/contacts.js'
import { fetchWithTimeout } from '../utils/fetch-with-timeout.js'
import { getAgentConfig } from '../utils/agent-cache.js'
import type { AgentConfig } from '../types/agent.js'
import { searchKnowledgeBase } from '../utils/knowledge-base.js'
import { getConversationHistory, invalidateConversationHistory } from '../utils/conversation-cache.js'
import { RoomServiceClient } from 'livekit-server-sdk'

const logger = createLogger('agent-service:public-api')
const router = express.Router()

// Enable CORS for all public routes (widget can be embedded anywhere)
router.use((req, res, next) => {
  // Allow all origins including null (for file:// protocol in development)
  const origin = req.headers.origin
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin)
  } else {
    // Allow null origin for file:// protocol
    res.header('Access-Control-Allow-Origin', '*')
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.header('Access-Control-Allow-Credentials', 'true')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})

/**
 * GET /api/public/test
 * Test endpoint to verify Supabase connection
 */
router.get('/test', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('agent_configs')
      .select('id, name, company_id')
      .limit(1)
    
    if (error) {
      return res.status(500).json({ 
        error: 'Supabase query failed',
        message: error.message,
        code: error.code,
        details: error
      })
    }
    
    res.json({ 
      success: true,
      message: 'Supabase connection working',
      agentCount: data?.length || 0,
      sampleAgent: data?.[0] || null
    })
  } catch (error) {
    res.status(500).json({ 
      error: 'Test failed',
      message: error instanceof Error ? error.message : String(error)
    })
  }
})

// Request schemas
const GetAgentSchema = z.object({
  agentId: z.string().uuid(),
})

const CreateConversationSchema = z.object({
  agentId: z.string().uuid(),
  channel: z.enum(['chat', 'voice', 'video']).default('chat'),
  contactId: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

const SendMessageSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().min(1).max(10000),
  threadId: z.string().optional().nullable(),
})

const LiveKitTokenSchema = z.object({
  conversationId: z.string().min(1),
  agentId: z.string().uuid(),
})

const WebSocketConfigSchema = z.object({
  conversationId: z.string().min(1),
})

/**
 * GET /api/public/agents/:agentId
 * Get agent configuration (public info only)
 */
router.get(
  '/agents/:agentId',
  authenticateApiKey,
  async (req: ApiKeyRequest, res) => {
    try {
      const { agentId } = req.params

      if (agentId !== req.agentId) {
        return res.status(403).json({ error: 'Agent ID mismatch' })
      }

      const { data: agent, error } = await supabase
        .from('agent_configs')
        .select('id, name, model, system_prompt, temperature, avatar_url')
        .eq('id', agentId)
        .single()

      if (error || !agent) {
        logger.warn('Agent not found', { agentId, companyId: req.companyId })
        return res.status(404).json({ error: 'Agent not found' })
      }

      res.json({
        id: agent.id,
        name: agent.name,
        model: agent.model,
        avatar_url: agent.avatar_url || null,
      })
    } catch (error) {
      logger.error('Failed to get agent', { error })
      handleError(error, res)
    }
  }
)

/**
 * POST /api/public/conversations
 * Create a new conversation (anonymous user)
 */
router.post(
  '/conversations',
  authenticateApiKey,
  async (req: ApiKeyRequest, res) => {
    try {
      const validationResult = CreateConversationSchema.safeParse(req.body)
      if (!validationResult.success) {
        return badRequest(res, validationResult.error.issues[0].message)
      }

      const { agentId, channel, contactId } = validationResult.data

      if (agentId !== req.agentId) {
        return res.status(403).json({ error: 'Agent ID mismatch' })
      }

      // Verify agent exists (already verified in middleware, but double-check)
      const { data: agent, error: agentError } = await supabase
        .from('agent_configs')
        .select('id, company_id')
        .eq('id', agentId)
        .eq('company_id', req.companyId!)
        .single()

      if (agentError || !agent) {
        return res.status(404).json({ error: 'Agent not found' })
      }

      // Find or create contact if email/phone provided in metadata
      let finalContactId = contactId
      const metadata = (req.body.metadata as Record<string, unknown> | undefined) || {}
      const email = metadata.email as string | undefined
      const phone = metadata.phone as string | undefined

      if (!finalContactId && (email || phone)) {
        const contactResult = await findOrCreateContact({
          companyId: req.companyId!,
          email,
          phone,
          metadata,
              })
        finalContactId = contactResult.contactId || undefined
      }

      // Create conversation in MongoDB with contact_id at top level
      const conversation = await Conversation.create({
        agent_id: agentId,
        company_id: req.companyId!,
        contact_id: finalContactId || undefined,
        channel,
        status: 'active',
        metadata: {
          source: 'widget',
          ...metadata,
        },
      })


      res.json({
        conversation: {
          id: String(conversation._id),
          agent_id: conversation.agent_id,
          channel: conversation.channel,
          status: conversation.status,
          started_at: conversation.started_at.toISOString(),
        },
      })
    } catch (error) {
      logger.error('Failed to create conversation', { error })
      handleError(error, res)
    }
  }
)

/**
 * PATCH /api/public/conversations/:id
 * Update conversation (e.g., status, ended_at)
 */
router.patch(
  '/conversations/:id',
  authenticateApiKey,
  async (req: ApiKeyRequest, res) => {
    try {
      const { id } = req.params
      const { status, ended_at } = req.body

      // Verify conversation exists and belongs to company
      const conversation = await Conversation.findOne({
        _id: id,
        company_id: req.companyId!,
      })

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' })
      }

      // Update conversation
      const updateData: any = {}
      if (status) {
        updateData.status = status
      }
      if (ended_at) {
        updateData.ended_at = new Date(ended_at)
      }
      updateData.updated_at = new Date()

      await Conversation.findByIdAndUpdate(id, updateData)

      logger.info('Conversation updated via public API', {
        conversationId: id,
        updates: Object.keys(updateData),
      })

      res.json({ success: true })
    } catch (error) {
      logger.error('Failed to update conversation', { error })
      handleError(error, res)
    }
  }
)

/**
 * POST /api/public/messages
 * Send a message (creates message and triggers agent response)
 */
router.post(
  '/messages',
  authenticateApiKey,
  async (req: ApiKeyRequest, res) => {
    try {
      const validationResult = SendMessageSchema.safeParse(req.body)
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: validationResult.error.issues 
        })
      }

      const { conversationId, content, threadId } = validationResult.data

      // Verify conversation exists
      // For routes without agentId in middleware, we need to verify conversation exists first
      const conversation = await Conversation.findOne({
        _id: conversationId,
      })

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' })
      }

      // If companyId wasn't set by middleware (route without agentId), set it from conversation
      if (!req.companyId) {
        req.companyId = conversation.company_id
        req.agentId = conversation.agent_id
      } else {
        // Verify conversation belongs to company
        if (conversation.company_id !== req.companyId) {
          return res.status(403).json({ error: 'Conversation does not belong to company' })
        }
        
        // Verify agent matches
        if (conversation.agent_id !== req.agentId) {
          return res.status(403).json({ error: 'Agent mismatch' })
        }
      }

      // Create message
      const message = await Message.create({
        conversation_id: conversationId,
        thread_id: threadId || null,
        sender_type: 'user',
        role: 'user',
        content,
        message_type: 'text',
      })

      // Invalidate conversation history cache (new message added)
      invalidateConversationHistory(conversationId, threadId || null).catch((error) => {
        logger.warn('Failed to invalidate conversation cache', { error, conversationId })
      })

      // Extract contact information from message (async, don't block response)
      processContactInfoFromMessage(
        conversation,
        content,
        req.companyId!
      ).catch((error) => {
        logger.error('Failed to process contact info from message', { error, conversationId })
      })

      // Trigger agent response (async, don't wait)
      generateAgentResponseForWidget(
        conversationId,
        content,
        conversation.agent_id,
        req.companyId!,
        threadId || null
      ).catch((error) => {
        logger.error('Failed to generate agent response', { error, conversationId })
      })

      res.json({
        message: {
          id: String(message._id),
          conversation_id: conversationId,
          thread_id: threadId || null,
          role: 'user',
          content,
          created_at: message.created_at.toISOString(),
        },
      })
    } catch (error) {
      logger.error('Failed to send message', { error })
      handleError(error, res)
    }
  }
)

/**
 * POST /api/public/livekit/token
 * Generate LiveKit token for voice/video calls
 */
router.post(
  '/livekit/token',
  authenticateApiKey,
  async (req: ApiKeyRequest, res) => {
    try {
      const validationResult = LiveKitTokenSchema.safeParse(req.body)
      if (!validationResult.success) {
        return badRequest(res, validationResult.error.issues[0].message)
      }

      const { conversationId, agentId } = validationResult.data

      if (agentId !== req.agentId) {
        return res.status(403).json({ error: 'Agent ID mismatch' })
      }

      // Verify conversation exists
      const conversation = await Conversation.findOne({
        _id: conversationId,
        company_id: req.companyId!,
      })

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' })
      }

      const roomName = getRoomName(conversationId)
      const identity = `widget-user:${conversationId}` // Anonymous user identity
      const permissions = getUserPermissions()

      // Create room with metadata BEFORE generating token
      // This ensures metadata is available when the agent auto-connects
      const roomMetadata = JSON.stringify({
        agentId,
        conversationId,
        companyId: req.companyId!,
        userId: 'widget-user',
        source: 'widget',
      })

      // Initialize LiveKit Room Service client
      const liveKitUrl = getLiveKitUrl()
      const httpUrl = liveKitUrl.replace('wss://', 'https://').replace('ws://', 'http://')
      const roomService = new RoomServiceClient(
        httpUrl,
        process.env.LIVEKIT_API_KEY!,
        process.env.LIVEKIT_API_SECRET!
      )

      try {
        // Try to create room with metadata first
        await roomService.createRoom({
          name: roomName,
          metadata: roomMetadata,
          emptyTimeout: 300,
          maxParticipants: 10,
        })
      } catch (error: any) {
        if (error.message?.includes('already exists') || error.message?.includes('exists')) {
          try {
            await roomService.updateRoomMetadata(roomName, roomMetadata)
          } catch (updateError) {
            logger.warn('Could not update room metadata', {
              roomName,
              agentId,
              conversationId,
              error: updateError instanceof Error ? updateError.message : String(updateError),
            })
          }
        } else {
          logger.warn('Failed to create/update room metadata', {
            roomName,
            agentId,
            conversationId,
            error: error instanceof Error ? error.message : String(error),
          })
          // Continue anyway - room might still work without metadata
        }
      }

      // NOW generate token (room exists with metadata)
      const token = await generateAccessToken({
        identity,
        roomName,
        permissions,
        metadata: JSON.stringify({
          agentId,
          conversationId,
          companyId: req.companyId!,
          source: 'widget',
        }),
      })

      logger.info('LiveKit token generated via public API', {
        conversationId,
        agentId,
        roomName,
      })

      res.json({
        token,
        url: getLiveKitUrl(),
        roomName,
        identity,
      })
    } catch (error) {
      logger.error('Failed to generate LiveKit token', { error })
      handleError(error, res)
    }
  }
)

/**
 * POST /api/public/websocket/config
 * Get WebSocket configuration for chat service
 */
router.post(
  '/websocket/config',
  authenticateApiKey,
  async (req: ApiKeyRequest, res) => {
    try {
      const validationResult = WebSocketConfigSchema.safeParse(req.body)
      if (!validationResult.success) {
        return badRequest(res, validationResult.error.issues[0].message)
      }

      const { conversationId } = validationResult.data

      // Verify conversation exists
      const conversation = await Conversation.findOne({
        _id: conversationId,
      })

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' })
      }

      // If companyId wasn't set by middleware (route without agentId), set it from conversation
      if (!req.companyId) {
        req.companyId = conversation.company_id
        req.agentId = conversation.agent_id
      } else {
        // Verify conversation belongs to company
        if (conversation.company_id !== req.companyId) {
          return res.status(403).json({ error: 'Conversation does not belong to company' })
        }
      }

      // For widget, we'll use a simple token-based approach
      // The chat service will need to accept API key tokens
      // For MVP, return the chat service URL and a token
      const chatServiceUrl = process.env.CHAT_SERVICE_URL || 'http://localhost:4004'
      
      // Generate a simple token (in production, use proper JWT)
      const token = Buffer.from(JSON.stringify({
        conversationId,
        agentId: req.agentId,
        companyId: req.companyId,
        apiKey: req.apiKey,
      })).toString('base64')

      res.json({
        url: chatServiceUrl.replace('http://', 'ws://').replace('https://', 'wss://'),
        token,
      })
    } catch (error) {
      logger.error('Failed to get WebSocket config', { error })
      handleError(error, res)
    }
  }
)

/**
 * Process contact information from user message
 * Extracts email, phone, name, company and creates/updates contact
 * Uses LLM-based extraction for accuracy and error detection
 */
async function processContactInfoFromMessage(
  conversation: { _id: { toString(): string } | string; metadata?: Record<string, unknown> | null; contact_id?: string },
  messageContent: string,
  companyId: string
): Promise<void> {
  try {
    // Get conversation context for better extraction
    // Note: This is a different query (recent messages, reverse order) so not using cache
    // Cache is optimized for chronological history used in response generation
    const recentMessages = await Message.find({
      conversation_id: conversation._id,
    })
      .sort({ created_at: -1 })
      .limit(10)
      .lean()

    const conversationContext = recentMessages
      .reverse()
      .map((m) => ({
        role: (m.sender_type === 'agent' ? 'assistant' : m.role) as 'user' | 'assistant' | 'system',
        content: m.content,
      }))

    // Extract contact info using LLM
    const extracted = await extractContactInfoLLM(messageContent, conversationContext)

    // Skip if nothing extracted
    if (!extracted.email && !extracted.phone && !extracted.first_name && !extracted.last_name && !extracted.company_name) {
      return
    }

    // Log errors and corrections if detected
    if (extracted.errors_detected && extracted.errors_detected.length > 0) {
      logger.info('Contact info errors detected and corrected', {
        errors: extracted.errors_detected,
        corrections: extracted.corrections_made,
      })
    }


    // Get current conversation metadata and merge with extracted info
    const currentMetadata = conversation.metadata || {}
    const updatedMetadata = {
      ...currentMetadata,
      // Only add extracted fields if not already present
      ...(extracted.email && !currentMetadata.email ? { email: extracted.email } : {}),
      ...(extracted.phone && !currentMetadata.phone ? { phone: extracted.phone } : {}),
      ...(extracted.first_name && !currentMetadata.first_name ? { first_name: extracted.first_name } : {}),
      ...(extracted.last_name && !currentMetadata.last_name ? { last_name: extracted.last_name } : {}),
      ...(extracted.company_name && !currentMetadata.company_name ? { company_name: extracted.company_name } : {}),
    }

    // Update conversation metadata
    await Conversation.findByIdAndUpdate(conversation._id, {
      $set: { metadata: updatedMetadata },
    })

    // If we have email or phone, create/update contact
    const email = (updatedMetadata.email as string) || extracted.email
    const phone = (updatedMetadata.phone as string) || extracted.phone

    if (email || phone) {
      try {
        // Find or create contact using utility function (fixes N+1 query)
        const contactResult = await findOrCreateContact({
          companyId,
          email,
          phone,
          metadata: updatedMetadata,
        })

        if (contactResult.contactId) {
          // Update contact if we have new extracted info
          if (!contactResult.created && extracted) {
            const updates: Record<string, string> = {}
          if (extracted.first_name && !updatedMetadata.first_name) {
              updates.first_name = extracted.first_name
          }
          if (extracted.last_name && !updatedMetadata.last_name) {
              updates.last_name = extracted.last_name
          }
          if (extracted.company_name && !updatedMetadata.company_name) {
              updates.company_name = extracted.company_name
          }

            if (Object.keys(updates).length > 0) {
              await updateContact(contactResult.contactId, companyId, updates)
            }
        }

          // Link conversation to contact if not already linked
          if (!conversation.contact_id) {
          await Conversation.findByIdAndUpdate(conversation._id, {
              $set: { contact_id: contactResult.contactId },
          })

          logger.info('Linked conversation to contact', {
            conversationId: String(conversation._id),
              contactId: contactResult.contactId,
          })
          }
        }
      } catch (error) {
        logger.error('Error processing contact from message', {
          error,
          conversationId: String(conversation._id),
          email,
          phone,
        })
      }
    }
  } catch (error) {
    logger.error('Failed to process contact info from message', {
      error,
      conversationId: String(conversation._id),
    })
  }
}

/**
 * Helper function to generate agent response for widget
 * (Simplified version without Socket.io)
 */
async function generateAgentResponseForWidget(
  conversationId: string,
  userMessage: string,
  agentId: string,
  companyId: string,
  threadId: string | null
): Promise<void> {
  try {
    // Get agent config (with caching)
    const agentData = await getAgentConfig(agentId, companyId)

    if (!agentData) {
      throw new Error('Agent not found')
    }

    const agent = agentData

    // Get conversation history (with caching)
    const conversationHistory = await getConversationHistory(conversationId, threadId, 20)

    // Start knowledge base search in parallel with prompt enhancement
    // Use Promise.race with timeout to prevent blocking
    const KB_SEARCH_TIMEOUT = 500 // 500ms timeout
    const knowledgeBasePromise = Promise.race([
      searchKnowledgeBase({
        query: userMessage,
        companyId,
        agentId: agent.id,
        topK: 5,
        maxResults: 5,
      }),
      new Promise<undefined>((resolve) => 
        setTimeout(() => resolve(undefined), KB_SEARCH_TIMEOUT)
      ),
    ]).catch((error) => {
      logger.warn('Failed to retrieve knowledge base context', { error, conversationId })
      return undefined
    })

    // Enhance system prompt to naturally collect contact information
    let enhancedSystemPrompt = agent.system_prompt || 'You are a helpful AI assistant.'
    
    // Add instructions to naturally collect contact info when appropriate
    if (!enhancedSystemPrompt.toLowerCase().includes('contact') && !enhancedSystemPrompt.toLowerCase().includes('email') && !enhancedSystemPrompt.toLowerCase().includes('phone')) {
      enhancedSystemPrompt += `\n\nCONTACT INFORMATION COLLECTION - SMART TIMING:
Your PRIMARY goal is to answer the user's question completely and helpfully. AFTER providing a good answer, naturally ask for contact information when it makes sense.

WHEN TO ASK (prioritize answering first, then ask):
1. After fully answering a product/service question - Then offer: "I'd be happy to send you more detailed information. What's your email?"
2. After providing pricing information - Then offer: "I can send you a complete price list. What's your email address?"
3. When user shows clear interest (asks about specific products, wants to buy) - After helping, ask for follow-up
4. After 2-3 meaningful exchanges where you've provided value - Natural moment to ask

TIMING GUIDELINES:
- ALWAYS answer the question FIRST, completely and helpfully
- THEN, if appropriate, naturally transition to asking for contact info
- Spot the best moment - when the user seems engaged and you've provided value
- Don't ask too early (before establishing value) or too late (after they've lost interest)
- If the user's question requires immediate focus, answer fully first, then ask

GOOD EXAMPLES:
- User: "what are your products?" → You: [complete answer about products] → "I'd be happy to send you our full catalog. What's your email?"
- User: "what are the prices?" → You: [complete pricing information] → "I can send you a detailed price list with all options. What's your email?"
- User: "I'm interested in jeans" → You: [help with jeans] → "Great! I can send you more details about our jeans collection. What's your email?"

BAD EXAMPLES (don't do this):
- Asking before answering: "What's your email? [then provides info]"
- Asking when user just said "no" or seems uninterested
- Asking in the very first greeting

When user provides contact information, acknowledge it warmly and CONTINUE the conversation naturally. Do NOT reset to greeting.`
    }

    // Wait for knowledge base search (with timeout already handled)
    const knowledgeBaseContext = await knowledgeBasePromise

    // Generate response using OpenAI service
    const response = await generateResponse({
      systemPrompt: enhancedSystemPrompt,
      userMessage,
      conversationHistory,
      knowledgeBaseContext,
      model: agent.model || 'gpt-4o-mini',
      temperature: agent.temperature || 0.7,
    })

    // Save agent response message
    const agentMessage = await Message.create({
      conversation_id: conversationId,
      thread_id: threadId || null,
      sender_type: 'agent',
      role: 'assistant',
      content: response.response,
      message_type: 'text',
      ai_metadata: {
        model: agent.model,
        tokens_used: response.tokensUsed,
      },
    })

    // Invalidate conversation history cache (new message added)
    invalidateConversationHistory(conversationId, threadId).catch((error) => {
      logger.warn('Failed to invalidate conversation cache', { error, conversationId })
    })

    // Notify Chat Service to emit the message via WebSocket
    try {
      const chatServiceUrl = process.env.CHAT_SERVICE_URL || 'http://localhost:4004'
      const internalToken = process.env.INTERNAL_SERVICE_TOKEN || 'internal-token'
      
      const emitResponse = await fetchWithTimeout(
        `${chatServiceUrl}/api/internal/messages/emit`,
        {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${internalToken}`,
        },
        body: JSON.stringify({
          conversationId,
          message: {
            id: String(agentMessage._id),
            conversation_id: conversationId,
            thread_id: threadId || null,
            sender_type: 'agent' as const,
            role: 'agent' as const, // Widget expects 'agent', not 'assistant'
            content: response.response,
            message_type: 'text',
            ai_metadata: {
              model: agent.model,
              tokens_used: response.tokensUsed,
            },
            created_at: agentMessage.created_at.toISOString(),
          },
        }),
        },
        10000 // 10 second timeout
      )
      
      if (!emitResponse.ok) {
        const errorText = await emitResponse.text()
        logger.warn('Chat Service returned error when emitting message', {
          status: emitResponse.status,
          statusText: emitResponse.statusText,
          error: errorText,
          conversationId,
        })
      }
    } catch (error) {
      logger.warn('Failed to notify Chat Service about agent response', { 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        conversationId,
      })
      // Continue anyway - message is saved, widget can poll if needed
    }

    logger.info('Agent response generated for widget', {
      conversationId,
      responseLength: response.response.length,
    })
  } catch (error) {
    logger.error('Failed to generate agent response for widget', { error, conversationId })
    throw error
  }
}

/**
 * POST /api/public/voice-bot/deploy
 * Deploy an AI agent bot to a LiveKit room (public API for widget)
 */
const DeployBotSchema = z.object({
  conversationId: z.string().min(1),
  agentId: z.string().uuid(),
})

router.post(
  '/voice-bot/deploy',
  authenticateApiKey,
  async (req: ApiKeyRequest, res) => {
    try {
      const validationResult = DeployBotSchema.safeParse(req.body)
      if (!validationResult.success) {
        return badRequest(res, validationResult.error.issues[0].message)
      }

      const { conversationId, agentId } = validationResult.data

      // Verify agentId matches the API key's agent
      if (agentId !== req.agentId) {
        return res.status(403).json({ error: 'Agent ID mismatch' })
      }

      // Verify conversation exists and belongs to the agent's company
      const conversation = await Conversation.findOne({
        _id: conversationId,
        agent_id: agentId,
      })

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' })
      }

      logger.info('Deploying voice bot via public API', {
        conversationId,
        agentId,
        companyId: req.companyId,
      })

      // Generate token for agent
      const roomName = getRoomName(conversationId)
      const identity = `agent:${agentId}`

      const token = await generateAccessToken({
        identity,
        roomName,
        permissions: getAgentPermissions(),
        metadata: JSON.stringify({
          agentId,
          conversationId,
          userId: 'widget-user', // Widget users are anonymous
        }),
      })

      // Dispatch agent via Python service
      const pythonServiceUrl = process.env.PYTHON_AGENT_SERVICE_URL || 'http://localhost:4008'
      
      logger.info('Dispatching agent to Python service', {
        conversationId,
        agentId,
        pythonServiceUrl,
      })

      const dispatchResponse = await fetchWithTimeout(
        `${pythonServiceUrl}/api/agents/dispatch`,
        {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          agentId,
          userId: 'widget-user',
          roomName,
          token,
        }),
        },
        15000 // 15 second timeout for agent dispatch
      )

      if (!dispatchResponse.ok) {
        const errorText = await dispatchResponse.text()
        logger.error('Failed to dispatch Python agent', {
          status: dispatchResponse.status,
          error: errorText,
        })
        throw new Error(`Failed to dispatch agent: ${errorText}`)
      }

      const result = (await dispatchResponse.json()) as {
        success: boolean
        agentJobId: string
        message: string
      }

      logger.info('Voice bot deployed successfully via public API', {
        conversationId,
        agentId,
        roomName,
        agentJobId: result.agentJobId,
      })

      res.json({
        success: true,
        message: 'Voice bot deployed successfully',
        conversationId,
        agentId,
        roomName,
        agentJobId: result.agentJobId,
      })
    } catch (error) {
      logger.error('Failed to deploy voice bot via public API', { error })
      handleError(error, res)
    }
  }
)

export default router

