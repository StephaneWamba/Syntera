/**
 * Next.js API Route: Proxy to Agent Service Public API
 * Proxies public agent API calls to agent service with CORS support
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/utils/logger'
import { normalizeServiceUrl, handleResponse } from '@/lib/api/public-proxy'

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || 'http://localhost:4002'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET(request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let id: string | undefined
  try {
    const resolvedParams = await params
    id = resolvedParams.id
    const authHeader = request.headers.get('authorization')

    // Normalize service URL (ensure protocol)
    const serviceUrl = normalizeServiceUrl(AGENT_SERVICE_URL)
    const targetUrl = `${serviceUrl}/api/public/agents/${id}`
    
    logger.debug('Proxying public agent request', { targetUrl, agentId: id, hasAuth: !!authHeader })

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        ...(authHeader ? { 'Authorization': authHeader } : {}),
        'Content-Type': 'application/json',
      },
    })

    // Handle response (JSON or error)
    let data: unknown
    try {
      data = await handleResponse(response, { agentId: id, endpoint: 'getAgent' })
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid response from service', details: error instanceof Error ? error.message : String(error) },
        { status: response.status || 500, headers: corsHeaders }
      )
    }

    return NextResponse.json(data, {
      status: response.status,
      headers: corsHeaders,
    })
  } catch (error) {
    logger.error('Public API error proxying agent', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      agentId: id 
    })
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500, headers: corsHeaders }
    )
  }
}

