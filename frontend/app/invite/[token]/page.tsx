'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, XCircle, Loader2, Mail, Shield, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface InvitationData {
  id: string
  email: string
  role: 'user' | 'admin'
  company_id: string
  expires_at: string
}

export default function InviteAcceptPage() {
  const params = useParams()
  const router = useRouter()
  const token = params?.token as string
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accepting, setAccepting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link')
      setLoading(false)
      return
    }

    // Check if user is authenticated
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      setUser(currentUser)
      setCheckingAuth(false)

      // Fetch invitation details
      fetch(`/api/team/invitations/${token}/accept`)
        .then(async (res) => {
          if (!res.ok) {
            const error = await res.json().catch(() => ({ error: 'Failed to load invitation' }))
            throw new Error(error.error || 'Failed to load invitation')
          }
          return res.json()
        })
        .then((data) => {
          setInvitation(data.invitation)
          setLoading(false)
        })
        .catch((err) => {
          setError(err.message || 'Failed to load invitation')
          setLoading(false)
        })
    })
  }, [token])

  const handleAccept = async () => {
    if (!token || !user) return

    setAccepting(true)
    try {
      const response = await fetch(`/api/team/invitations/${token}/accept-authenticated`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to accept invitation' }))
        throw new Error(error.error || 'Failed to accept invitation')
      }

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation')
      setAccepting(false)
    }
  }

  const handleSignIn = () => {
    router.push(`/login?redirect=/invite/${token}`)
  }

  const handleSignUp = () => {
    router.push(`/signup?email=${invitation?.email || ''}&redirect=/invite/${token}`)
  }

  if (checkingAuth || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Invalid Invitation
            </CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/">Go to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!invitation) {
    return null
  }

  const isExpired = new Date(invitation.expires_at) < new Date()
  const emailMatches = user?.email?.toLowerCase() === invitation.email.toLowerCase()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Team Invitation</CardTitle>
          <CardDescription>
            You've been invited to join a team on Syntera
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isExpired ? (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                This invitation has expired. Please ask for a new invitation.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Invited email:</span>
                  <span className="font-medium">{invitation.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {invitation.role === 'admin' ? (
                    <Shield className="h-4 w-4 text-blue-500" />
                  ) : (
                    <User className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="text-muted-foreground">Role:</span>
                  <span className="font-medium capitalize">{invitation.role}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                </div>
              </div>

              {!user ? (
                <div className="space-y-3 pt-4">
                  <Alert>
                    <AlertDescription>
                      Please sign in or create an account to accept this invitation.
                    </AlertDescription>
                  </Alert>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleSignIn}
                      className="flex-1"
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={handleSignUp}
                      className="flex-1"
                    >
                      Sign Up
                    </Button>
                  </div>
                </div>
              ) : !emailMatches ? (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    This invitation was sent to <strong>{invitation.email}</strong>, but you're signed in as <strong>{user.email}</strong>. Please sign in with the correct email address.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3 pt-4">
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      You're signed in as <strong>{user.email}</strong>. Click below to accept the invitation.
                    </AlertDescription>
                  </Alert>
                  <Button
                    onClick={handleAccept}
                    disabled={accepting}
                    className="w-full"
                  >
                    {accepting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Accepting...
                      </>
                    ) : (
                      'Accept Invitation'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}

          <div className="pt-4 border-t">
            <Button variant="ghost" asChild className="w-full">
              <Link href="/">Go to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

