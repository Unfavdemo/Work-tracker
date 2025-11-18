'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Send, Inbox, TrendingUp, TrendingDown, RefreshCw, LogIn, Loader2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export function EmailTracker() {
  const [stats, setStats] = useState(null)
  const [threads, setThreads] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  // Check for stored access token on mount
  useEffect(() => {
    const token = localStorage.getItem('gmail_token')
    if (token) {
      setIsAuthenticated(true)
      fetchEmailData(token)
    }
  }, [])

  // Fetch email statistics and threads
  const fetchEmailData = async (token) => {
    setIsLoading(true)
    try {
      const [statsResponse, threadsResponse] = await Promise.all([
        fetch('/api/gmail/stats?days=30', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
        fetch('/api/gmail/threads?maxResults=5', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats)
      } else if (statsResponse.status === 401) {
        localStorage.removeItem('gmail_token')
        setIsAuthenticated(false)
        toast.error('Authentication expired', {
          description: 'Please reconnect your Gmail',
        })
      }

      if (threadsResponse.ok) {
        const threadsData = await threadsResponse.json()
        setThreads(threadsData.threads || [])
      }
    } catch (error) {
      console.error('Error fetching email data:', error)
      toast.error('Failed to load email data', {
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Gmail authentication
  const handleConnectGmail = async () => {
    setIsConnecting(true)
    try {
      const response = await fetch('/api/gmail/auth?action=url')
      const data = await response.json()
      
      if (data.authUrl) {
        // Open OAuth popup
        const width = 500
        const height = 600
        const left = window.screenX + (window.outerWidth - width) / 2
        const top = window.screenY + (window.outerHeight - height) / 2
        
        const popup = window.open(
          data.authUrl,
          'Gmail Auth',
          `width=${width},height=${height},left=${left},top=${top}`
        )

        // Listen for OAuth callback
        const checkPopup = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkPopup)
            setIsConnecting(false)
          }
        }, 1000)

        // Listen for message from popup
        window.addEventListener('message', (event) => {
          if (event.data.type === 'GMAIL_AUTH_SUCCESS') {
            const { accessToken } = event.data
            localStorage.setItem('gmail_token', accessToken)
            setIsAuthenticated(true)
            fetchEmailData(accessToken)
            popup?.close()
            clearInterval(checkPopup)
            setIsConnecting(false)
            toast.success('Gmail connected!', {
              description: 'Your email data is now being tracked',
            })
          }
        }, { once: true })
      }
    } catch (error) {
      console.error('Error connecting Gmail:', error)
      toast.error('Failed to connect Gmail', {
        description: error.message,
      })
      setIsConnecting(false)
    }
  }

  // Handle refresh
  const handleRefresh = () => {
    const token = localStorage.getItem('gmail_token')
    if (token) {
      fetchEmailData(token)
      toast.success('Refreshing email data...')
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
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
            <div className="rounded-full bg-accent/10 p-4">
              <Mail className="h-8 w-8 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Connect Gmail</p>
              <p className="text-xs text-muted-foreground mt-1">
                Track student communication emails and statistics
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
                  Connect Gmail
                </>
              )}
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-accent mb-2" />
            <p className="text-sm font-medium text-muted-foreground">Loading email data...</p>
          </div>
        ) : stats ? (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-border/50 bg-gradient-to-br from-secondary/40 to-secondary/20 p-3">
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
              <div className="rounded-lg border border-border/50 bg-gradient-to-br from-secondary/40 to-secondary/20 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Send className="h-4 w-4 text-chart-1" />
                  <p className="text-xs text-muted-foreground">Sent</p>
                </div>
                <p className="text-2xl font-bold text-card-foreground">{stats.sent}</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-gradient-to-br from-secondary/40 to-secondary/20 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Inbox className="h-4 w-4 text-chart-3" />
                  <p className="text-xs text-muted-foreground">Received</p>
                </div>
                <p className="text-2xl font-bold text-card-foreground">{stats.received}</p>
              </div>
            </div>

            {/* Daily Breakdown Chart */}
            {stats.dailyBreakdown && stats.dailyBreakdown.length > 0 && (
              <div className="rounded-lg border border-border/50 bg-gradient-to-br from-secondary/20 to-secondary/10 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-accent" />
                  <p className="text-sm font-semibold text-card-foreground">Last 7 Days</p>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.dailyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="day" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="sent" 
                      fill="hsl(var(--chart-1))" 
                      name="Sent"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="received" 
                      fill="hsl(var(--chart-2))" 
                      name="Received"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recent Student Threads */}
            {threads.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-card-foreground">Recent Student Conversations</p>
                {threads.map((thread) => (
                  <div 
                    key={thread.id}
                    className="rounded-lg border border-border/50 bg-gradient-to-br from-secondary/40 to-secondary/20 p-3 transition-all hover:border-accent/50 hover:bg-secondary/60"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-card-foreground truncate">
                          {thread.subject || 'No Subject'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {thread.from}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
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
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm font-medium text-muted-foreground">No email data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

