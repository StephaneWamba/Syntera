/**
 * Analytics Costs API
 * Returns cost and efficiency metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import { logger } from '@/lib/utils/logger'

const CHAT_SERVICE_URL = process.env.CHAT_SERVICE_URL || 'http://localhost:4004'

// Model pricing (per 1M tokens)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'gpt-4-turbo': { input: 10, output: 30 },
  'gpt-4': { input: 30, output: 60 },
  'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
}

function calculateCost(tokensUsed: number, model: string): number {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING['gpt-4o-mini']
  // Assume 80% input, 20% output tokens (rough estimate)
  const inputTokens = tokensUsed * 0.8
  const outputTokens = tokensUsed * 0.2
  return (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output
}

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, ctx) => {
    try {
      if (!ctx.companyId) {
        return NextResponse.json({ error: 'Company ID required' }, { status: 400 })
      }

      const searchParams = req.nextUrl.searchParams
      const startDate = searchParams.get('startDate')
      const endDate = searchParams.get('endDate')

      // Fetch messages from Chat Service
      const messagesResponse = await fetch(
        `${CHAT_SERVICE_URL}/api/internal/messages/list?limit=1000`,
        {
          headers: {
            Authorization: `Bearer ${process.env.INTERNAL_SERVICE_TOKEN || ''}`,
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            companyId: ctx.companyId,
            limit: 1000,
            startDate,
            endDate,
          }),
        }
      )

      if (!messagesResponse.ok) {
        throw new Error('Failed to fetch messages')
      }

      const messagesData = await messagesResponse.json()
      const messages = messagesData.messages || []

      // Calculate total tokens and cost
      let totalTokens = 0
      let totalCost = 0

      messages.forEach((m: { ai_metadata?: { tokens_used?: number; model?: string } }) => {
        if (m.ai_metadata?.tokens_used) {
          const tokens = m.ai_metadata.tokens_used
          totalTokens += tokens
          const model = m.ai_metadata.model || 'gpt-4o-mini'
          totalCost += calculateCost(tokens, model)
        }
      })

      return NextResponse.json({
        totalTokens,
        estimatedCost: Math.round(totalCost * 100) / 100, // Round to 2 decimal places
      })
    } catch (error) {
      logger.error('Analytics costs error', { error })
      return NextResponse.json(
        { error: 'Failed to fetch cost analytics' },
        { status: 500 }
      )
    }
  }, { requireCompany: true })
}

