'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Line, LineChart, XAxis, YAxis, Bar, BarChart, Area, AreaChart, Tooltip } from 'recharts'
import { Clock, FileText, Sparkles, TrendingUp, TrendingDown, MoreVertical, Loader2, Download, RefreshCw, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function WorkshopStats() {
  const router = useRouter()
  const [timeRange, setTimeRange] = useState('week')
  const [stats, setStats] = useState(null)
  const [timeChartData, setTimeChartData] = useState([])
  const [aiChartData, setAiChartData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Prevent hydration mismatch by only rendering charts on client
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  const fetchWorkshopStats = useCallback(async () => {
    setIsLoading(true)
    try {
      // Get Google Calendar token if available
      const calendarToken = localStorage.getItem('google_token') || localStorage.getItem('google_calendar_token')
      const headers = calendarToken ? {
        'Authorization': `Bearer ${calendarToken}`
      } : {}
      
      const response = await fetch(`/api/workshops/stats?timeRange=${timeRange}`, {
        headers
      })
      if (response.ok) {
        const data = await response.json()
        if (data.stats) {
          setStats(data.stats)
          setTimeChartData(data.stats.timeData || [])
          setAiChartData(data.stats.aiUsageData || [])
        }
      } else {
        // If API fails, set to null (no data)
        setStats(null)
        setTimeChartData([])
        setAiChartData([])
      }
    } catch (error) {
      console.error('Error fetching workshop stats:', error)
      // Set to null on error (no data)
      setStats(null)
      setTimeChartData([])
      setAiChartData([])
    } finally {
      setIsLoading(false)
    }
  }, [timeRange])
  
  useEffect(() => {
    fetchWorkshopStats()
    // Refresh every 30 seconds to get updated stats
    const interval = setInterval(fetchWorkshopStats, 30000)
    
    // Listen for workshop update events
    const handleWorkshopUpdate = () => {
      fetchWorkshopStats()
    }
    window.addEventListener('workshopUpdated', handleWorkshopUpdate)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('workshopUpdated', handleWorkshopUpdate)
    }
  }, [fetchWorkshopStats])
  
  const handleExport = () => {
    const exportData = JSON.stringify({
      stats,
      timeChartData,
      aiChartData,
      exportedAt: new Date().toISOString()
    }, null, 2)
    const blob = new Blob([exportData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `workshop-stats-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Workshop statistics exported!')
  }
  
  const handleRefresh = () => {
    fetchWorkshopStats()
    toast.success('Workshop statistics refreshed!')
  }
  
  return (
    <Card className="group border-2 border-border/70 bg-card transition-all duration-500 hover:border-accent hover:shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-card-foreground">Workshop Statistics</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Track creation time, decks, and AI usage
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-5 w-5" />
                Refresh Data
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExport}>
                <Download className="mr-2 h-5 w-5" />
                Export Data
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <Settings className="mr-2 h-5 w-5" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pb-4">
        {/* Stat Cards with enhanced design */}
        <div className="grid gap-4 md:grid-cols-4 w-full">
          <div className="group relative overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-secondary/80 to-secondary/40 p-5 transition-all duration-500 hover:scale-[1.03] hover:border-accent/50 hover:shadow-xl w-full h-full flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative flex items-center justify-between flex-1">
              <div className="flex items-center gap-4 flex-1">
                <div className="rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 p-3 shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-accent/30">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Time per Workshop Creation</p>
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-accent mt-3" />
                  ) : stats ? (
                    <>
                      <p className="text-3xl font-bold text-card-foreground">
                        {stats.avgTime?.value || 0}{stats.avgTime?.unit || 'h'}
                      </p>
                    </>
                  ) : (
                    <p className="text-base text-muted-foreground mt-3">No data</p>
                  )}
                </div>
              </div>
              {!isLoading && stats && stats.avgTime?.trend && (
                <div className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium backdrop-blur-sm flex-shrink-0",
                  stats.avgTime.trend > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                )}>
                  {stats.avgTime.trend > 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {Math.abs(stats.avgTime.trend)}%
                </div>
              )}
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-secondary/80 to-secondary/40 p-5 transition-all duration-500 hover:scale-[1.03] hover:border-primary/50 hover:shadow-xl w-full h-full flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative flex items-center justify-between flex-1">
              <div className="flex items-center gap-4 flex-1">
                <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 p-3 shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-primary/30">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Workshops Created</p>
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary mt-3" />
                  ) : stats ? (
                    <>
                      <p className="text-3xl font-bold text-secondary-foreground">
                        {stats.workshopsCreated?.value || stats.decksCreated?.value || 0}
                      </p>
                    </>
                  ) : (
                    <p className="text-base text-muted-foreground mt-3">No data</p>
                  )}
                </div>
              </div>
              {!isLoading && stats && stats.workshopsCreated?.trend !== undefined && (
                <div className="flex items-center gap-1.5 rounded-full bg-green-500/20 px-3 py-1.5 text-sm font-medium text-green-400 backdrop-blur-sm flex-shrink-0">
                  <TrendingUp className="h-4 w-4" />
                  +{stats.workshopsCreated.trend}%
                </div>
              )}
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-secondary/80 to-secondary/40 p-5 transition-all duration-500 hover:scale-[1.03] hover:border-primary/50 hover:shadow-xl w-full h-full flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative flex items-center justify-between flex-1">
              <div className="flex items-center gap-4 flex-1">
                <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 p-3 shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-primary/30">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Decks Created</p>
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary mt-3" />
                  ) : stats ? (
                    <>
                      <p className="text-3xl font-bold text-secondary-foreground">
                        {stats.decksCreated?.value || 0}
                      </p>
                    </>
                  ) : (
                    <p className="text-base text-muted-foreground mt-3">No data</p>
                  )}
                </div>
              </div>
              {!isLoading && stats && stats.decksCreated?.trend && (
                <div className="flex items-center gap-1.5 rounded-full bg-green-500/20 px-3 py-1.5 text-sm font-medium text-green-400 backdrop-blur-sm flex-shrink-0">
                  <TrendingUp className="h-4 w-4" />
                  +{stats.decksCreated.trend}
                </div>
              )}
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-secondary/80 to-secondary/40 p-5 transition-all duration-500 hover:scale-[1.03] hover:border-chart-1/50 hover:shadow-xl w-full h-full flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-chart-1/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative flex items-center justify-between flex-1">
              <div className="flex items-center gap-4 flex-1">
                <div className="rounded-xl bg-gradient-to-br from-chart-1/20 to-chart-1/10 p-3 shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-chart-1/30">
                  <Sparkles className="h-6 w-6 text-chart-1" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">AI Usage</p>
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-chart-1 mt-3" />
                  ) : stats ? (
                    <>
                      <p className="text-3xl font-bold text-card-foreground">
                        {stats.aiUsage?.value || 0}{stats.aiUsage?.unit || '%'}
                      </p>
                    </>
                  ) : (
                    <p className="text-base text-muted-foreground mt-3">No data</p>
                  )}
                </div>
              </div>
              {!isLoading && stats && stats.aiUsage?.trend && (
                <div className="flex items-center gap-1.5 rounded-full bg-green-500/20 px-3 py-1.5 text-sm font-medium text-green-400 backdrop-blur-sm flex-shrink-0">
                  <TrendingUp className="h-4 w-4" />
                  +{stats.aiUsage.trend}%
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Time Per Workshop Chart with Area */}
        <div className="space-y-4 rounded-lg border-2 border-border/50 bg-card p-4 w-full flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-card-foreground">Time Per Workshop (Hours)</h3>
            <div className="flex gap-2 rounded-lg bg-secondary/70 p-1.5">
              {['week', 'month', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    setTimeRange(range)
                    toast.success(`Time range updated to ${range.charAt(0).toUpperCase() + range.slice(1)}`)
                  }}
                  className={cn(
                    "rounded-md px-4 py-2 text-sm font-medium transition-all",
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
          {isMounted ? (
            <div className="h-[240px] w-full overflow-x-auto">
              <AreaChart width={888} height={240} data={timeChartData.length > 0 ? timeChartData : [{ day: 'Mon', hours: 0 }, { day: 'Tue', hours: 0 }, { day: 'Wed', hours: 0 }, { day: 'Thu', hours: 0 }, { day: 'Fri', hours: 0 }, { day: 'Sat', hours: 0 }, { day: 'Sun', hours: 0 }]} margin={{ top: 15, right: 15, left: 15, bottom: 10 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="day" 
                  stroke="hsl(var(--foreground))"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                  fontSize={13}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                />
                <YAxis 
                  stroke="hsl(var(--foreground))"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                  fontSize={13}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
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
                  cursor={{ stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#8b5cf6" 
                  strokeWidth={4}
                  fill="url(#colorHours)"
                  dot={{ fill: '#8b5cf6', r: 5, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
                  animationDuration={1500}
                />
              </AreaChart>
            </div>
          ) : (
            <div className="h-[240px] w-full flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        {/* AI Usage Chart with enhanced design */}
        <div className="space-y-4 rounded-lg border-2 border-border/50 bg-card p-4 w-full flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-card-foreground">AI Usage Trend (%)</h3>
            {aiChartData.length === 0 && !isLoading && (
              <p className="text-xs text-muted-foreground">No data available yet</p>
            )}
          </div>
          {isMounted ? (
            <div className="h-[240px] w-full overflow-x-auto">
              <BarChart width={888} height={240} data={aiChartData.length > 0 ? aiChartData : [{ week: 'W1', usage: 0 }, { week: 'W2', usage: 0 }, { week: 'W3', usage: 0 }, { week: 'W4', usage: 0 }]} margin={{ top: 15, right: 15, left: 15, bottom: 10 }}>
              <defs>
                <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={1}/>
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.8}/>
                </linearGradient>
                </defs>
              <XAxis
                dataKey="week" 
                stroke="hsl(var(--foreground))"
                tick={{ fill: 'hsl(var(--foreground))' }}
                fontSize={13}
                fontWeight={600}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
              />
              <YAxis 
                stroke="hsl(var(--foreground))"
                tick={{ fill: 'hsl(var(--foreground))' }}
                fontSize={13}
                fontWeight={600}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
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
                  cursor={{ fill: '#8b5cf6', opacity: 0.2 }}
                />
              <Bar 
                dataKey="usage" 
                fill="url(#colorUsage)" 
                radius={[8, 8, 0, 0]}
                stroke="#7c3aed"
                strokeWidth={1}
                animationDuration={1500}
              />
            </BarChart>
          </div>
          ) : (
            <div className="h-[240px] w-full flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default WorkshopStats
