"use client"

import { SignUpForm } from '@/components/auth/sign-up-form'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import Link from 'next/link'
import Image from 'next/image'
import { LazyMotionNav, LazyMotionDiv, LazyMotionH2, LazyMotionP } from '@/components/shared/lazy-motion-extended'

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <LazyMotionNav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/logo.svg" 
              alt="Syntera" 
              width={120} 
              height={32}
              className="h-8 w-auto"
              priority
            />
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </LazyMotionNav>

      {/* Main Content */}
      <div className="flex flex-1 items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <LazyMotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="flex flex-col items-center space-y-2 text-center">
            <LazyMotionDiv
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
            >
              <Image 
                src="/logo.svg" 
                alt="Syntera" 
                width={120} 
                height={32}
                className="h-10 w-auto mb-4"
              />
            </LazyMotionDiv>
            <LazyMotionH2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-3xl font-bold tracking-tight"
            >
              Create your account
            </LazyMotionH2>
            <LazyMotionP
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-sm text-muted-foreground"
            >
              Get started with Syntera today. No credit card required.
            </LazyMotionP>
          </div>

          <LazyMotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <SignUpForm />
          </LazyMotionDiv>

          <LazyMotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center text-sm"
          >
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </LazyMotionDiv>
        </LazyMotionDiv>
      </div>
    </div>
  )
}

