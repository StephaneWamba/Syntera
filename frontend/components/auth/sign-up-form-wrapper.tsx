'use client'

import { Suspense } from 'react'
import { SignUpForm } from './sign-up-form'

export function SignUpFormWrapper() {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="h-10 bg-muted animate-pulse rounded" />
      </div>
    }>
      <SignUpForm />
    </Suspense>
  )
}

