'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, Plus, MoreVertical, Loader2, LogIn, RefreshCw, Download, Settings, CheckCircle2, XCircle, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { upcomingEvents } from '@/lib/data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
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

export function SchedulePanel({ searchQuery = '' }) {
  const router = useRouter()
  const [events, setEvents] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPending, setIsLoadingPending] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [processingRequest, setProcessingRequest] = useState(null)
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  })

  // Check for stored access token on mount and handle URL-based auth
  useEffect(() => {
    // Check for token in URL (fallback for OAuth callback)
    const urlParams = new URLSearchParams(window.location.search)
    const tokenFromUrl = urlParams.get('token')
    const googleAuthSuccess = urlParams.get('google_auth_success')
    
    if (googleAuthSuccess === 'true' && tokenFromUrl) {
      localStorage.setItem('google_token', tokenFromUrl)
      // Also migrate old tokens for backward compatibility
      localStorage.setItem('google_calendar_token', tokenFromUrl)
      
      // Store token server-side for student calendar submissions
      const storeToken = async () => {
        try {
          await fetch('/api/calendar/store-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: tokenFromUrl }),
          })
        } catch (error) {
          console.warn('Failed to store token server-side:', error)
          // Continue anyway - token is still in localStorage
        }
      }
      storeToken()
      
      setIsAuthenticated(true)
      fetchCalendarEvents(tokenFromUrl)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
      return
    }

    // Check for unified token first, then fallback to old token for migration
    let token = localStorage.getItem('google_token')
    if (!token) {
      token = localStorage.getItem('google_calendar_token')
      // Migrate old token to unified token
      if (token) {
        localStorage.setItem('google_token', token)
      }
    }
    
    if (token) {
      setIsAuthenticated(true)
      fetchCalendarEvents(token)
    }
    
    // Fetch pending calendar requests
    fetchPendingRequests()
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
      } else if (response.status === 401 || response.status === 403) {
        // Token expired or invalid
        localStorage.removeItem('google_token')
        localStorage.removeItem('google_calendar_token')
        setIsAuthenticated(false)
        toast.error('Authentication expired', {
          description: 'Please reconnect your Google services',
        })
      } else {
        // Get error details from response
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Server error: ${response.status}`
        const errorType = errorData.type || 'unknown'
        console.error('Failed to fetch events:', response.status, errorMessage)
        
        // Check if it's an authentication error
        if (errorType === 'authentication' || 
            errorMessage.includes('invalid authentication') || 
            errorMessage.includes('Invalid or expired authentication token') ||
            errorMessage.includes('authentication credential') ||
            errorMessage.includes('OAuth 2')) {
          localStorage.removeItem('google_token')
          localStorage.removeItem('google_calendar_token')
          setIsAuthenticated(false)
          toast.error('Authentication failed', {
            description: 'Please reconnect your Google services to get a new token.',
            duration: 5000,
          })
        } else if (errorType === 'network' || errorMessage.includes('Network error') || 
                   errorMessage.includes('Unable to connect')) {
          toast.error('Network error', {
            description: 'Unable to connect to Google Calendar. Please check your internet connection and try again.',
            duration: 5000,
          })
        } else {
          toast.error('Failed to load calendar events', {
            description: errorMessage,
          })
        }
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

  // Handle Google services authentication (unified)
  const handleConnectCalendar = async () => {
    setIsConnecting(true)
    try {
      const response = await fetch('/api/google/auth?action=url')
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.requiresConfig) {
        toast.error('Google OAuth not configured', {
          description: data.message || 'Please configure your Google OAuth credentials.',
          duration: 6000,
        })
        setIsConnecting(false)
        return
      }
      
      if (!data.authUrl) {
        throw new Error(data.error || 'No authentication URL received from server')
      }
      
      // Open OAuth popup
      const width = 500
      const height = 600
      const left = window.screenX + (window.outerWidth - width) / 2
      const top = window.screenY + (window.outerHeight - height) / 2
      
      const popup = window.open(
        data.authUrl,
        'Google Services Auth',
        `width=${width},height=${height},left=${left},top=${top}`
      )

      // Check if popup was blocked
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        setIsConnecting(false)
        toast.error('Popup blocked', {
          description: 'Please allow popups for this site and try again',
        })
        return
      }

      // Declare timeout variable so it can be cleared in message handler
      let timeout
      let messageReceived = false

      // Listen for message from popup (if using postMessage)
      const messageHandler = (event) => {
        // Verify message origin for security
        const allowedOrigin = window.location.origin
        if (event.origin !== allowedOrigin) {
          return // Ignore messages from other origins
        }
        
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          messageReceived = true
          const { accessToken, services } = event.data
          // Store unified token
          localStorage.setItem('google_token', accessToken)
          // Also store for backward compatibility
          localStorage.setItem('google_calendar_token', accessToken)
          localStorage.setItem('gmail_token', accessToken)
          
          // Store token server-side for student calendar submissions
          const storeToken = async () => {
            try {
              await fetch('/api/calendar/store-token', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: accessToken }),
              })
            } catch (error) {
              console.warn('Failed to store token server-side:', error)
              // Continue anyway - token is still in localStorage
            }
          }
          storeToken()
          
          setIsAuthenticated(true)
          fetchCalendarEvents(accessToken)
          try {
            popup?.close()
          } catch (error) {
            // Popup might already be closed or blocked by COOP
          }
          clearTimeout(timeout)
          setIsConnecting(false)
          window.removeEventListener('message', messageHandler)
          
          const serviceList = services ? services.join(', ') : 'Calendar, Gmail, Drive, and Docs'
          toast.success('Google Services Connected!', {
            description: `${serviceList} are now connected and ready to use`,
            duration: 5000,
          })
          // Trigger refresh event for other components
          window.dispatchEvent(new Event('googleAuthUpdated'))
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          messageReceived = true
          clearTimeout(timeout)
          setIsConnecting(false)
          window.removeEventListener('message', messageHandler)
          toast.error('Authentication Failed', {
            description: event.data.error || 'Please try again',
          })
        }
      }
      window.addEventListener('message', messageHandler)
      
      // Set a maximum timeout to clean up if popup doesn't respond
      timeout = setTimeout(() => {
        if (!messageReceived) {
          setIsConnecting(false)
          window.removeEventListener('message', messageHandler)
          try {
            popup?.close()
          } catch (error) {
            // Popup might already be closed
          }
          toast.error('Authentication timeout', {
            description: 'Please try connecting again',
          })
        }
      }, 5 * 60 * 1000) // 5 minutes timeout
    } catch (error) {
      console.error('Error connecting Google services:', error)
      toast.error('Failed to connect Google services', {
        description: error.message,
      })
      setIsConnecting(false)
    }
  }

  // Fetch pending calendar requests
  const fetchPendingRequests = async () => {
    setIsLoadingPending(true)
    try {
      const response = await fetch('/api/student-calendar?status=pending')
      if (response.ok) {
        const data = await response.json()
        setPendingRequests(data.events || [])
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error)
    } finally {
      setIsLoadingPending(false)
    }
  }

  // Handle approve/disapprove
  const handleApproveRequest = async (requestId) => {
    setProcessingRequest(requestId)
    try {
      const token = localStorage.getItem('google_token') || localStorage.getItem('google_calendar_token')
      if (!token) {
        toast.error('Not authenticated', {
          description: 'Please connect your Google Calendar first',
        })
        return
      }

      const response = await fetch('/api/student-calendar', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: requestId,
          status: 'approved',
          accessToken: token,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Event approved', {
          description: 'The event has been added to your calendar',
        })
        // Refresh both lists
        fetchPendingRequests()
        if (isAuthenticated) {
          fetchCalendarEvents(token)
        }
        // Trigger refresh for student calendar manager
        window.dispatchEvent(new Event('calendarEventUpdated'))
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to approve event')
      }
    } catch (error) {
      console.error('Error approving request:', error)
      toast.error('Failed to approve event', {
        description: error.message || 'Please try again',
      })
    } finally {
      setProcessingRequest(null)
    }
  }

  const handleDisapproveRequest = async (requestId) => {
    setProcessingRequest(requestId)
    try {
      const response = await fetch('/api/student-calendar', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: requestId,
          status: 'disapproved',
        }),
      })

      if (response.ok) {
        toast.success('Event request rejected', {
          description: 'The event request has been declined',
        })
        // Refresh pending requests
        fetchPendingRequests()
        // Trigger refresh for student calendar manager
        window.dispatchEvent(new Event('calendarEventUpdated'))
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to reject event')
      }
    } catch (error) {
      console.error('Error disapproving request:', error)
      toast.error('Failed to reject event', {
        description: error.message || 'Please try again',
      })
    } finally {
      setProcessingRequest(null)
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    const token = localStorage.getItem('google_token') || localStorage.getItem('google_calendar_token')
    if (token) {
      fetchCalendarEvents(token)
    }
    fetchPendingRequests()
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
    // Set default values for today and next hour
    const now = new Date()
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
    
    const formatDate = (date) => date.toISOString().split('T')[0]
    const formatTime = (date) => date.toTimeString().slice(0, 5)
    
    setEventForm({
      title: '',
      description: '',
      location: '',
      startDate: formatDate(now),
      startTime: formatTime(now),
      endDate: formatDate(oneHourLater),
      endTime: formatTime(oneHourLater),
    })
    setIsDialogOpen(true)
  }

  const handleCreateEvent = async () => {
    if (!eventForm.title || !eventForm.startDate || !eventForm.startTime || !eventForm.endDate || !eventForm.endTime) {
      toast.error('Missing required fields', {
        description: 'Please fill in all required fields (title, start date/time, end date/time)',
      })
      return
    }

    setIsCreating(true)
    try {
      const token = localStorage.getItem('google_token') || localStorage.getItem('google_calendar_token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      // Format dates for Google Calendar API (ISO 8601 format)
      const startDateTime = new Date(`${eventForm.startDate}T${eventForm.startTime}`)
      const endDateTime = new Date(`${eventForm.endDate}T${eventForm.endTime}`)

      // Validate dates
      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        throw new Error('Invalid date or time format')
      }

      if (endDateTime <= startDateTime) {
        throw new Error('End time must be after start time')
      }

      const response = await fetch('/api/calendar/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: eventForm.title,
          description: eventForm.description || '',
          location: eventForm.location || '',
          start: startDateTime.toISOString(),
          end: endDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to create event')
      }

      const data = await response.json()
      
      toast.success('Event created successfully!', {
        description: `"${eventForm.title}" has been added to your calendar`,
      })

      // Reset form
      setEventForm({
        title: '',
        description: '',
        location: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
      })
      setIsDialogOpen(false)

      // Refresh events list
      fetchCalendarEvents(token)
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error('Failed to create event', {
        description: error.message || 'Please try again',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleExport = () => {
    const exportData = JSON.stringify(events, null, 2)
    const blob = new Blob([exportData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `schedule-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Schedule exported!')
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { handleRefresh(); toast.success('Schedule refreshed!') }}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Schedule
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {/* Pending Calendar Requests */}
        {pendingRequests.length > 0 && (
          <div className="mb-4 pb-4 border-b border-border/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Pending Requests ({pendingRequests.length})
              </p>
            </div>
            <div className="space-y-2">
              {pendingRequests.map((request) => {
                const startDate = new Date(request.start)
                const endDate = new Date(request.end)
                const isProcessing = processingRequest === request.id
                
                return (
                  <div
                    key={request.id}
                    className="group relative overflow-hidden rounded-lg border-2 border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 p-3 transition-all duration-300 hover:border-yellow-500/50 hover:shadow-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-yellow-500/20 p-2 flex-shrink-0">
                        <User className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-card-foreground truncate">
                              {request.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Requested by: <span className="font-medium">{request.studentName}</span>
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30 shrink-0">
                            Pending
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{startDate.toLocaleDateString()}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - {endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        {request.location && (
                          <p className="text-xs text-muted-foreground truncate">
                            📍 {request.location}
                          </p>
                        )}
                        {request.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {request.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleApproveRequest(request.id)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-red-500/50 text-red-600 dark:text-red-400 hover:bg-red-500/10"
                            onClick={() => handleDisapproveRequest(request.id)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            Decline
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center py-4 text-center space-y-2">
            <div className="rounded-full bg-accent/10 p-4">
              <Calendar className="h-8 w-8 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Connect Google Services</p>
              <p className="text-xs text-muted-foreground mt-1">
                Connect Calendar, Gmail, Drive, and Docs in one step
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
                  Connect Google Services
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
                    className="group relative overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-secondary/60 to-secondary/30 p-2 mb-1.5 transition-all duration-500 hover:scale-[1.02] hover:border-accent/50 hover:bg-secondary/80 hover:shadow-lg"
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
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
            <div className="rounded-full bg-accent/10 p-3">
              <Calendar className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-card-foreground">No events found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery ? 'Try a different search term' : 'No upcoming events in your calendar'}
              </p>
            </div>
            {!searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddEvent}
                className="gap-2 mt-2"
              >
                <Plus className="h-4 w-4" />
                Create Your First Event
              </Button>
            )}
          </div>
        ) : (
          <>
            {filteredEvents.map((event, index) => (
          <div 
            key={event.id}
            className="group relative overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-secondary/60 to-secondary/30 p-2 transition-all duration-500 hover:scale-[1.02] hover:border-accent/50 hover:bg-secondary/80 hover:shadow-lg"
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

      {/* Add Event Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>
              Create a new event in your Google Calendar. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Event title"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Event description (optional)"
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Event location (optional)"
                value={eventForm.location}
                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={eventForm.startDate}
                  onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={eventForm.startTime}
                  onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={eventForm.endDate}
                  onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={eventForm.endTime}
                  onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateEvent}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

