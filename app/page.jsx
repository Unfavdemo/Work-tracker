'use client'

import { WorkshopStats } from '@/components/workshop-stats'
import { CommunicationStats } from '@/components/communication-stats'
import { SchedulePanel } from '@/components/schedule-panel'
import { EmailTracker } from '@/components/email-tracker'
import { AiRecommendations } from '@/components/ai-recommendations'
import { PerformanceMetrics } from '@/components/performance-metrics'
import { WorkshopList } from '@/components/workshop-list'
import { ExportPanel } from '@/components/export-panel'
import { CaseNotes } from '@/components/case-notes'
import { DateRangePicker } from '@/components/date-range-picker'
import { ThemeToggle } from '@/components/theme-toggle'
import { TimeTracker } from '@/components/time-tracker'
import { WorkshopCreator } from '@/components/workshop-creator'
import { AIUsageTracker } from '@/components/ai-usage-tracker'
import { StudentFeedbackManager } from '@/components/student-feedback-manager'
import { StudentCalendarManager } from '@/components/student-calendar-manager'
import { Sparkles, TrendingUp, Activity, Search, Filter, FileText, Calendar, Clock, Download, Settings } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { recentWorkshops, upcomingEvents, recommendations } from '@/lib/data'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Page() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState('month')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef(null)
  const suggestionsRef = useRef(null)
  
  // Quick stats state
  const [quickStats, setQuickStats] = useState({
    activeWorkshops: 0,
    weeklyGrowth: 0,
    aiEfficiency: 0,
    isLoading: true
  })
  
  // State to trigger refresh across components
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Generate search suggestions from all data
  const generateSuggestions = (query) => {
    if (!query.trim() || query.length < 1) return []
    
    const queryLower = query.toLowerCase()
    const suggestions = []
    
    // Add workshops
    recentWorkshops.forEach(workshop => {
      if (workshop.title.toLowerCase().includes(queryLower)) {
        suggestions.push({
          text: workshop.title,
          category: 'Workshop',
          icon: FileText,
          type: 'workshop'
        })
      }
    })
    
    // Add events
    upcomingEvents.forEach(event => {
      if (event.title.toLowerCase().includes(queryLower)) {
        suggestions.push({
          text: event.title,
          category: 'Event',
          icon: Calendar,
          type: 'event'
        })
      }
    })
    
    // Add recommendations
    recommendations.forEach(rec => {
      if (rec.title.toLowerCase().includes(queryLower)) {
        suggestions.push({
          text: rec.title,
          category: 'Recommendation',
          icon: Search,
          type: 'recommendation'
        })
      }
    })
    
    // Remove duplicates and limit to 8
    const unique = suggestions.filter((s, index, self) => 
      index === self.findIndex(t => t.text === s.text)
    )
    
    return unique.slice(0, 8)
  }

  const suggestions = generateSuggestions(searchQuery)

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    setShowSuggestions(value.trim().length > 0)
    setSelectedIndex(-1)
  }

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.text)
    setShowSuggestions(false)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      handleSuggestionClick(suggestions[selectedIndex])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setSelectedIndex(-1)
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchQuickStats = useCallback(async () => {
    try {
      // Get Google Calendar token if available
      const calendarToken = localStorage.getItem('google_token') || localStorage.getItem('google_calendar_token')
      const headers = calendarToken ? {
        'Authorization': `Bearer ${calendarToken}`
      } : {}

      // Fetch workshop stats and AI usage stats in parallel
      const [workshopResponse, aiResponse] = await Promise.all([
        fetch('/api/workshops/stats', { headers }).catch(() => null),
        fetch('/api/ai-usage/stats?startDate=' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]).catch(() => null)
      ])

      let activeWorkshops = 0
      let weeklyGrowth = 0
      let aiEfficiency = 0

      // Process workshop stats
      if (workshopResponse?.ok) {
        const workshopData = await workshopResponse.json()
        if (workshopData.stats?.workshopStats) {
          const stats = workshopData.stats.workshopStats
          // Active workshops = in progress + completed
          activeWorkshops = (stats.inProgress || 0) + (stats.completed || 0)
          
          // Calculate weekly growth from workshops created trend
          if (workshopData.stats.workshopsCreated?.trend !== undefined) {
            weeklyGrowth = workshopData.stats.workshopsCreated.trend
          }
        }
      }

      // Process AI usage stats
      if (aiResponse?.ok) {
        const aiData = await aiResponse.json()
        if (aiData.stats) {
          // Use successRate from AI stats (already a percentage)
          aiEfficiency = Math.round(aiData.stats.successRate || 0)
        }
      }

      setQuickStats({
        activeWorkshops,
        weeklyGrowth,
        aiEfficiency,
        isLoading: false
      })
    } catch (error) {
      console.error('Error fetching quick stats:', error)
      setQuickStats(prev => ({ ...prev, isLoading: false }))
    }
  }, [])
  
  // Fetch quick stats
  useEffect(() => {
    fetchQuickStats()
    // Refresh every 30 seconds
    const interval = setInterval(fetchQuickStats, 30000)
    return () => clearInterval(interval)
  }, [fetchQuickStats, refreshTrigger])
  
  // Listen for storage events to trigger refresh when workshops are added/updated
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'workshop_updated' || e.key === 'workshop_created') {
        setRefreshTrigger(prev => prev + 1)
        // Clear the trigger after using it
        localStorage.removeItem(e.key)
      } else if (e.key === 'ai_stats_updated') {
        // Update AI efficiency from AI tracker
        const aiEfficiency = parseInt(localStorage.getItem('ai_efficiency') || '0', 10)
        setQuickStats(prev => ({
          ...prev,
          aiEfficiency,
        }))
        localStorage.removeItem('ai_stats_updated')
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    // Also listen for custom events
    const handleWorkshopUpdate = () => {
      setRefreshTrigger(prev => prev + 1)
    }
    window.addEventListener('workshopUpdated', handleWorkshopUpdate)
    
    // Listen for AI stats updates from AI tracker component
    const handleAIStatsUpdate = (event) => {
      const { aiEfficiency } = event.detail
      setQuickStats(prev => {
        // Only update if value actually changed
        if (prev.aiEfficiency !== aiEfficiency) {
          if (process.env.NODE_ENV === 'development') {
            console.log('📊 Dashboard: Received AI efficiency update:', aiEfficiency + '%')
          }
          return {
            ...prev,
            aiEfficiency,
          }
        }
        return prev
      })
    }
    window.addEventListener('aiStatsUpdated', handleAIStatsUpdate)
    
    // Also check localStorage on mount in case AI tracker already loaded
    const checkInitialAIEfficiency = () => {
      const storedEfficiency = localStorage.getItem('ai_efficiency')
      if (storedEfficiency) {
        const efficiency = parseInt(storedEfficiency, 10)
        setQuickStats(prev => ({
          ...prev,
          aiEfficiency: efficiency,
        }))
        if (process.env.NODE_ENV === 'development') {
          console.log('📊 Dashboard: Loaded initial AI efficiency from storage:', efficiency + '%')
        }
      }
    }
    checkInitialAIEfficiency()
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('workshopUpdated', handleWorkshopUpdate)
      window.removeEventListener('aiStatsUpdated', handleAIStatsUpdate)
    }
  }, [])

  // Highlight matching text
  const highlightText = (text, query) => {
    if (!query.trim()) return text
    // Escape special regex characters
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'))
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-accent/30 text-accent-foreground font-medium px-0.5 rounded">
          {part}
        </mark>
      ) : part
    )
  }

  const [showFilterMenu, setShowFilterMenu] = useState(false)
  
  const handleFilterClick = () => {
    setShowFilterMenu(!showFilterMenu)
  }
  
  const handleFilterChange = (filterType) => {
    // This would filter the dashboard data
    toast.success(`Filter applied: ${filterType}`)
    setShowFilterMenu(false)
  }

  const handleDateRangeChange = (range) => {
    setDateRange(range)
    toast.success(`Date range updated to ${range}`, {
      description: 'Data will be filtered accordingly',
    })
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full h-full space-y-6 animate-in fade-in duration-700">
        {/* Enhanced Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-4 flex-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/settings')}
                className="h-9 w-9 rounded-lg hover:bg-accent/10"
                title="Settings"
              >
                <Settings className="h-5 w-5 text-muted-foreground hover:text-accent transition-colors" />
              </Button>
              <div className="rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 p-2.5 shadow-lg">
                <Sparkles className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Taheera's Workshop Tracker
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Monitor workshop creation, student communication, and AI usage
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm px-6 py-3 shadow-sm transition-all hover:border-accent/50 hover:shadow-md">
              <div className="relative">
                <div className="absolute h-2 w-2 animate-ping rounded-full bg-accent opacity-75" />
                <div className="relative h-2 w-2 rounded-full bg-accent" />
              </div>
              <span className="text-sm font-medium text-card-foreground">Live</span>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between w-full">
          <div className="relative flex-1 w-full" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
            <Input
              placeholder="Search workshops, events, or activities..."
              className="pl-10 bg-card border-border/50"
              value={searchQuery}
              onChange={handleSearch}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute top-full mt-3 w-full z-50 rounded-lg border border-border bg-card shadow-xl max-h-[400px] overflow-y-auto"
              >
                {suggestions.map((suggestion, index) => {
                  const Icon = suggestion.icon
                  return (
                    <button
                      key={`${suggestion.type}-${index}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={cn(
                        "w-full flex items-center gap-4 px-5 py-4 text-left transition-colors",
                        "hover:bg-accent/10 hover:text-accent-foreground",
                        selectedIndex === index && "bg-accent/20 text-accent-foreground"
                      )}
                    >
                      <div className="rounded-lg bg-accent/10 p-2">
                        <Icon className="h-5 w-5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-medium text-card-foreground">
                          {highlightText(suggestion.text, searchQuery)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {suggestion.category}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <DateRangePicker onRangeChange={handleDateRangeChange} />
            <DropdownMenu open={showFilterMenu} onOpenChange={setShowFilterMenu}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="lg" className="gap-2 h-12 px-6">
                  <Filter className="h-5 w-5" />
                  Filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter Dashboard</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleFilterChange('All')}>
                  All Data
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange('Workshops')}>
                  Workshops Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange('Communication')}>
                  Communication Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange('AI Usage')}>
                  AI Usage Only
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  const exportData = JSON.stringify({ 
                    quickStats, 
                    exportedAt: new Date().toISOString() 
                  }, null, 2)
                  const blob = new Blob([exportData], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `dashboard-${new Date().toISOString().split('T')[0]}.json`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                  toast.success('Dashboard data exported!')
                }}>
                  <Download className="mr-2 h-5 w-5" />
                  Export Dashboard
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid gap-4 sm:grid-cols-3 w-full">
          <div className="group rounded-xl border-2 border-border/60 bg-gradient-to-br from-card to-card/80 p-6 backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-accent hover:shadow-xl w-full h-full flex flex-col">
            <div className="flex items-center gap-4 flex-1">
              <div className="rounded-lg bg-primary/20 p-2 shadow-sm">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Active Workshops</p>
                {quickStats.isLoading ? (
                  <p className="text-xl font-bold text-foreground">...</p>
                ) : (
                  <p className="text-xl font-bold text-foreground">{quickStats.activeWorkshops}</p>
                )}
              </div>
            </div>
          </div>
          <div className="group rounded-xl border-2 border-border/60 bg-gradient-to-br from-card to-card/80 p-6 backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-chart-1 hover:shadow-xl w-full h-full flex flex-col">
            <div className="flex items-center gap-4 flex-1">
              <div className="rounded-lg bg-chart-1/20 p-3 shadow-sm">
                <TrendingUp className="h-6 w-6 text-chart-1" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                {quickStats.isLoading ? (
                  <p className="text-3xl font-bold text-foreground">...</p>
                ) : (
                  <p className={cn(
                    "text-3xl font-bold",
                    quickStats.weeklyGrowth >= 0 ? "text-green-400" : "text-red-400"
                  )}>
                    {quickStats.weeklyGrowth >= 0 ? '+' : ''}{quickStats.weeklyGrowth}%
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="group rounded-xl border-2 border-border/60 bg-gradient-to-br from-card to-card/80 p-6 backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-chart-2 hover:shadow-xl w-full h-full flex flex-col">
            <div className="flex items-center gap-4 flex-1">
              <div className="rounded-lg bg-chart-2/20 p-2 shadow-sm">
                <Sparkles className="h-4 w-4 text-chart-2" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">AI Efficiency</p>
                {quickStats.isLoading ? (
                  <p className="text-xl font-bold text-foreground">...</p>
                ) : (
                  <p className="text-xl font-bold text-foreground">{quickStats.aiEfficiency}%</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid with improved animations */}
        <div className="grid gap-6 lg:grid-cols-3 w-full">
          {/* Workshop Stats - Takes 2 columns */}
          <div className="lg:col-span-2 animate-in slide-in-from-left duration-500 w-full h-full flex">
            <div className="w-full h-full">
              <WorkshopStats />
            </div>
          </div>

          {/* Schedule Panel - Takes 1 column (moved up) */}
          <div className="lg:col-span-1 animate-in slide-in-from-right duration-500 w-full h-full flex">
            <div className="w-full h-full">
              <SchedulePanel searchQuery={searchQuery} />
            </div>
          </div>

          {/* AI Recommendations and Export - Takes 1 column */}
          <div className="lg:col-span-1 space-y-6 animate-in slide-in-from-right duration-500 delay-50 w-full h-full flex flex-col">
            <div className="flex-1 w-full">
              <TimeTracker />
            </div>
            <div className="flex-1 w-full">
              <AiRecommendations searchQuery={searchQuery} />
            </div>
            <div className="flex-1 w-full">
              <ExportPanel />
            </div>
          </div>

          {/* Workshop Creator - Under Workshop Stats */}
          <div className="lg:col-span-2 animate-in slide-in-from-left duration-500 delay-50 w-full h-full flex">
            <div className="w-full h-full">
              <WorkshopCreator />
            </div>
          </div>

          {/* Case Notes - Under Workshop Creator */}
          <div className="lg:col-span-2 animate-in slide-in-from-left duration-500 delay-75 w-full h-full flex">
            <div className="w-full h-full">
              <CaseNotes />
            </div>
          </div>

          {/* Communication Stats - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6 animate-in slide-in-from-left duration-700 delay-100 w-full h-full flex flex-col">
            <div className="flex-1 w-full">
              <CommunicationStats />
            </div>
            {/* AI Usage Tracker - Under Student Communication */}
            <div className="flex-1 w-full animate-in fade-in duration-700 delay-150">
              <AIUsageTracker />
            </div>
          </div>

          {/* Email Tracker - Takes 1 column */}
          <div className="lg:col-span-1 animate-in slide-in-from-right duration-700 delay-100 w-full h-full flex">
            <div className="w-full h-full">
              <EmailTracker />
            </div>
          </div>

          {/* Performance Metrics - Full width */}
          <div className="lg:col-span-3 animate-in fade-in duration-700 delay-200 w-full h-full flex">
            <div className="w-full h-full">
              <PerformanceMetrics />
            </div>
          </div>

          {/* Workshop List - Takes 2 columns */}
          <div className="lg:col-span-2 animate-in slide-in-from-left duration-700 delay-250 w-full h-full flex">
            <div className="w-full h-full">
              <WorkshopList searchQuery={searchQuery} />
            </div>
          </div>

          {/* Student Feedback Manager - Takes 2 columns */}
          <div className="lg:col-span-2 animate-in slide-in-from-left duration-700 delay-300 w-full h-full flex">
            <div className="w-full h-full">
              <StudentFeedbackManager />
            </div>
          </div>

          {/* Student Calendar Manager - Takes 1 column */}
          <div className="lg:col-span-1 animate-in slide-in-from-right duration-700 delay-300 w-full h-full flex">
            <div className="w-full h-full">
              <StudentCalendarManager />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

