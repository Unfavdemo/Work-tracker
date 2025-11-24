'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Send, Inbox, TrendingUp, TrendingDown, RefreshCw, LogIn, Loader2, Calendar, Filter, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'

export function EmailTracker() {
  const [stats, setStats] = useState(null)
  const [threads, setThreads] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  // Filter states
  const [dateRange, setDateRange] = useState(30) // days
  const [emailType, setEmailType] = useState('all') // all, sent, received
  const [customKeywords, setCustomKeywords] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Prevent hydration mismatch by only rendering charts on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Check for stored access token on mount and handle URL-based auth
  useEffect(() => {
    // Check for token in URL (fallback for OAuth callback)
    const urlParams = new URLSearchParams(window.location.search)
    const tokenFromUrl = urlParams.get('token')
    const googleAuthSuccess = urlParams.get('google_auth_success')
    const gmailAuthSuccess = urlParams.get('gmail_auth_success')
    
    if ((googleAuthSuccess === 'true' || gmailAuthSuccess === 'true') && tokenFromUrl) {
      // Store unified token
      localStorage.setItem('google_token', tokenFromUrl)
      // Also store for backward compatibility
      localStorage.setItem('gmail_token', tokenFromUrl)
      localStorage.setItem('google_calendar_token', tokenFromUrl)
      setIsAuthenticated(true)
      fetchEmailData(tokenFromUrl)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
      return
    }

    // Check for unified token first, then fallback to old token for migration
    let token = localStorage.getItem('google_token')
    if (!token) {
      token = localStorage.getItem('gmail_token')
      // Migrate old token to unified token
      if (token) {
        localStorage.setItem('google_token', token)
      }
    }
    
    if (token) {
      setIsAuthenticated(true)
      fetchEmailData(token)
    }
    
    // Listen for unified auth updates
    const handleAuthUpdate = () => {
      const updatedToken = localStorage.getItem('google_token')
      if (updatedToken && !isAuthenticated) {
        setIsAuthenticated(true)
        fetchEmailData(updatedToken)
      }
    }
    window.addEventListener('googleAuthUpdated', handleAuthUpdate)
    return () => window.removeEventListener('googleAuthUpdated', handleAuthUpdate)
  }, [isAuthenticated])

  // Fetch email statistics and threads
  const fetchEmailData = async (token) => {
    setIsLoading(true)
    try {
      // Build query parameters
      const params = new URLSearchParams()
      params.append('days', dateRange.toString())
      if (customKeywords.trim()) {
        params.append('keywords', customKeywords.trim())
      }
      
      const [statsResponse, threadsResponse] = await Promise.all([
        fetch(`/api/gmail/stats?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
        fetch(`/api/gmail/threads?maxResults=5&${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        console.log('Email stats received:', statsData.stats)
        
        if (!statsData.stats) {
          console.warn('No stats data in response:', statsData)
          toast.warning('No email data available', {
            description: 'The API returned successfully but no stats were found.',
          })
          setIsLoading(false)
          return
        }
        
        // Apply email type filter (sent/received)
        let filteredStats = statsData.stats
        if (emailType === 'sent') {
          filteredStats = {
            ...statsData.stats,
            total: statsData.stats.sent,
            received: 0,
            dailyBreakdown: statsData.stats.dailyBreakdown?.map(day => ({
              ...day,
              received: 0
            })) || []
          }
        } else if (emailType === 'received') {
          filteredStats = {
            ...statsData.stats,
            total: statsData.stats.received,
            sent: 0,
            dailyBreakdown: statsData.stats.dailyBreakdown?.map(day => ({
              ...day,
              sent: 0
            })) || []
          }
        }
        
        setStats(filteredStats)
        
        if (!filteredStats || filteredStats.total === 0) {
          toast.info('No student emails found', {
            description: `No ${emailType === 'all' ? '' : emailType + ' '}emails matching @lauchpadphilly.org or student keywords found in the last ${dateRange} days.`,
          })
        }
      } else if (statsResponse.status === 401 || statsResponse.status === 403) {
        // Token expired or invalid
        localStorage.removeItem('google_token')
        localStorage.removeItem('gmail_token')
        setIsAuthenticated(false)
        toast.error('Authentication expired', {
          description: 'Please reconnect your Google services',
        })
      } else {
        // Get error details
        const errorData = await statsResponse.json().catch(() => ({}))
        const errorMessage = errorData.error || `Server error: ${statsResponse.status}`
        console.error('Failed to fetch email stats:', statsResponse.status, errorMessage)
        
        // Check if it's an authentication error
        if (errorMessage.includes('invalid authentication') || 
            errorMessage.includes('Invalid or expired authentication token') ||
            errorMessage.includes('authentication credential') ||
            errorMessage.includes('Request had invalid authentication credentials') ||
            errorMessage.includes('OAuth 2')) {
          localStorage.removeItem('google_token')
          localStorage.removeItem('gmail_token')
          setIsAuthenticated(false)
          toast.error('Authentication failed', {
            description: 'Please reconnect your Google services to get a new token.',
            duration: 5000,
          })
        } else if (errorMessage.includes('Metadata scope') || errorMessage.includes('q parameter')) {
          // Scope/permission error
          localStorage.removeItem('google_token')
          localStorage.removeItem('gmail_token')
          setIsAuthenticated(false)
          toast.error('Permission issue detected', {
            description: 'Please reconnect your Google account to get the correct permissions.',
            duration: 5000,
          })
        } else {
          toast.error('Failed to load email statistics', {
            description: errorMessage,
          })
        }
      }

      if (threadsResponse.ok) {
        const threadsData = await threadsResponse.json()
        console.log('Email threads received:', threadsData.threads?.length || 0)
        setThreads(threadsData.threads || [])
      } else if (threadsResponse.status !== 401) {
        // Don't show error for threads if it's not auth error (stats error already shown)
        const errorData = await threadsResponse.json().catch(() => ({}))
        console.error('Failed to fetch email threads:', threadsResponse.status, errorData.error)
      }
    } catch (error) {
      console.error('Error fetching email data:', error)
      toast.error('Failed to load email data', {
        description: error.message || 'Please check your connection and try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Google services authentication (unified)
  const handleConnectGmail = async () => {
    setIsConnecting(true)
    let messageHandler = null
    let timeout = null
    let popup = null

    try {
      const response = await fetch('/api/google/auth?action=url')
      
      if (!response.ok) {
        const errorText = await response.text()
        let errorData = {}
        
        // Try to parse as JSON
        try {
          errorData = JSON.parse(errorText)
        } catch {
          // If it's HTML (like a 404 page), provide a helpful message
          if (errorText.trim().startsWith('<!DOCTYPE')) {
            errorData = {
              error: 'Google OAuth not configured',
              requiresConfig: true,
              message: 'Please configure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI in your environment variables.'
            }
          } else {
            errorData = { error: `Server error: ${response.status}` }
          }
        }
        
        if (errorData.requiresConfig) {
          toast.error('Google OAuth not configured', {
            description: errorData.message || 'Please configure your Google OAuth credentials in environment variables.',
            duration: 6000,
          })
          setIsConnecting(false)
          return
        }
        
        throw new Error(errorData.error || `Failed to get auth URL: ${response.status}`)
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
      
      popup = window.open(
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

      // Track if we've received a message to avoid false positives
      let messageReceived = false
      
      // Listen for message from popup
      const originalMessageHandler = (event) => {
        // Verify message origin for security
        const allowedOrigin = window.location.origin
        if (event.origin !== allowedOrigin) {
          return // Ignore messages from other origins
        }
        
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS' || event.data.type === 'GMAIL_AUTH_SUCCESS') {
          messageReceived = true
          const { accessToken, services } = event.data
          console.log('Google auth success, token received')
          // Store unified token
          localStorage.setItem('google_token', accessToken)
          // Also store for backward compatibility
          localStorage.setItem('gmail_token', accessToken)
          localStorage.setItem('google_calendar_token', accessToken)
          setIsAuthenticated(true)
          fetchEmailData(accessToken)
          try {
            popup?.close()
          } catch (error) {
            // Popup might already be closed or blocked by COOP
          }
          if (timeout) clearTimeout(timeout)
          setIsConnecting(false)
          window.removeEventListener('message', messageHandler)
          const serviceList = services ? services.join(', ') : 'Calendar, Gmail, Drive, and Docs'
          toast.success('Google Services Connected!', {
            description: `${serviceList} are now connected and ready to use`,
            duration: 5000,
          })
          // Trigger refresh event for other components
          window.dispatchEvent(new Event('googleAuthUpdated'))
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR' || event.data.type === 'GMAIL_AUTH_ERROR') {
          messageReceived = true
          console.error('Google auth error:', event.data.error)
          try {
            popup?.close()
          } catch (error) {
            // Popup might already be closed or blocked by COOP
          }
          if (timeout) clearTimeout(timeout)
          setIsConnecting(false)
          window.removeEventListener('message', messageHandler)
          toast.error('Google authentication failed', {
            description: event.data.error || 'Please try again',
          })
        }
      }
      
      // Wrap message handler to track message receipt
      messageHandler = (event) => {
        originalMessageHandler(event)
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
            description: 'The authentication process took too long. Please try again.',
          })
        }
      }, 5 * 60 * 1000) // 5 minutes timeout
    } catch (error) {
      console.error('Error connecting Google services:', error)
      toast.error('Failed to connect Google services', {
        description: error.message || 'Please check your configuration and try again',
      })
      setIsConnecting(false)
      if (timeout) clearTimeout(timeout)
      if (messageHandler) window.removeEventListener('message', messageHandler)
      try {
        popup?.close()
      } catch (e) {
        // Popup might not exist
      }
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    const token = localStorage.getItem('google_token') || localStorage.getItem('gmail_token')
    if (token) {
      fetchEmailData(token)
      toast.success('Refreshing email data...')
    }
  }

  // Apply filters
  const applyFilters = () => {
    const token = localStorage.getItem('google_token') || localStorage.getItem('gmail_token')
    if (token) {
      fetchEmailData(token)
      setShowFilters(false)
      toast.success('Filters applied')
    }
  }

  // Reset filters
  const resetFilters = () => {
    setDateRange(30)
    setEmailType('all')
    setCustomKeywords('')
    const token = localStorage.getItem('google_token') || localStorage.getItem('gmail_token')
    if (token) {
      fetchEmailData(token)
      toast.success('Filters reset')
    }
  }

  // Calculate days from date range string
  const getDaysFromRange = (range) => {
    const now = new Date()
    switch(range) {
      case 'today': return 1
      case 'week': return 7
      case 'month': return 30
      case 'year': return 365
      default: return 30
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return dateString
    }
  }

  return (
    <Card className="group border-2 border-border/70 bg-card transition-all duration-500 hover:border-accent hover:shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-card-foreground">Student Email Tracker</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Track student communication emails
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => setShowFilters(!showFilters)}
                  title="Toggle filters"
                >
                  <Filter className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={handleRefresh}
                  disabled={isLoading}
                  title="Refresh email data"
                >
                  <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Filters Panel */}
        {isAuthenticated && showFilters && (
          <div className="rounded-lg border border-border/50 bg-gradient-to-br from-secondary/20 to-secondary/10 p-2 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-accent" />
                <p className="text-sm font-semibold text-card-foreground">Filters</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setShowFilters(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Date Range</label>
              <div className="flex gap-1.5">
                {[
                  { label: '7 Days', value: 7 },
                  { label: '30 Days', value: 30 },
                  { label: '60 Days', value: 60 },
                  { label: '90 Days', value: 90 },
                ].map((range) => (
                  <Button
                    key={range.value}
                    variant={dateRange === range.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDateRange(range.value)}
                    className="text-xs"
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Email Type Filter */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Email Type</label>
              <div className="flex gap-1.5">
                {[
                  { label: 'All', value: 'all', icon: Mail },
                  { label: 'Sent', value: 'sent', icon: Send },
                  { label: 'Received', value: 'received', icon: Inbox },
                ].map((type) => {
                  const Icon = type.icon
                  return (
                    <Button
                      key={type.value}
                      variant={emailType === type.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setEmailType(type.value)}
                      className="gap-1.5 text-xs"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {type.label}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Custom Keywords Filter */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Custom Keywords (comma-separated)</label>
              <Input
                placeholder="e.g., workshop, assignment, project"
                value={customKeywords}
                onChange={(e) => setCustomKeywords(e.target.value)}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use default keywords. Separate multiple keywords with commas.
              </p>
            </div>

            {/* Filter Actions */}
            <div className="flex gap-1.5 pt-1.5">
              <Button
                onClick={applyFilters}
                size="sm"
                className="flex-1"
              >
                Apply Filters
              </Button>
              <Button
                onClick={resetFilters}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Reset
              </Button>
            </div>
          </div>
        )}

        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center py-4 text-center space-y-2">
            <div className="rounded-full bg-accent/10 p-4">
              <Mail className="h-8 w-8 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Connect Google Services</p>
              <p className="text-xs text-muted-foreground mt-1">
                Connect Calendar, Gmail, Drive, and Docs in one step
              </p>
            </div>
            <Button 
              onClick={handleConnectGmail}
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
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-accent mb-2" />
            <p className="text-sm font-medium text-muted-foreground">Loading email data...</p>
          </div>
        ) : stats !== null ? (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-1.5">
              <div className="rounded-lg border border-border/50 bg-gradient-to-br from-secondary/40 to-secondary/20 p-2">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="h-4 w-4 text-chart-2" />
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <p className="text-2xl font-bold text-card-foreground">{stats.total}</p>
                <div className="flex items-center gap-1 mt-1">
                  {stats.trend > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-400" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-400" />
                  )}
                  <span className={cn(
                    "text-xs font-medium",
                    stats.trend > 0 ? "text-green-400" : "text-red-400"
                  )}>
                    {Math.abs(stats.trend)}%
                  </span>
                </div>
              </div>
              <div className="rounded-lg border border-border/50 bg-gradient-to-br from-secondary/40 to-secondary/20 p-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <Send className="h-4 w-4 text-chart-1" />
                  <p className="text-xs text-muted-foreground">Sent</p>
                </div>
                <p className="text-2xl font-bold text-card-foreground">{stats.sent}</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-gradient-to-br from-secondary/40 to-secondary/20 p-2">
                <div className="flex items-center gap-2 mb-1">
                  <Inbox className="h-4 w-4 text-chart-3" />
                  <p className="text-xs text-muted-foreground">Received</p>
                </div>
                <p className="text-2xl font-bold text-card-foreground">{stats.received}</p>
              </div>
            </div>

            {/* Daily Breakdown Chart */}
            {stats.dailyBreakdown && stats.dailyBreakdown.length > 0 && (
              <div className="rounded-lg border border-border/50 bg-gradient-to-br from-secondary/20 to-secondary/10 p-2">
                <div className="flex items-center gap-1.5 mb-2">
                  <Calendar className="h-4 w-4 text-accent" />
                  <p className="text-sm font-semibold text-card-foreground">Last 7 Days</p>
                </div>
                {isMounted ? (
                  <div className="w-full overflow-x-auto" style={{ height: '200px' }}>
                    <BarChart width={898} height={200} data={stats.dailyBreakdown}>
                      <XAxis 
                        dataKey="day" 
                        stroke="hsl(var(--foreground))"
                        tick={{ fill: 'hsl(var(--foreground))' }}
                        fontSize={12}
                        fontWeight={500}
                      />
                      <YAxis 
                        stroke="hsl(var(--foreground))"
                        tick={{ fill: 'hsl(var(--foreground))' }}
                        fontSize={12}
                        fontWeight={500}
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
                      <Legend 
                        wrapperStyle={{ color: 'hsl(var(--foreground))' }}
                        iconType="square"
                      />
                      <Bar 
                        dataKey="sent" 
                        fill="#a855f7" 
                        name="Sent"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar 
                        dataKey="received" 
                        fill="#c084fc" 
                        name="Received"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </div>
                ) : (
                  <div className="w-full flex items-center justify-center" style={{ height: '200px' }}>
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
            )}

            {/* Recent Student Threads */}
            {threads.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-card-foreground">Recent Student Conversations</p>
                {threads.map((thread) => (
                  <div 
                    key={thread.id}
                    className="rounded-lg border border-border/50 bg-gradient-to-br from-secondary/40 to-secondary/20 p-2 transition-all hover:border-accent/50 hover:bg-secondary/60"
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-card-foreground truncate">
                          {thread.subject || 'No Subject'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {thread.from}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Badge variant="secondary" className="text-xs">
                            {thread.messageCount} {thread.messageCount === 1 ? 'message' : 'messages'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(thread.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Show message if no emails found */}
            {stats.total === 0 && (
              <div className="rounded-lg border border-border/50 bg-gradient-to-br from-secondary/20 to-secondary/10 p-3 text-center">
                <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium text-card-foreground mb-1">No student emails found</p>
                <p className="text-xs text-muted-foreground">
                  No emails matching @lauchpadphilly.org or student keywords in the last 30 days.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm font-medium text-muted-foreground">No email data available</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try clicking the refresh button or reconnect your Gmail
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

