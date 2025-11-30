'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart3, TrendingUp, MessageSquare, Users, Zap, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const metrics = [
    {
      title: 'Total Conversations',
      value: '0',
      change: '+0%',
      icon: MessageSquare,
      description: 'All time conversations',
    },
    {
      title: 'Active Agents',
      value: '0',
      change: '+0%',
      icon: Zap,
      description: 'Currently active',
    },
    {
      title: 'Avg Response Time',
      value: '0s',
      change: '+0%',
      icon: Clock,
      description: 'Average agent response',
    },
    {
      title: 'User Satisfaction',
      value: '0%',
      change: '+0%',
      icon: TrendingUp,
      description: 'Positive feedback rate',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-lg">
          Track your agent performance and usage metrics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  {metric.change} from last month
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage Overview</CardTitle>
          <CardDescription>Detailed analytics coming soon</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center space-y-2">
              <BarChart3 className="h-12 w-12 mx-auto opacity-50" />
              <p className="text-sm">Analytics dashboard coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

