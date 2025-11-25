/**
 * Next.js API Route - Conversations Proxy
 * Proxies requests to Chat Service with authentication
 */

import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import { proxyRequest } from '@/lib/api/proxy'

const CHAT_SERVICE_URL = process.env.CHAT_SERVICE_URL || process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || 'http://localhost:4004'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, ctx) => {
    return proxyRequest(req, ctx, {
      serviceUrl: CHAT_SERVICE_URL,
      path: '/api/conversations',
    })
  })
}

