'use client'

import { Suspense } from 'react'
import { SignInForm } from './sign-in-form'

export function SignInFormWrapper() {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="h-10 bg-muted animate-pulse rounded" />
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}

