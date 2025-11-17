'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { recommendations } from '@/lib/data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Sparkles, CheckCircle2, X, MoreVertical } from 'lucide-react'
import { useState } from 'react'

export function AiRecommendations({ searchQuery = '' }) {
  const [dismissed, setDismissed] = useState(new Set())
  
  // Filter recommendations based on search query
  const filteredRecommendations = recommendations.filter(rec => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      rec.title.toLowerCase().includes(query) ||
      rec.description.toLowerCase().includes(query) ||
      rec.type.toLowerCase().includes(query) ||
      rec.priority.toLowerCase().includes(query)
    )
  })
  
  const handleRecommendationClick = (rec) => {
    toast.info(`Viewing recommendation: ${rec.title}`, {
      description: rec.description,
    })
  }

  const handleDismiss = (id, e) => {
    e.stopPropagation()
    setDismissed(prev => new Set(prev).add(id))
    toast.success('Recommendation dismissed')
  }

  const handleApply = (rec, e) => {
    e.stopPropagation()
    toast.success(`Applied: ${rec.title}`, {
      description: 'Recommendation has been applied to your workflow',
    })
  }

  const visibleRecommendations = filteredRecommendations.filter(rec => !dismissed.has(rec.id))

  return (
    <Card className="group border-2 border-border/70 bg-card transition-all duration-500 hover:border-accent hover:shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 p-1.5">
              <Sparkles className="h-4 w-4 text-accent" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-card-foreground">AI Recommendations</CardTitle>
              <CardDescription className="text-muted-foreground mt-1">
                Smart insights for optimization
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {visibleRecommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-muted-foreground">All caught up!</p>
            <p className="text-xs text-muted-foreground mt-1">No pending recommendations</p>
          </div>
        ) : (
          visibleRecommendations.map((rec, index) => {
            const Icon = rec.icon
            const isHighPriority = rec.priority === 'high'
            
            return (
              <div 
                key={rec.id}
                onClick={() => handleRecommendationClick(rec)}
                className={cn(
                  "group relative overflow-hidden cursor-pointer rounded-lg border border-border/50 bg-gradient-to-br from-secondary/60 to-secondary/30 p-3 transition-all duration-500",
                  "hover:scale-[1.02] hover:border-accent/50 hover:bg-secondary/80 hover:shadow-lg",
                  isHighPriority && "ring-1 ring-destructive/30 hover:ring-destructive/50 bg-destructive/5"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                  rec.type === 'insight' && 'from-chart-1/5 via-transparent to-chart-1/5',
                  rec.type === 'suggestion' && 'from-primary/5 via-transparent to-primary/5',
                  rec.type === 'alert' && 'from-destructive/5 via-transparent to-destructive/5'
                )} />
                <div className="relative flex items-start gap-2">
                  <div className={cn(
                    "rounded-lg p-2 shadow-md transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                    rec.type === 'insight' && 'bg-chart-1/20 group-hover:bg-chart-1/30',
                    rec.type === 'suggestion' && 'bg-primary/20 group-hover:bg-primary/30',
                    rec.type === 'alert' && 'bg-destructive/20 group-hover:bg-destructive/30'
                  )}>
                    <Icon className={cn(
                      "h-4 w-4 transition-colors",
                      rec.type === 'insight' && 'text-chart-1',
                      rec.type === 'suggestion' && 'text-primary',
                      rec.type === 'alert' && 'text-destructive'
                    )} />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-secondary-foreground transition-colors group-hover:text-foreground">
                          {rec.title}
                        </p>
                        {isHighPriority && (
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-destructive" />
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={(e) => handleDismiss(rec.id, e)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{rec.description}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={(e) => handleApply(rec, e)}
                      >
                        Apply
                      </Button>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          rec.priority === 'high' && "border-destructive/50 text-destructive",
                          rec.priority === 'medium' && "border-accent/50 text-accent"
                        )}
                      >
                        {rec.priority} priority
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}

