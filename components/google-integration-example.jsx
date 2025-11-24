'use client'

/**
 * Example component demonstrating Google Docs and Gmail API integration
 * 
 * This component shows how to:
 * 1. Authenticate with Google OAuth
 * 2. Create Google Docs
 * 3. Fetch Gmail statistics
 * 4. Handle errors and token refresh
 * 
 * Usage:
 * import { GoogleIntegrationExample } from '@/components/google-integration-example'
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { FileText, Mail, RefreshCw, ExternalLink } from 'lucide-react'

export function GoogleIntegrationExample() {
  // Authentication state
  const [isGoogleAuthenticated, setIsGoogleAuthenticated] = useState(false)
  const [isGmailAuthenticated, setIsGmailAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)

  // Gmail stats state
  const [gmailStats, setGmailStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(false)

  // Google Docs state
  const [docTitle, setDocTitle] = useState('')
  const [docContent, setDocContent] = useState('')
  const [creatingDoc, setCreatingDoc] = useState(false)
  const [createdDocs, setCreatedDocs] = useState([])

  // Check authentication on mount
  useEffect(() => {
    checkAuthentication()
  }, [])

  // Fetch Gmail stats if authenticated
  useEffect(() => {
    if (isGmailAuthenticated) {
      fetchGmailStats()
    }
  }, [isGmailAuthenticated])

  /**
   * Check if user is authenticated with Google services
   */
  const checkAuthentication = () => {
    const googleToken = localStorage.getItem('google_access_token')
    const gmailToken = localStorage.getItem('gmail_access_token')
    
    setIsGoogleAuthenticated(!!googleToken)
    setIsGmailAuthenticated(!!gmailToken)
  }

  /**
   * Authenticate with Google (Calendar, Docs, Drive)
   */
  const handleGoogleAuth = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/calendar/auth?action=url')
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to get authorization URL')
      }

      const { authUrl } = await response.json()
      window.location.href = authUrl
    } catch (error) {
      console.error('Error initiating Google auth:', error)
      toast.error(error.message || 'Failed to connect Google account')
      setLoading(false)
    }
  }

  /**
   * Authenticate with Gmail
   */
  const handleGmailAuth = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/gmail/auth?action=url')
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to get Gmail authorization URL')
      }

      const { authUrl } = await response.json()
      window.location.href = authUrl
    } catch (error) {
      console.error('Error initiating Gmail auth:', error)
      toast.error(error.message || 'Failed to connect Gmail account')
      setLoading(false)
    }
  }

  /**
   * Fetch Gmail statistics
   */
  const fetchGmailStats = async () => {
    const accessToken = localStorage.getItem('gmail_access_token')
    
    if (!accessToken) {
      setIsGmailAuthenticated(false)
      return
    }

    setLoadingStats(true)
    try {
      const response = await fetch('/api/gmail/stats?days=30', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      const result = await response.json()

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401 || result.error?.includes('Invalid or expired')) {
          toast.error('Please reconnect your Gmail account')
          localStorage.removeItem('gmail_access_token')
          setIsGmailAuthenticated(false)
          return
        }
        throw new Error(result.error || 'Failed to fetch Gmail statistics')
      }

      setGmailStats(result.stats)
    } catch (error) {
      console.error('Error fetching Gmail stats:', error)
      toast.error(error.message || 'Failed to fetch email statistics')
    } finally {
      setLoadingStats(false)
    }
  }

  /**
   * Create a Google Doc
   */
  const handleCreateDoc = async () => {
    const accessToken = localStorage.getItem('google_access_token')
    
    if (!accessToken) {
      toast.error('Please connect your Google account first')
      handleGoogleAuth()
      return
    }

    if (!docTitle.trim()) {
      toast.error('Please enter a document title')
      return
    }

    setCreatingDoc(true)
    try {
      const response = await fetch('/api/docs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          title: docTitle.trim(),
          content: docContent || ''
        })
      })

      const result = await response.json()

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401 || result.type === 'authentication') {
          toast.error('Please reconnect your Google account')
          localStorage.removeItem('google_access_token')
          setIsGoogleAuthenticated(false)
          handleGoogleAuth()
          return
        }

        // Handle permission errors
        if (response.status === 403 || result.type === 'permission') {
          toast.error('Please reconnect and grant all permissions')
          localStorage.removeItem('google_access_token')
          setIsGoogleAuthenticated(false)
          handleGoogleAuth()
          return
        }

        throw new Error(result.error || 'Failed to create document')
      }

      if (result.success && result.doc) {
        toast.success('Document created successfully!')
        
        // Add to created docs list
        setCreatedDocs(prev => [result.doc, ...prev])
        
        // Clear form
        setDocTitle('')
        setDocContent('')
        
        // Optionally open the document in a new tab
        window.open(result.doc.webViewLink, '_blank')
      }
    } catch (error) {
      console.error('Error creating document:', error)
      toast.error(error.message || 'Failed to create document')
    } finally {
      setCreatingDoc(false)
    }
  }

  /**
   * Refresh Gmail statistics
   */
  const handleRefreshStats = () => {
    fetchGmailStats()
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Google Integration Example</h2>
        <p className="text-muted-foreground">
          Example component demonstrating Google Docs and Gmail API integration
        </p>
      </div>

      {/* Authentication Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Google Auth (Calendar, Docs, Drive) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Google Account
            </CardTitle>
            <CardDescription>
              Connect for Google Docs, Drive, and Calendar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isGoogleAuthenticated ? (
              <div className="space-y-2">
                <p className="text-sm text-green-600">✓ Connected</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    localStorage.removeItem('google_access_token')
                    setIsGoogleAuthenticated(false)
                    toast.success('Disconnected')
                  }}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Connecting...' : 'Connect Google Account'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Gmail Auth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Gmail Account
            </CardTitle>
            <CardDescription>
              Connect for email statistics and tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isGmailAuthenticated ? (
              <div className="space-y-2">
                <p className="text-sm text-green-600">✓ Connected</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    localStorage.removeItem('gmail_access_token')
                    setIsGmailAuthenticated(false)
                    setGmailStats(null)
                    toast.success('Disconnected')
                  }}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleGmailAuth}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? 'Connecting...' : 'Connect Gmail Account'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gmail Statistics */}
      {isGmailAuthenticated && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Gmail Statistics</CardTitle>
                <CardDescription>
                  Student email statistics for the last 30 days
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefreshStats}
                disabled={loadingStats}
              >
                <RefreshCw className={`h-4 w-4 ${loadingStats ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingStats && !gmailStats ? (
              <p className="text-muted-foreground">Loading statistics...</p>
            ) : gmailStats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Emails</p>
                    <p className="text-2xl font-bold">{gmailStats.total}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sent</p>
                    <p className="text-2xl font-bold text-blue-600">{gmailStats.sent}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Received</p>
                    <p className="text-2xl font-bold text-green-600">{gmailStats.received}</p>
                  </div>
                </div>

                {gmailStats.dailyBreakdown && gmailStats.dailyBreakdown.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Last 7 Days</h4>
                    <div className="space-y-1">
                      {gmailStats.dailyBreakdown.map((day, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center text-sm py-1 border-b last:border-0"
                        >
                          <span>{day.day} {day.date}</span>
                          <span>
                            <span className="text-blue-600 font-medium">{day.sent}</span>
                            {' / '}
                            <span className="text-green-600 font-medium">{day.received}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {gmailStats.trend !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Trend: <span className={gmailStats.trend >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {gmailStats.trend >= 0 ? '+' : ''}{gmailStats.trend}%
                      </span>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No statistics available</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Google Doc */}
      {isGoogleAuthenticated && (
        <Card>
          <CardHeader>
            <CardTitle>Create Google Doc</CardTitle>
            <CardDescription>
              Create a new Google Doc and save it to your Drive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Title *</label>
              <Input
                placeholder="Enter document title..."
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Content (optional)</label>
              <textarea
                placeholder="Enter document content..."
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                className="w-full min-h-[150px] p-3 border rounded-md resize-y"
              />
            </div>

            <Button
              onClick={handleCreateDoc}
              disabled={creatingDoc || !docTitle.trim()}
              className="w-full"
            >
              {creatingDoc ? 'Creating Document...' : 'Create Document'}
            </Button>

            {createdDocs.length > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <p className="text-sm font-medium">Recently Created Documents</p>
                <div className="space-y-2">
                  {createdDocs.slice(0, 5).map((doc, index) => (
                    <div
                      key={doc.id || index}
                      className="flex items-center justify-between p-2 border rounded text-sm"
                    >
                      <span className="truncate flex-1">{doc.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(doc.webViewLink, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Click "Connect Google Account" to authenticate with Google (Docs, Drive, Calendar)</p>
          <p>2. Click "Connect Gmail Account" to authenticate with Gmail</p>
          <p>3. Once authenticated, Gmail statistics will load automatically</p>
          <p>4. You can create Google Docs by entering a title and optional content</p>
          <p>5. Created documents will be saved to your Google Drive and can be opened in a new tab</p>
        </CardContent>
      </Card>
    </div>
  )
}

