'use client'

import dynamic from 'next/dynamic'

// Lazy load Framer Motion components to reduce initial bundle size

const MotionNav = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.nav),
  { ssr: false }
)

const MotionSection = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.section),
  { ssr: false }
)

const MotionH1 = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.h1),
  { ssr: false }
)

const MotionH2 = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.h2),
  { ssr: false }
)

const MotionP = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.p),
  { ssr: false }
)

const MotionSpan = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.span),
  { ssr: false }
)

const MotionButton = dynamic(
  () => import('framer-motion').then((mod) => mod.motion.button),
  { ssr: false }
)

// Type-safe wrapper components
export const LazyMotionNav = MotionNav
export const LazyMotionSection = MotionSection
export const LazyMotionH1 = MotionH1
export const LazyMotionH2 = MotionH2
export const LazyMotionP = MotionP
export const LazyMotionSpan = MotionSpan
export const LazyMotionButton = MotionButton

// Re-export LazyMotionDiv for consistency
export { LazyMotionDiv } from './lazy-motion'

