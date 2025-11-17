'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Bar, BarChart, Area, AreaChart } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Clock, FileText, Sparkles, TrendingUp, TrendingDown, MoreVertical } from 'lucide-react'
import { timeData, aiUsageData, workshopStats } from '@/lib/data'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function WorkshopStats() {
  const [timeRange, setTimeRange] = useState('week')
  
  const handleMenuClick = () => {
    toast.info('Workshop Statistics Options', {
      description: 'Export data, customize charts, or view detailed reports',
    })
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
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleMenuClick}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stat Cards with enhanced design */}
        <div className="grid gap-3 md:grid-cols-3">
          <div className="group relative overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-secondary/80 to-secondary/40 p-3 transition-all duration-500 hover:scale-[1.03] hover:border-accent/50 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 p-2 shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-accent/30">
                  <Clock className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Avg. Time/Workshop</p>
                  <p className="text-2xl font-bold text-card-foreground">
                    {workshopStats.avgTime.value}{workshopStats.avgTime.unit}
                  </p>
                </div>
              </div>
              {workshopStats.avgTime.trend && (
                <div className={cn(
                  "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium backdrop-blur-sm",
                  workshopStats.avgTime.trend > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                )}>
                  {workshopStats.avgTime.trend > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(workshopStats.avgTime.trend)}%
                </div>
              )}
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-secondary/80 to-secondary/40 p-5 transition-all duration-500 hover:scale-[1.03] hover:border-primary/50 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 p-3 shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-primary/30">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Decks Created</p>
                  <p className="text-2xl font-bold text-secondary-foreground">
                    {workshopStats.decksCreated.value}
                  </p>
                </div>
              </div>
              {workshopStats.decksCreated.trend && (
                <div className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400 backdrop-blur-sm">
                  <TrendingUp className="h-3 w-3" />
                  +{workshopStats.decksCreated.trend}
                </div>
              )}
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-secondary/80 to-secondary/40 p-5 transition-all duration-500 hover:scale-[1.03] hover:border-chart-1/50 hover:shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-chart-1/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-chart-1/20 to-chart-1/10 p-3 shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-chart-1/30">
                  <Sparkles className="h-5 w-5 text-chart-1" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">AI Usage</p>
                  <p className="text-2xl font-bold text-card-foreground">
                    {workshopStats.aiUsage.value}{workshopStats.aiUsage.unit}
                  </p>
                </div>
              </div>
              {workshopStats.aiUsage.trend && (
                <div className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400 backdrop-blur-sm">
                  <TrendingUp className="h-3 w-3" />
                  +{workshopStats.aiUsage.trend}%
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Time Per Workshop Chart with Area */}
        <div className="space-y-2 rounded-lg border-2 border-border/50 bg-card p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-card-foreground">Time Per Workshop (Hours)</h3>
            <div className="flex gap-1 rounded-lg bg-secondary/70 p-1">
              {['week', 'month', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => {
                    setTimeRange(range)
                    toast.success(`Time range updated to ${range.charAt(0).toUpperCase() + range.slice(1)}`)
                  }}
                  className={cn(
                    "rounded-md px-2 py-1 text-xs font-medium transition-all",
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
          <ChartContainer
            config={{
              hours: {
                label: 'Hours',
                color: '#8b5cf6',
              },
            }}
            className="h-[200px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#6b7280" opacity={0.4} />
                <XAxis 
                  dataKey="day" 
                  stroke="#9ca3af"
                  fontSize={13}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  fontSize={13}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
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
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* AI Usage Chart with enhanced design */}
        <div className="space-y-2 rounded-lg border-2 border-border/50 bg-card p-4">
          <h3 className="text-sm font-bold text-card-foreground">AI Usage Trend (%)</h3>
          <ChartContainer
            config={{
              usage: {
                label: 'Usage %',
                color: '#8b5cf6',
              },
            }}
            className="h-[200px] w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aiUsageData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#6b7280" opacity={0.4} />
                <XAxis 
                  dataKey="week" 
                  stroke="#9ca3af"
                  fontSize={13}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  fontSize={13}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
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
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

