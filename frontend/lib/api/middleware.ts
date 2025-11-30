/**
 * API Route Middleware
 * Shared authentication and request handling
 */

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/utils/logger'

export interface AuthenticatedContext {
  user: { id: string; email: string }
  session: { access_token: string }
  companyId?: string | null
}

export interface WithAuthOptions {
  requireCompany?: boolean
}

/**
 * Higher-order function that wraps API route handlers with authentication
 * Extracts common auth pattern: Supabase user auth, session token, optional company_id
 */
export async function withAuth(
  request: NextRequest,
  handler: (req: NextRequest, ctx: AuthenticatedContext) => Promise<NextResponse>,
  options: WithAuthOptions = {}
): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.access_token) {
      return NextResponse.json({ error: 'No session token' }, { status: 401 })
    }

    // Get company_id if required
    let companyId: string | null | undefined = undefined
    if (options.requireCompany) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .maybeSingle()

      if (userError) {
        logger.warn('Failed to fetch user company', { error: userError.message })
        // Continue anyway - company_id might be null for new users
      }

      companyId = userData?.company_id || null

      if (options.requireCompany && !companyId) {
        return NextResponse.json(
          { error: 'User company not found' },
          { status: 400 }
        )
      }
    }

    const ctx: AuthenticatedContext = {
      user: {
        id: user.id,
        email: user.email || '',
      },
      session: {
        access_token: session.access_token,
      },
      companyId,
    }

    return await handler(request, ctx)
  } catch (error) {
    logger.error('Auth middleware error', { error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}




