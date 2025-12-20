/**
 * Analytics Conversations API
 * Returns conversation analytics (timeline, by channel, avg duration)
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'

const CHAT_SERVICE_URL = process.env.CHAT_SERVICE_URL || 'http://localhost:4004'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, ctx) => {
    try {
      if (!ctx.companyId) {
        return NextResponse.json({ error: 'Company ID required' }, { status: 400 })
      }

      const supabase = await createClient()
      const searchParams = req.nextUrl.searchParams
      const startDate = searchParams.get('startDate')
      const endDate = searchParams.get('endDate')
      const groupBy = searchParams.get('groupBy') || 'day'

      // Get access token for Chat Service
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        return NextResponse.json({ error: 'No session token' }, { status: 401 })
      }

      // Fetch conversations from Chat Service
      const convParams = new URLSearchParams()
      if (startDate) convParams.append('startDate', startDate)
      if (endDate) convParams.append('endDate', endDate)

      const conversationsResponse = await fetch(
        `${CHAT_SERVICE_URL}/api/conversations?${convParams.toString()}&limit=1000`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      )

      if (!conversationsResponse.ok) {
        throw new Error('Failed to fetch conversations')
      }

      const conversationsData = await conversationsResponse.json()
      let conversations = conversationsData.conversations || []

      // Filter by date range if provided
      if (startDate || endDate) {
        conversations = conversations.filter((conv: { started_at: string }) => {
          const convDate = new Date(conv.started_at)
          if (startDate && convDate < new Date(startDate)) return false
          if (endDate && convDate > new Date(endDate)) return false
          return true
        })
      }

      // Group conversations by date
      const timelineMap = new Map<string, number>()
      const channelMap = new Map<string, number>()
      let totalDuration = 0
      let conversationsWithDuration = 0

      conversations.forEach((conv: { started_at: string; ended_at?: string; channel: string }) => {
        // Timeline grouping
        const date = new Date(conv.started_at)
        let dateKey: string

        if (groupBy === 'week') {
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          dateKey = weekStart.toISOString().split('T')[0]
        } else if (groupBy === 'month') {
          dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        } else {
          dateKey = date.toISOString().split('T')[0]
        }

        timelineMap.set(dateKey, (timelineMap.get(dateKey) || 0) + 1)

        // Channel grouping
        channelMap.set(conv.channel, (channelMap.get(conv.channel) || 0) + 1)

        // Calculate duration
        if (conv.ended_at) {
          const duration = new Date(conv.ended_at).getTime() - new Date(conv.started_at).getTime()
          totalDuration += duration
          conversationsWithDuration++
        }
      })

      // Convert timeline map to array
      const timeline = Array.from(timelineMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))

      // Convert channel map to array
      const byChannel = Array.from(channelMap.entries()).map(([channel, count]) => ({
        channel,
        count,
      }))

      // Calculate average duration in seconds
      const avgDuration = conversationsWithDuration > 0
        ? Math.round(totalDuration / conversationsWithDuration / 1000)
        : 0

      return NextResponse.json({
        timeline,
        byChannel,
        avgDuration,
      })
    } catch (error) {
      logger.error('Analytics conversations error', { error })
      return NextResponse.json(
        { error: 'Failed to fetch conversation analytics' },
        { status: 500 }
      )
    }
  }, { requireCompany: true })
}

