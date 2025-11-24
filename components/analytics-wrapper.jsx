'use client'

import dynamic from 'next/dynamic'

// Dynamically import Analytics with SSR disabled to prevent router access issues
const Analytics = dynamic(
  () => import('@vercel/analytics/next').then((mod) => mod.Analytics),
  { ssr: false }
)

export function AnalyticsWrapper() {
  return <Analytics />
}

