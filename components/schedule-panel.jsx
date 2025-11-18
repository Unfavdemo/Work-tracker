'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, Plus, MoreVertical, Loader2, LogIn, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { upcomingEvents } from '@/lib/data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'

export function SchedulePanel({ searchQuery = '' }) {
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  // Check for stored access token on mount and handle URL-based auth
  useEffect(() => {
    // Check for token in URL (fallback for OAuth callback)
    const urlParams = new URLSearchParams(window.location.search)
    const tokenFromUrl = urlParams.get('token')
    if (tokenFromUrl) {
      localStorage.setItem('google_calendar_token', tokenFromUrl)
      setIsAuthenticated(true)
      fetchCalendarEvents(tokenFromUrl)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
      return
    }

    // Check for stored token
    const token = localStorage.getItem('google_calendar_token')
    if (token) {
      setIsAuthenticated(true)
      fetchCalendarEvents(token)
    }
  }, [])

  // Fetch events from Google Calendar
  const fetchCalendarEvents = async (token) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/calendar/events', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Calendar events fetched:', data.events?.length || 0, 'events')
        setEvents(data.events || [])
        
        if (!data.events || data.events.length === 0) {
          toast.info('No calendar events found', {
            description: 'Your calendar is synced, but there are no upcoming events.',
          })
        }
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('google_calendar_token')
        setIsAuthenticated(false)
        toast.error('Authentication expired', {
          description: 'Please reconnect your Google Calendar',
        })
      } else {
        // Get error details from response
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Server error: ${response.status}`
        console.error('Failed to fetch events:', response.status, errorMessage)
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error)
      toast.error('Failed to load calendar events', {
        description: error.message || 'Please check your connection and try again.',
      })
      // Don't fallback to static data - show empty state instead
      setEvents([])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Google Calendar authentication
  const handleConnectCalendar = async () => {
    setIsConnecting(true)
    try {
      const response = await fetch('/api/calendar/auth?action=url')
      const data = await response.json()
      
      if (data.authUrl) {
        // Open OAuth popup
        const width = 500
        const height = 600
        const left = window.screenX + (window.outerWidth - width) / 2
        const top = window.screenY + (window.outerHeight - height) / 2
        
        const popup = window.open(
          data.authUrl,
          'Google Calendar Auth',
          `width=${width},height=${height},left=${left},top=${top}`
        )

        // Listen for OAuth callback
        const checkPopup = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkPopup)
            setIsConnecting(false)
          }
        }, 1000)

        // Listen for message from popup (if using postMessage)
        window.addEventListener('message', (event) => {
          if (event.data.type === 'GOOGLE_CALENDAR_AUTH_SUCCESS') {
            const { accessToken } = event.data
            localStorage.setItem('google_calendar_token', accessToken)
            setIsAuthenticated(true)
            fetchCalendarEvents(accessToken)
            popup?.close()
            clearInterval(checkPopup)
            setIsConnecting(false)
            toast.success('Google Calendar connected!', {
              description: 'Your calendar events are now synced',
            })
          }
        }, { once: true })
      }
    } catch (error) {
      console.error('Error connecting calendar:', error)
      toast.error('Failed to connect Google Calendar', {
        description: error.message,
      })
      setIsConnecting(false)
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    const token = localStorage.getItem('google_calendar_token')
    if (token) {
      fetchCalendarEvents(token)
    }
  }

  // Filter events based on search query
  const filteredEvents = events.filter(event => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      event.title.toLowerCase().includes(query) ||
      event.type.toLowerCase().includes(query) ||
      event.status.toLowerCase().includes(query) ||
      event.date.toLowerCase().includes(query) ||
      event.time.toLowerCase().includes(query)
    )
  })

  const handleAddEvent = () => {
    if (!isAuthenticated) {
      toast.info('Connect Google Calendar', {
        description: 'Please connect your Google Calendar to add events',
      })
      handleConnectCalendar()
      return
    }
    toast.info('Add New Event', {
      description: 'Event creation form would open here',
    })
  }

  const handleMenuClick = (action) => {
    toast.info(`${action} menu`, {
      description: 'Additional options would appear here',
    })
  }
  return (
    <Card className="group border-2 border-border/70 bg-card transition-all duration-500 hover:border-accent hover:shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-card-foreground">Schedule</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              {isAuthenticated ? 'Google Calendar events' : 'Upcoming workshops and sessions'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleAddEvent}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleMenuClick('Schedule')}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <div className="rounded-full bg-accent/10 p-4">
              <Calendar className="h-8 w-8 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Connect Google Calendar</p>
              <p className="text-xs text-muted-foreground mt-1">
                Sync your calendar events to see them here
              </p>
            </div>
            <Button 
              onClick={handleConnectCalendar}
              disabled={isConnecting}
              className="gap-2"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Connect Google Calendar
                </>
              )}
            </Button>
            {/* Fallback: Show static events */}
            {upcomingEvents.length > 0 && (
              <div className="w-full pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-2">Sample events (connect to see your calendar)</p>
                {upcomingEvents.slice(0, 3).map((event, index) => (
                  <div 
                    key={event.id}
                    className="group relative overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-secondary/60 to-secondary/30 p-3 mb-2 transition-all duration-500 hover:scale-[1.02] hover:border-accent/50 hover:bg-secondary/80 hover:shadow-lg"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="relative flex items-start gap-2">
                      <div className="rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 p-2 shadow-md transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-accent/30">
                        <Calendar className="h-3.5 w-3.5 text-accent" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-secondary-foreground transition-colors group-hover:text-foreground">
                            {event.title}
                          </p>
                          <Badge 
                            variant={event.status === 'upcoming' ? 'default' : 'secondary'}
                            className={cn(
                              "text-xs font-medium transition-all duration-300 shrink-0",
                              event.status === 'upcoming' && "animate-pulse bg-accent/20 text-accent border-accent/30"
                            )}
                          >
                            {event.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className="font-medium">{event.time}</span>
                          </div>
                          <span>•</span>
                          <span>{event.date}</span>
                          <span>•</span>
                          <span className="capitalize">{event.type}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-accent mb-2" />
            <p className="text-sm font-medium text-muted-foreground">Loading calendar events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm font-medium text-muted-foreground">No events found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {searchQuery ? 'Try a different search term' : 'No upcoming events in your calendar'}
            </p>
          </div>
        ) : (
          <>
            {filteredEvents.map((event, index) => (
          <div 
            key={event.id}
            className="group relative overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-secondary/60 to-secondary/30 p-3 transition-all duration-500 hover:scale-[1.02] hover:border-accent/50 hover:bg-secondary/80 hover:shadow-lg"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative flex items-start gap-2">
              <div className="rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 p-2 shadow-md transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-accent/30">
                <Calendar className="h-3.5 w-3.5 text-accent" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-secondary-foreground transition-colors group-hover:text-foreground">
                    {event.title}
                  </p>
                  <Badge 
                    variant={event.status === 'upcoming' ? 'default' : 'secondary'}
                    className={cn(
                      "text-xs font-medium transition-all duration-300 shrink-0",
                      event.status === 'upcoming' && "animate-pulse bg-accent/20 text-accent border-accent/30"
                    )}
                  >
                    {event.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span className="font-medium">{event.time}</span>
                  </div>
                  <span>•</span>
                  <span>{event.date}</span>
                  <span>•</span>
                  <span className="capitalize">{event.type}</span>
                </div>
                {event.location && (
                  <p className="text-xs text-muted-foreground truncate">{event.location}</p>
                )}
              </div>
            </div>
          </div>
            ))}
          </>
        )}
        {isAuthenticated && (
          <Button 
            variant="outline" 
            className="w-full mt-4 border-dashed border-2 hover:border-accent/50 hover:bg-accent/5 transition-all"
            onClick={handleAddEvent}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Event
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

