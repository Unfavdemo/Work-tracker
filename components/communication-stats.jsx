'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, Filter, MoreVertical } from 'lucide-react'
import { communicationData } from '@/lib/data'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function CommunicationStats() {
  const [filter, setFilter] = useState('all')
  
  const handleFilterClick = () => {
    toast.info('Filter Communication Data', {
      description: 'Filter by type, date range, or status',
    })
  }

  const handleMenuClick = () => {
    toast.info('Communication Options', {
      description: 'View settings, export data, or configure notifications',
    })
  }
  
  return (
    <Card className="group border-2 border-border/70 bg-card transition-all duration-500 hover:border-accent hover:shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-card-foreground">Student Communication</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Track all communication channels
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleFilterClick}>
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleMenuClick}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {communicationData.map((item, index) => {
            const Icon = item.icon
            return (
              <div 
                key={item.type} 
                className="group relative overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-secondary/40 to-secondary/20 p-3 transition-all duration-500 hover:scale-[1.02] hover:border-accent/50 hover:bg-secondary/60 hover:shadow-lg"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="relative rounded-lg bg-gradient-to-br p-2 shadow-md transition-all duration-500 group-hover:scale-110 group-hover:rotate-3" style={{ background: `linear-gradient(135deg, ${item.color}20, ${item.color}10)` }}>
                        <Icon className="h-4 w-4 transition-colors" style={{ color: item.color }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-card-foreground">{item.type}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">This month</p>
                          {item.trend !== undefined && (
                            <div className={cn(
                              "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium backdrop-blur-sm",
                              item.trend > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                            )}>
                              {item.trend > 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              {Math.abs(item.trend)}%
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-card-foreground">{item.count}</span>
                      <p className="text-xs text-muted-foreground">messages</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-card-foreground">{item.progress}% of target</span>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={item.progress} 
                        className="h-3 transition-all duration-700" 
                      />
                      <div 
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                        style={{ background: `linear-gradient(90deg, transparent, ${item.color}40, transparent)` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

