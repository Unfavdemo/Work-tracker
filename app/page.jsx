'use client'

import { WorkshopStats } from '@/components/workshop-stats'
import { CommunicationStats } from '@/components/communication-stats'
import { SchedulePanel } from '@/components/schedule-panel'
import { AiRecommendations } from '@/components/ai-recommendations'
import { ActivityFeed } from '@/components/activity-feed'
import { PerformanceMetrics } from '@/components/performance-metrics'
import { WorkshopList } from '@/components/workshop-list'
import { ExportPanel } from '@/components/export-panel'
import { DateRangePicker } from '@/components/date-range-picker'
import { ThemeToggle } from '@/components/theme-toggle'
import { Sparkles, TrendingUp, Activity, Search, Filter, FileText, Calendar, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { recentWorkshops, upcomingEvents, activityFeed, recommendations } from '@/lib/data'
import { cn } from '@/lib/utils'

export default function Page() {
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState('month')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef(null)
  const suggestionsRef = useRef(null)

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
    
    // Add activities
    activityFeed.forEach(activity => {
      if (activity.title.toLowerCase().includes(queryLower)) {
        suggestions.push({
          text: activity.title,
          category: 'Activity',
          icon: Clock,
          type: 'activity'
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

  const handleFilterClick = () => {
    toast.info('Opening filter options...', {
      description: 'Filter by type, status, date range, and more',
    })
  }

  const handleDateRangeChange = (range) => {
    setDateRange(range)
    toast.success(`Date range updated to ${range}`, {
      description: 'Data will be filtered accordingly',
    })
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-3 sm:p-4 lg:p-5">
      <div className="mx-auto max-w-[1800px] space-y-4 animate-in fade-in duration-700">
        {/* Enhanced Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
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
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm px-4 py-2 shadow-sm transition-all hover:border-accent/50 hover:shadow-md">
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md" ref={searchRef}>
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
                className="absolute top-full mt-2 w-full z-50 rounded-lg border border-border bg-card shadow-xl max-h-[300px] overflow-y-auto"
              >
                {suggestions.map((suggestion, index) => {
                  const Icon = suggestion.icon
                  return (
                    <button
                      key={`${suggestion.type}-${index}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                        "hover:bg-accent/10 hover:text-accent-foreground",
                        selectedIndex === index && "bg-accent/20 text-accent-foreground"
                      )}
                    >
                      <div className="rounded-lg bg-accent/10 p-1.5">
                        <Icon className="h-4 w-4 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-card-foreground">
                          {highlightText(suggestion.text, searchQuery)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {suggestion.category}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <DateRangePicker onRangeChange={handleDateRangeChange} />
            <Button variant="outline" className="gap-2" onClick={handleFilterClick}>
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid gap-2 sm:grid-cols-4">
          <div className="group rounded-lg border-2 border-border/60 bg-gradient-to-br from-card to-card/80 p-3 backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-accent hover:shadow-xl">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/20 p-2 shadow-sm">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Active Workshops</p>
                <p className="text-xl font-bold text-foreground">12</p>
              </div>
            </div>
          </div>
          <div className="group rounded-lg border-2 border-border/60 bg-gradient-to-br from-card to-card/80 p-3 backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-chart-1 hover:shadow-xl">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-chart-1/20 p-2 shadow-sm">
                <TrendingUp className="h-4 w-4 text-chart-1" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">This Week</p>
                <p className="text-xl font-bold text-foreground">+18%</p>
              </div>
            </div>
          </div>
          <div className="group rounded-lg border-2 border-border/60 bg-gradient-to-br from-card to-card/80 p-3 backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-chart-2 hover:shadow-xl">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-chart-2/20 p-2 shadow-sm">
                <Sparkles className="h-4 w-4 text-chart-2" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">AI Efficiency</p>
                <p className="text-xl font-bold text-foreground">92%</p>
              </div>
            </div>
          </div>
          <div className="group rounded-lg border-2 border-border/60 bg-gradient-to-br from-card to-card/80 p-3 backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-accent hover:shadow-xl">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-accent/20 p-2 shadow-sm">
                <Activity className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Total Students</p>
                <p className="text-xl font-bold text-foreground">1,247</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid with improved animations */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Workshop Stats - Takes 2 columns */}
          <div className="lg:col-span-2 animate-in slide-in-from-left duration-500">
            <WorkshopStats />
          </div>

          {/* AI Recommendations and Export - Takes 1 column */}
          <div className="lg:col-span-1 space-y-4 animate-in slide-in-from-right duration-500">
            <AiRecommendations searchQuery={searchQuery} />
            <ExportPanel />
          </div>

          {/* Communication Stats - Takes 2 columns */}
          <div className="lg:col-span-2 animate-in slide-in-from-left duration-700 delay-100">
            <CommunicationStats />
          </div>

          {/* Schedule Panel */}
          <div className="lg:col-span-1 animate-in slide-in-from-right duration-700 delay-100">
            <SchedulePanel searchQuery={searchQuery} />
          </div>

          {/* Performance Metrics - Full width */}
          <div className="lg:col-span-3 animate-in fade-in duration-700 delay-200">
            <PerformanceMetrics />
          </div>

          {/* Workshop List - Takes 2 columns */}
          <div className="lg:col-span-2 animate-in slide-in-from-left duration-700 delay-300">
            <WorkshopList searchQuery={searchQuery} />
          </div>

          {/* Activity Feed - Takes 1 column */}
          <div className="lg:col-span-1 animate-in slide-in-from-right duration-700 delay-300">
            <ActivityFeed searchQuery={searchQuery} />
          </div>
        </div>
      </div>
    </div>
  )
}

