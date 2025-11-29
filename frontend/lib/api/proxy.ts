/**
 * API Proxy Utility
 * Generic proxy function for forwarding requests to backend services
 */

import { NextRequest, NextResponse } from 'next/server'
import { AuthenticatedContext } from './middleware'
import { logger } from '@/lib/utils/logger'

export interface ProxyOptions {
  serviceUrl: string
  path: string
  method?: string
  transformRequest?: (body: unknown) => unknown
  transformResponse?: (data: unknown) => unknown
  extractNestedData?: string // e.g., 'agents' or 'agent' to extract nested data
}

/**
 * Proxy a request to a backend service
 * Handles query params, request/response transformation, and error handling
 */
export async function proxyRequest(
  request: NextRequest,
  ctx: AuthenticatedContext,
  options: ProxyOptions
): Promise<NextResponse> {
  try {
    const method = options.method || request.method
    const url = new URL(request.url)
    const queryString = url.searchParams.toString()
    const targetUrl = `${options.serviceUrl}${options.path}${queryString ? `?${queryString}` : ''}`

    const headers: HeadersInit = {
      Authorization: `Bearer ${ctx.session.access_token}`,
      'Content-Type': 'application/json',
    }

    let body: string | undefined
    if (method !== 'GET' && method !== 'HEAD' && method !== 'DELETE') {
      try {
        const requestBody = await request.json().catch(() => null)
        const transformedBody = options.transformRequest
          ? options.transformRequest(requestBody)
          : requestBody
        body = JSON.stringify(transformedBody)
      } catch (error) {
        // If body parsing fails, continue without body (for DELETE, etc.)
        logger.warn('Failed to parse request body', { error })
      }
    }

    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
    })

    // Check content type before parsing
    const contentType = response.headers.get('content-type')
    let data: unknown

    if (contentType?.includes('application/json')) {
      data = await response.json()
    } else {
      // Handle non-JSON responses (e.g., rate limit HTML)
      const text = await response.text()
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Too many requests', details: 'Please try again later' },
          { status: 429 }
        )
      }
      return NextResponse.json(
        { error: 'Unexpected response from service', details: text.substring(0, 100) },
        { status: response.status || 500 }
      )
    }

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    // Extract nested data if specified (e.g., { agents: [...] } -> [...])
    if (options.extractNestedData && typeof data === 'object' && data !== null) {
      const nested = (data as Record<string, unknown>)[options.extractNestedData]
      if (nested !== undefined) {
        data = nested
      }
    }

    // Transform response if specified
    if (options.transformResponse) {
      data = options.transformResponse(data)
    }

    // Determine status code (201 for POST, 200 for others)
    const statusCode = method === 'POST' ? 201 : response.status

    return NextResponse.json(data, { status: statusCode })
  } catch (error) {
    // Check if it's a connection error
    if (error instanceof Error && (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed'))) {
      const serviceName = options.serviceUrl.includes('4002') ? 'Agent' : 
                         options.serviceUrl.includes('4004') ? 'Chat' :
                         options.serviceUrl.includes('4005') ? 'Knowledge Base' : 'Service'
      return NextResponse.json(
        {
          error: `${serviceName} service is not running`,
          details: `Please start the ${serviceName.toLowerCase()} service`
        },
        { status: 503 }
      )
    }

    logger.error('Proxy request error', { error, serviceUrl: options.serviceUrl, path: options.path })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}








