import { NextRequest, NextResponse } from 'next/server'
import { proxyRequest } from '@/lib/api/proxy'

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:4002'

/**
 * Public endpoint to get invitation details (no auth required)
 * Used by the invitation acceptance page
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  
  try {
    // Call agent service to get invitation details
    const response = await fetch(`${AGENT_SERVICE_URL}/api/team/invitations/${token}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to load invitation' }))
      return NextResponse.json(error, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

