import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api/middleware'
import { proxyRequest } from '@/lib/api/proxy'

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:4002'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return withAuth(request, async (req, ctx) => {
    return proxyRequest(req, ctx, {
      serviceUrl: AGENT_SERVICE_URL,
      path: `/api/team/members/${id}`,
      method: 'DELETE',
    })
  }, { requireCompany: true })
}

