'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { performanceMetrics } from '@/lib/data'
import { TrendingUp, TrendingDown, Target, Zap, Users, Award, Loader2, MoreVertical, Download, RefreshCw, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const metricIcons = {
  productivity: Target,
  engagement: Users,
  efficiency: Zap,
  quality: Award,
}

export function PerformanceMetrics() {
  const router = useRouter()
  const [metrics, setMetrics] = useState(performanceMetrics)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    fetchPerformanceMetrics()
  }, [])
  
  const fetchPerformanceMetrics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/performance/metrics')
      if (response.ok) {
        const result = await response.json()
        if (result.metrics) {
          setMetrics(result.metrics)
        }
      }
    } catch (error) {
      console.error('Error fetching performance metrics:', error)
      // Use fallback data (already set in state)
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <Card className="border-2 border-border/70 bg-card transition-all duration-500 hover:border-accent hover:shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-card-foreground">Performance Metrics</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Track your overall performance
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { fetchPerformanceMetrics(); toast.success('Performance metrics refreshed!') }}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const exportData = JSON.stringify(metrics, null, 2)
                const blob = new Blob([exportData], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `performance-metrics-${new Date().toISOString().split('T')[0]}.json`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
                toast.success('Performance metrics exported!')
              }}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        ) : (
          <div className="grid gap-1.5 sm:grid-cols-2">
            {Object.entries(metrics).map(([key, metric]) => {
            const Icon = metricIcons[key]
            return (
              <div
                key={key}
                className="group rounded-lg border border-border/50 bg-gradient-to-br from-secondary/40 to-secondary/20 p-2 transition-all duration-300 hover:border-accent/50 hover:shadow-lg"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="rounded-lg bg-accent/20 p-1">
                      <Icon className="h-3.5 w-3.5 text-accent" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {metric.label}
                    </span>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                    metric.trend > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                  )}>
                    {metric.trend > 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(metric.trend)}%
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold text-card-foreground">
                      {metric.value}
                    </span>
                    <span className="text-sm text-muted-foreground">/100</span>
                  </div>
                  <Progress value={metric.value} className="h-2" />
                </div>
              </div>
            )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

