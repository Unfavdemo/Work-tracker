'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { performanceMetrics } from '@/lib/data'
import { TrendingUp, TrendingDown, Target, Zap, Users, Award } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const metricIcons = {
  productivity: Target,
  engagement: Users,
  efficiency: Zap,
  quality: Award,
}

export function PerformanceMetrics() {
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
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info('Performance Metrics Options', { description: 'View detailed reports, set goals, or export metrics' })}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(performanceMetrics).map(([key, metric]) => {
            const Icon = metricIcons[key]
            return (
              <div
                key={key}
                className="group rounded-lg border border-border/50 bg-gradient-to-br from-secondary/40 to-secondary/20 p-3 transition-all duration-300 hover:border-accent/50 hover:shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="rounded-lg bg-accent/20 p-1.5">
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
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
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
      </CardContent>
    </Card>
  )
}

