import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import { proxyRequest } from '@/lib/api/proxy'

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:4002'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, ctx) => {
    const url = new URL(req.url)
    const path = url.pathname.replace('/api/team', '/api/team')
    
    // Route to appropriate endpoint based on query params or path
    if (url.pathname.includes('/members')) {
      return proxyRequest(req, ctx, {
        serviceUrl: AGENT_SERVICE_URL,
        path: '/api/team/members',
        extractNestedData: 'members',
      })
    } else if (url.pathname.includes('/invitations')) {
      return proxyRequest(req, ctx, {
        serviceUrl: AGENT_SERVICE_URL,
        path: '/api/team/invitations',
        extractNestedData: 'invitations',
      })
    }
    
    return proxyRequest(req, ctx, {
      serviceUrl: AGENT_SERVICE_URL,
      path: '/api/team/members',
      extractNestedData: 'members',
    })
  }, { requireCompany: true })
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, ctx) => {
    const url = new URL(req.url)
    
    if (url.pathname.includes('/invite')) {
      return proxyRequest(req, ctx, {
        serviceUrl: AGENT_SERVICE_URL,
        path: '/api/team/invite',
        method: 'POST',
      })
    }
    
    return proxyRequest(req, ctx, {
      serviceUrl: AGENT_SERVICE_URL,
      path: '/api/team/invite',
      method: 'POST',
    })
  }, { requireCompany: true })
}

