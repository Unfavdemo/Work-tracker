'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { activityFeed } from '@/lib/data'
import { cn } from '@/lib/utils'
import { MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function ActivityFeed({ searchQuery = '' }) {
  // Filter activities based on search query
  const filteredActivities = activityFeed.filter(activity => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      activity.title.toLowerCase().includes(query) ||
      activity.type.toLowerCase().includes(query) ||
      activity.timestamp.toLowerCase().includes(query)
    )
  })

  return (
    <Card className="border-2 border-border/70 bg-card transition-all duration-500 hover:border-accent hover:shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-card-foreground">Recent Activity</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Your latest actions and updates
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info('Activity Feed Options', { description: 'Filter activities, export log, or configure notifications' })}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm font-medium text-muted-foreground">No activities found</p>
            <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredActivities.map((activity, index) => {
            const Icon = activity.icon
            return (
              <div
                key={activity.id}
                className="group flex items-start gap-2 rounded-lg border border-border/50 bg-secondary/20 p-2.5 transition-all duration-300 hover:border-accent/50 hover:bg-secondary/40"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={cn(
                  "rounded-lg p-2 shadow-sm bg-chart-1/20"
                )}>
                  <Icon className="h-4 w-4 text-chart-1" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-card-foreground leading-tight">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.timestamp}
                  </p>
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

