'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Sparkles, TrendingUp, DollarSign, Clock, Activity, Zap, Loader2, RefreshCw, 
  ArrowLeft, Filter, Download, Calendar, BarChart3, PieChart, List, ArrowUp, ArrowDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899']

export default function AIUsagePage() {
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState('overview') // 'overview', 'logs', 'analytics'
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: 'all',
    feature: 'all',
    success: 'all',
  })
  const [timeRange, setTimeRange] = useState('all') // 'today', 'week', 'month', 'all'
  const [sortBy, setSortBy] = useState('timestamp') // 'timestamp', 'cost', 'tokens', 'responseTime'
  const [sortOrder, setSortOrder] = useState('desc') // 'asc', 'desc'
  const [currentPage, setCurrentPage] = useState(1)
  const logsPerPage = 20

  useEffect(() => {
    fetchAIUsageData()
  }, [filters, timeRange])

  const fetchAIUsageData = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        includeLogs: 'true',
        limit: '100',
      })

      // Apply time range
      if (timeRange === 'today') {
        const today = new Date().toISOString().split('T')[0]
        params.append('startDate', today)
      } else if (timeRange === 'week') {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        params.append('startDate', weekAgo.toISOString().split('T')[0])
      } else if (timeRange === 'month') {
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        params.append('startDate', monthAgo.toISOString().split('T')[0])
      }

      // Apply filters
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.type !== 'all') params.append('type', filters.type)
      if (filters.feature !== 'all') params.append('feature', filters.feature)

      const response = await fetch(`/api/ai-usage/stats?${params}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setLogs(data.logs || [])
      }
    } catch (error) {
      console.error('Error fetching AI usage data:', error)
      toast.error('Failed to load AI usage data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchAIUsageData()
    setIsRefreshing(false)
    toast.success('Data refreshed')
  }

  const handleExport = (format = 'json') => {
    if (format === 'json') {
      const data = {
        stats,
        logs: filteredLogs,
        exportedAt: new Date().toISOString(),
        filters: {
          timeRange,
          ...filters
        }
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
      toast.success('AI usage data exported as JSON')
    } else if (format === 'csv') {
      // CSV export
      const headers = ['Date', 'Type', 'Feature', 'Model', 'Tokens', 'Cost', 'Response Time (ms)', 'Success', 'Error']
      const rows = filteredLogs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.type,
        log.feature,
        log.model,
        log.tokensUsed || 0,
        (log.cost || 0).toFixed(4),
        log.responseTime || 0,
        log.success ? 'Yes' : 'No',
        log.error || ''
      ])
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ai-usage-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('AI usage data exported as CSV')
    }
  }

  const handleClearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      type: 'all',
      feature: 'all',
      success: 'all',
    })
    setTimeRange('all')
    toast.success('Filters cleared')
  }

  const handleResetView = () => {
    setViewMode('overview')
    handleClearFilters()
    toast.success('View reset')
  }

  // Prepare chart data
  const dailyChartData = stats?.usageByDay 
    ? Object.entries(stats.usageByDay)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .slice(-30)
        .map(([date, data]) => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          requests: data.requests,
          cost: parseFloat(data.cost.toFixed(4)),
          tokens: data.tokens,
        }))
    : []

  const typeChartData = stats?.usageByType
    ? Object.entries(stats.usageByType)
        .map(([type, count]) => ({
          name: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          value: count,
        }))
        .sort((a, b) => b.value - a.value)
    : []

  const featureChartData = stats?.usageByFeature
    ? Object.entries(stats.usageByFeature)
        .map(([feature, count]) => ({
          name: feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          value: count,
        }))
        .sort((a, b) => b.value - a.value)
    : []

  const filteredLogs = logs
    .filter(log => {
      if (filters.type !== 'all' && log.type !== filters.type) return false
      if (filters.feature !== 'all' && log.feature !== filters.feature) return false
      if (filters.success !== 'all') {
        if (filters.success === 'success' && !log.success) return false
        if (filters.success === 'failed' && log.success) return false
      }
      return true
    })
    .sort((a, b) => {
      let aVal, bVal
      switch (sortBy) {
        case 'cost':
          aVal = a.cost || 0
          bVal = b.cost || 0
          break
        case 'tokens':
          aVal = a.tokensUsed || 0
          bVal = b.tokensUsed || 0
          break
        case 'responseTime':
          aVal = a.responseTime || 0
          bVal = b.responseTime || 0
          break
        case 'timestamp':
        default:
          aVal = new Date(a.timestamp).getTime()
          bVal = new Date(b.timestamp).getTime()
          break
      }
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    })

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage)
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  )

  useEffect(() => {
    setCurrentPage(1) // Reset to first page when filters change
  }, [filters, sortBy, sortOrder])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-1.5 sm:p-2 lg:p-2.5">
      <div className="mx-auto w-full space-y-1.5">
        {/* Header */}
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
              className="h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                AI Usage Analytics
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Detailed tracking and analysis of all AI interactions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handleExport('json')}
              className="gap-2"
              disabled={!stats || stats.totalRequests === 0}
            >
              <Download className="h-4 w-4" />
              Export JSON
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('csv')}
              className="gap-2"
              disabled={!stats || stats.totalRequests === 0 || filteredLogs.length === 0}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
            {(filters.type !== 'all' || filters.feature !== 'all' || filters.success !== 'all' || filters.startDate || filters.endDate || timeRange !== 'all') && (
              <Button
                variant="ghost"
                onClick={handleClearFilters}
                className="gap-2"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-lg bg-secondary/70 p-1">
            {['today', 'week', 'month', 'all'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                  timeRange === range
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-40"
              placeholder="Start date"
            />
            <span className="text-muted-foreground">to</span>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-40"
              placeholder="End date"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : !stats || stats.totalRequests === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20">
              <Sparkles className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">No AI Usage Data</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                AI interactions will appear here once you start using AI features like recommendations enhancement.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid gap-1.5 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold">{stats.totalRequests}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.totalRequestsToday} today
                      </p>
                    </div>
                    <Activity className="h-8 w-8 text-accent opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Tokens</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold">{stats.totalTokens.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Avg: {Math.round(stats.totalTokens / stats.totalRequests).toLocaleString()}
                      </p>
                    </div>
                    <Zap className="h-8 w-8 text-yellow-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Cost</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold">${stats.totalCost.toFixed(4)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ${stats.totalCostToday.toFixed(4)} today
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold">{stats.avgResponseTime}ms</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats.successRate.toFixed(1)}% success rate
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* View Mode Tabs */}
            <div className="flex gap-2 border-b">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'analytics', label: 'Analytics', icon: PieChart },
                { id: 'logs', label: 'Logs', icon: List },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setViewMode(id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 border-b-2 transition-colors",
                    viewMode === id
                      ? "border-accent text-accent-foreground font-semibold"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {viewMode === 'overview' && (
              <div className="grid gap-1.5 lg:grid-cols-2">
                {/* Daily Usage Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Usage (Last 30 Days)</CardTitle>
                    <CardDescription>Requests and cost over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dailyChartData.length > 0 ? (
                      <ChartContainer config={{ requests: { label: 'Requests', color: '#8b5cf6' }, cost: { label: 'Cost ($)', color: '#10b981' } }} className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={dailyChartData}>
                            <XAxis dataKey="date" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="requests" stroke="#8b5cf6" strokeWidth={2} name="Requests" />
                            <Line yAxisId="right" type="monotone" dataKey="cost" stroke="#10b981" strokeWidth={2} name="Cost ($)" />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Usage by Type */}
                <Card>
                  <CardHeader>
                    <CardTitle>Usage by Type</CardTitle>
                    <CardDescription>Distribution of AI interaction types</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {typeChartData.length > 0 ? (
                      <ChartContainer config={{}} className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={typeChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {typeChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Period Summary */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Period Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Today</p>
                        <p className="text-2xl font-bold">{stats.totalRequestsToday || 0}</p>
                        <p className="text-xs text-muted-foreground">
                          ${(stats.totalCostToday || 0).toFixed(4)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">This Week</p>
                        <p className="text-2xl font-bold">{stats.totalRequestsThisWeek || 0}</p>
                        <p className="text-xs text-muted-foreground">
                          ${(stats.totalCostThisWeek || 0).toFixed(4)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">This Month</p>
                        <p className="text-2xl font-bold">{stats.totalRequestsThisMonth || 0}</p>
                        <p className="text-xs text-muted-foreground">
                          ${(stats.totalCostThisMonth || 0).toFixed(4)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">All Time</p>
                        <p className="text-2xl font-bold">{stats.totalRequests}</p>
                        <p className="text-xs text-muted-foreground">
                          ${stats.totalCost.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Analytics Tab */}
            {viewMode === 'analytics' && (
              <div className="grid gap-1.5 lg:grid-cols-2">
                {/* Usage by Feature */}
                <Card>
                  <CardHeader>
                    <CardTitle>Usage by Feature</CardTitle>
                    <CardDescription>Which features use AI most</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {featureChartData.length > 0 ? (
                      <div className="space-y-4">
                        {featureChartData.map((item, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{item.name}</span>
                              <span className="text-sm font-bold">{item.value}</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div
                                className="h-2 rounded-full transition-all"
                                style={{
                                  width: `${(item.value / stats.totalRequests) * 100}%`,
                                  backgroundColor: COLORS[index % COLORS.length]
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Usage by Type Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Type Breakdown</CardTitle>
                    <CardDescription>Distribution of interaction types</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {typeChartData.length > 0 ? (
                      <div className="space-y-3">
                        {typeChartData.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="text-sm font-medium">{item.name}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold">{item.value}</p>
                              <p className="text-xs text-muted-foreground">
                                {((item.value / stats.totalRequests) * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Logs Tab */}
            {viewMode === 'logs' && (
              <div className="space-y-4">
                {/* Filters */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                      </CardTitle>
                      {(filters.type !== 'all' || filters.feature !== 'all' || filters.success !== 'all' || filters.startDate || filters.endDate) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearFilters}
                          className="gap-2"
                        >
                          Clear All
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Type</label>
                        <Select
                          value={filters.type}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="api_call">API Call</SelectItem>
                            <SelectItem value="enhancement">Enhancement</SelectItem>
                            <SelectItem value="analysis">Analysis</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Feature</label>
                        <Select
                          value={filters.feature}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, feature: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Features</SelectItem>
                            <SelectItem value="recommendations">Recommendations</SelectItem>
                            <SelectItem value="chat">Chat</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select
                          value={filters.success}
                          onValueChange={(value) => setFilters(prev => ({ ...prev, success: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="success">Success</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Logs List */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Usage Logs</CardTitle>
                        <CardDescription>
                          {filteredLogs.length} of {logs.length} entries
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={sortBy}
                          onValueChange={setSortBy}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="timestamp">Date</SelectItem>
                            <SelectItem value="cost">Cost</SelectItem>
                            <SelectItem value="tokens">Tokens</SelectItem>
                            <SelectItem value="responseTime">Response Time</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                          title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                        >
                          {sortOrder === 'asc' ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : (
                            <ArrowDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {filteredLogs.length === 0 ? (
                      <div className="flex items-center justify-center py-12 text-muted-foreground">
                        No logs match the current filters
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          {paginatedLogs.map((log) => (
                          <div
                            key={log.id}
                            className={cn(
                              "rounded-lg border p-4 transition-all hover:shadow-md",
                              log.success 
                                ? "border-border/50 bg-card" 
                                : "border-destructive/50 bg-destructive/5"
                            )}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant={log.success ? "default" : "destructive"}>
                                    {log.success ? "Success" : "Failed"}
                                  </Badge>
                                  <Badge variant="outline">{log.type}</Badge>
                                  <Badge variant="outline">{log.feature}</Badge>
                                  <Badge variant="outline">{log.model}</Badge>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="text-xs text-muted-foreground">Tokens</p>
                                    <p className="font-semibold">{log.tokensUsed?.toLocaleString() || 0}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Cost</p>
                                    <p className="font-semibold">${(log.cost || 0).toFixed(4)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Response Time</p>
                                    <p className="font-semibold">{log.responseTime || 0}ms</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground">Date</p>
                                    <p className="font-semibold">
                                      {new Date(log.timestamp).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                {log.error && (
                                  <div className="rounded-md bg-destructive/10 p-2">
                                    <p className="text-xs font-medium text-destructive">Error:</p>
                                    <p className="text-xs text-destructive/80">{log.error}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        </div>
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between mt-4 pt-4 border-t">
                            <p className="text-sm text-muted-foreground">
                              Page {currentPage} of {totalPages}
                            </p>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                              >
                                Previous
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                              >
                                Next
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

