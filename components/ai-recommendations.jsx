'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { recommendations } from '@/lib/data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Sparkles, CheckCircle2, X, MoreVertical, Loader2, TrendingUp, Lightbulb, AlertCircle, Clock, Download, RefreshCw, Settings } from 'lucide-react'
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

// Icon mapping for recommendations
const iconMap = {
  TrendingUp,
  Lightbulb,
  AlertCircle,
  Clock,
}

export function AiRecommendations({ searchQuery = '' }) {
  const router = useRouter()
  const [dismissed, setDismissed] = useState(new Set())
  const [recs, setRecs] = useState(recommendations)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    fetchRecommendations()
  }, [])
  
  const fetchRecommendations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/recommendations/list')
      
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          try {
            const result = await response.json()
            if (result.recommendations && Array.isArray(result.recommendations)) {
              setRecs(result.recommendations)
            } else {
              console.warn('Invalid recommendations data format, using fallback')
            }
          } catch (jsonError) {
            console.error('Error parsing recommendations JSON:', jsonError)
            // Use fallback data (already set in state)
          }
        } else {
          console.warn('Response is not JSON, using fallback data')
        }
      } else {
        // Try to get error message
        try {
          const errorText = await response.text()
          if (errorText.trim().startsWith('<!DOCTYPE')) {
            console.warn('Recommendations endpoint returned HTML, using fallback data')
          } else {
            console.warn(`Recommendations response not OK (${response.status}), using fallback data`)
          }
        } catch (e) {
          console.warn('Recommendations response not OK, using fallback data')
        }
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      // Use fallback data (already set in state)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Filter recommendations based on search query
  const filteredRecommendations = recs.filter(rec => {
    if (!searchQuery.trim()) return true
    if (!rec) return false
    const query = searchQuery.toLowerCase()
    return (
      (rec.title && rec.title.toLowerCase().includes(query)) ||
      (rec.description && rec.description.toLowerCase().includes(query)) ||
      (rec.type && rec.type.toLowerCase().includes(query)) ||
      (rec.priority && rec.priority.toLowerCase().includes(query))
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { fetchRecommendations(); toast.success('Recommendations refreshed!') }}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const exportData = JSON.stringify(recs.filter(r => !dismissed.has(r.id)), null, 2)
                const blob = new Blob([exportData], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `ai-recommendations-${new Date().toISOString().split('T')[0]}.json`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
                toast.success('Recommendations exported!')
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
      <CardContent className="space-y-1.5">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        ) : visibleRecommendations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-muted-foreground">All caught up!</p>
            <p className="text-xs text-muted-foreground mt-1">No pending recommendations</p>
          </div>
        ) : (
          visibleRecommendations
            .filter(rec => rec && rec.title)
            .map((rec, index) => {
            
            // Handle both string icon names (from API) and component icons (from static data)
            const Icon = typeof rec.icon === 'string' 
              ? (iconMap[rec.icon] || Sparkles) 
              : (rec.icon || Sparkles)
            const isHighPriority = rec.priority === 'high'
            
            return (
              <div 
                key={rec.id || `rec-${index}`}
                onClick={() => handleRecommendationClick(rec)}
                className={cn(
                  "group relative overflow-hidden cursor-pointer rounded-lg border border-border/50 bg-gradient-to-br from-secondary/60 to-secondary/30 p-2 transition-all duration-500",
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
                <div className="relative flex items-start gap-1.5">
                  <div className={cn(
                    "rounded-lg p-1.5 shadow-md transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
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
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <p className="text-sm font-semibold text-secondary-foreground transition-colors group-hover:text-foreground truncate">
                          {rec.title}
                        </p>
                        {isHighPriority && (
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-destructive flex-shrink-0" />
                        )}
                        {rec.impact && (
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs flex-shrink-0",
                              rec.impact === 'high' && "border-green-500/50 text-green-500",
                              rec.impact === 'medium' && "border-blue-500/50 text-blue-500",
                              rec.impact === 'low' && "border-gray-500/50 text-gray-500"
                            )}
                          >
                            {rec.impact} impact
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0"
                        onClick={(e) => handleDismiss(rec.id, e)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{rec.description}</p>
                    
                    {/* Metrics Display */}
                    {rec.metrics && Object.keys(rec.metrics).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {Object.entries(rec.metrics).map(([key, value]) => (
                          <div key={key} className="rounded-md bg-accent/10 px-2 py-0.5">
                            <span className="text-xs font-medium text-accent-foreground">
                              {key.replace(/([A-Z])/g, ' $1').trim()}: <span className="font-bold">{value}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Items */}
                    {rec.actionItems && rec.actionItems.length > 0 && (
                      <div className="pt-1 space-y-0.5">
                        <p className="text-xs font-medium text-muted-foreground">Action items:</p>
                        <ul className="space-y-0.5">
                          {rec.actionItems.slice(0, 2).map((item, idx) => (
                            <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                              <span className="text-accent mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 pt-1">
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
                          rec.priority === 'medium' && "border-accent/50 text-accent",
                          rec.priority === 'low' && "border-muted-foreground/50 text-muted-foreground"
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

