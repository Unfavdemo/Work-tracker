'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sparkles, TrendingUp, Clock, Activity, Zap, Loader2, RefreshCw, MoreVertical, ExternalLink, Settings, Download } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts'

export function AIUsageTracker() {
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('week')

  useEffect(() => {
    fetchAIUsageStats()
    // Refresh every 60 seconds
    const interval = setInterval(fetchAIUsageStats, 60000)
    return () => clearInterval(interval)
  }, [timeRange])

  const fetchAIUsageStats = async () => {
    setIsLoading(true)
    try {
      const now = new Date()
      let startDate = null
      
      if (timeRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        startDate = weekAgo.toISOString().split('T')[0]
      } else if (timeRange === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        startDate = monthAgo.toISOString().split('T')[0]
      }

      const params = new URLSearchParams({
        includeLogs: 'false',
        ...(startDate && { startDate }),
      })

      const response = await fetch(`/api/ai-usage/stats?${params}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        
        // Emit event to update dashboard AI efficiency percentage
        if (data.stats) {
          const aiEfficiency = Math.round(data.stats.successRate || 0)
          
          // Emit custom event for same-tab communication
          window.dispatchEvent(new CustomEvent('aiStatsUpdated', {
            detail: { aiEfficiency, stats: data.stats }
          }))
          
          // Store in localStorage for cross-tab and cross-component communication
          const previousEfficiency = localStorage.getItem('ai_efficiency')
          localStorage.setItem('ai_efficiency', aiEfficiency.toString())
          localStorage.setItem('ai_stats_updated', Date.now().toString())
          
          // Trigger storage event for cross-tab sync (only if value changed)
          if (previousEfficiency !== aiEfficiency.toString()) {
            // Storage events only fire in other tabs, so we manually trigger for same tab
            window.dispatchEvent(new StorageEvent('storage', {
              key: 'ai_stats_updated',
              newValue: Date.now().toString(),
              storageArea: localStorage
            }))
          }
          
          // Debug logging (can be removed in production)
          if (process.env.NODE_ENV === 'development') {
            console.log('🔗 AI Tracker → Dashboard: Updated AI efficiency to', aiEfficiency + '%')
          }
        }
      }
    } catch (error) {
      console.error('Error fetching AI usage stats:', error)
      toast.error('Failed to load AI usage stats')
    } finally {
      setIsLoading(false)
    }
  }

  // Prepare chart data
  const chartData = stats?.usageByDay 
    ? Object.entries(stats.usageByDay)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .slice(-7)
        .map(([date, data]) => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          requests: data.requests,
          tokens: data.tokens,
        }))
    : []

  // Prepare usage by type data
  const typeData = stats?.usageByType
    ? Object.entries(stats.usageByType)
        .map(([type, count]) => ({
          type: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          count,
        }))
        .sort((a, b) => b.count - a.count)
    : []

  return (
    <Card className="border-2 border-border/70 bg-card transition-all duration-500 hover:border-accent hover:shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 p-1.5">
              <Sparkles className="h-4 w-4 text-accent" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-card-foreground">AI Efficiency Tracker</CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                Monitor AI interactions and usage
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={fetchAIUsageStats}
              disabled={isLoading}
              title="Refresh"
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/chatgpt')}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Chat with ChatGPT
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/ai-usage')}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Full Analytics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={fetchAIUsageStats} disabled={isLoading}>
                  <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
                  Refresh Data
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => {
                    if (stats) {
                      const data = {
                        stats,
                        exportedAt: new Date().toISOString(),
                      }
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `ai-usage-${new Date().toISOString().split('T')[0]}.json`
                      document.body.appendChild(a)
                      a.click()
                      document.body.removeChild(a)
                      URL.revokeObjectURL(url)
                      toast.success('AI usage data exported')
                    }
                  }}
                  disabled={!stats || stats.totalRequests === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        ) : !stats || stats.totalRequests === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
            <div className="rounded-full bg-accent/10 p-3">
              <Sparkles className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-card-foreground">No AI usage tracked yet</p>
              <p className="text-xs text-muted-foreground mt-1">Start using AI features to see statistics here</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/chatgpt')}
              className="gap-2 mt-2"
            >
              <Sparkles className="h-4 w-4" />
              Try ChatGPT Chat
            </Button>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="space-y-1.5">
              <div className="rounded-lg border border-border/50 bg-gradient-to-br from-secondary/40 to-secondary/20 p-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <Activity className="h-3.5 w-3.5 text-accent" />
                  <p className="text-xs font-medium text-muted-foreground">Total Requests</p>
                </div>
                <p className="text-xl font-bold text-card-foreground">{stats.totalRequests}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stats.totalRequestsToday} today
                </p>
              </div>

              <div className="rounded-lg border border-border/50 bg-gradient-to-br from-secondary/40 to-secondary/20 p-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap className="h-3.5 w-3.5 text-yellow-500" />
                  <p className="text-xs font-medium text-muted-foreground">Total Tokens</p>
                </div>
                <p className="text-xl font-bold text-card-foreground">
                  {stats.totalTokens.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Avg: {Math.round(stats.totalTokens / stats.totalRequests).toLocaleString()}
                </p>
              </div>

              <div className="rounded-lg border border-border/50 bg-gradient-to-br from-secondary/40 to-secondary/20 p-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                  <p className="text-xs font-medium text-muted-foreground">Avg Response</p>
                </div>
                <p className="text-xl font-bold text-card-foreground">
                  {stats.avgResponseTime}ms
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {stats.successRate.toFixed(1)}% success
                </p>
              </div>
            </div>

            {/* Usage Chart */}
            {chartData.length > 0 && (
              <div className="space-y-1.5 rounded-lg border border-border/50 bg-card p-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-card-foreground">Daily Usage</h3>
                  <div className="flex gap-1 rounded-lg bg-secondary/70 p-0.5">
                    {['week', 'month', 'all'].map((range) => (
                      <button
                        key={range}
                        onClick={() => {
                          setTimeRange(range)
                          toast.success(`Time range updated to ${range.charAt(0).toUpperCase() + range.slice(1)}`)
                        }}
                        className={cn(
                          "rounded px-1.5 py-0.5 text-xs font-medium transition-all",
                          timeRange === range
                            ? "bg-accent text-accent-foreground shadow-sm font-bold"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {range.charAt(0).toUpperCase() + range.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-[180px] w-full overflow-x-auto">
                  <BarChart width={888} height={180} data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--foreground))"
                      tick={{ fill: 'hsl(var(--foreground))' }}
                      fontSize={11}
                    />
                    <YAxis 
                      stroke="hsl(var(--foreground))"
                      tick={{ fill: 'hsl(var(--foreground))' }}
                      fontSize={11}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Legend />
                    <Bar dataKey="requests" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Requests" />
                  </BarChart>
                </div>
              </div>
            )}

            {/* Period Summary */}
            <div className="rounded-lg border border-border/50 bg-gradient-to-br from-secondary/40 to-secondary/20 p-1.5">
              <h3 className="text-xs font-semibold text-muted-foreground mb-1.5">Period Summary</h3>
              <div className="space-y-1.5">
                <div>
                  <p className="text-xs text-muted-foreground">This Week</p>
                  <p className="text-lg font-bold text-card-foreground">
                    {stats.totalRequestsThisWeek || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">This Month</p>
                  <p className="text-lg font-bold text-card-foreground">
                    {stats.totalRequestsThisMonth || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Usage by Type */}
            {typeData.length > 0 && (
              <div className="rounded-lg border border-border/50 bg-card p-1.5">
                <h3 className="text-xs font-semibold text-card-foreground mb-1.5">Usage by Type</h3>
                <div className="space-y-1.5">
                  {typeData.map((item, index) => (
                    <div key={index} className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{item.type}</span>
                        <span className="text-xs font-semibold text-card-foreground">
                          {item.count}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-1.5">
                        <div
                          className="bg-accent h-1.5 rounded-full transition-all"
                          style={{
                            width: `${(item.count / stats.totalRequests) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

