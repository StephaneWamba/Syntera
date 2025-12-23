import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import { proxyRequest } from '@/lib/api/proxy'

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:4002'

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, ctx) => {
    return proxyRequest(req, ctx, {
      serviceUrl: AGENT_SERVICE_URL,
      path: '/api/team/members',
      extractNestedData: 'members',
    })
  }, { requireCompany: true })
}

