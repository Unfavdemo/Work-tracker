'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Settings as SettingsIcon, 
  ArrowLeft, 
  Moon, 
  Sun, 
  Bell, 
  RefreshCw, 
  Download, 
  Calendar,
  Mail,
  Video,
  Users,
  Trash2,
  Save,
  CheckCircle2,
  XCircle,
  Sparkles,
  FileText,
  Shield,
  ExternalLink
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { FormEditor } from '@/components/form-editor'

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Settings state
  const [settings, setSettings] = useState({
    // Theme
    theme: 'dark',
    
    // Refresh intervals (in seconds)
    dashboardRefresh: 30,
    workshopRefresh: 30,
    communicationRefresh: 30,
    
    // Notifications
    enableNotifications: true,
    emailNotifications: false,
    successNotifications: true,
    errorNotifications: true,
    
    // Export
    defaultExportFormat: 'json',
    includeMetadata: true,
    
    // Dashboard
    showQuickStats: true,
    showWorkshopStats: true,
    showCommunicationStats: true,
    showAIRecommendations: true,
    
    // Date format
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    
    // Default date range
    defaultDateRange: 'month',
  })
  
  const [hasChanges, setHasChanges] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    loadSettings()
  }, [])
  
  useEffect(() => {
    if (mounted && theme) {
      setSettings(prev => ({ ...prev, theme }))
    }
  }, [theme, mounted])
  
  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('dashboard_settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        setSettings(prev => ({ ...prev, ...parsed }))
        // Apply theme if saved
        if (parsed.theme && setTheme) {
          setTheme(parsed.theme)
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }
  
  const saveSettings = () => {
    try {
      localStorage.setItem('dashboard_settings', JSON.stringify(settings))
      if (setTheme && settings.theme) {
        setTheme(settings.theme)
      }
      setHasChanges(false)
      toast.success('Settings saved successfully!', {
        description: 'Your preferences have been updated',
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    }
  }
  
  const resetSettings = () => {
    const defaultSettings = {
      theme: 'dark',
      dashboardRefresh: 30,
      workshopRefresh: 30,
      communicationRefresh: 30,
      enableNotifications: true,
      emailNotifications: false,
      successNotifications: true,
      errorNotifications: true,
      defaultExportFormat: 'json',
      includeMetadata: true,
      showQuickStats: true,
      showWorkshopStats: true,
      showCommunicationStats: true,
      showAIRecommendations: true,
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      defaultDateRange: 'month',
    }
    setSettings(defaultSettings)
    setHasChanges(true)
    toast.info('Settings reset to defaults')
  }
  
  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }
  
  // Check API connection status
  const [apiStatus, setApiStatus] = useState({
    google: false,
    openai: false,
  })
  
  useEffect(() => {
    const checkConnections = () => {
      // Check for unified token first, then fallback to old tokens for migration
      const googleToken = localStorage.getItem('google_token') || 
                         localStorage.getItem('google_calendar_token') || 
                         localStorage.getItem('gmail_token')
      
      // If we have old tokens but no unified token, migrate them
      if (!localStorage.getItem('google_token') && googleToken) {
        localStorage.setItem('google_token', googleToken)
      }
      
      setApiStatus({
        google: !!googleToken,
        openai: !!localStorage.getItem('openai_api_key'),
      })
    }
    checkConnections()
    // Check every 5 seconds
    const interval = setInterval(checkConnections, 5000)
    
    // Listen for auth updates
    const handleAuthUpdate = () => {
      checkConnections()
    }
    window.addEventListener('googleAuthUpdated', handleAuthUpdate)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('googleAuthUpdated', handleAuthUpdate)
    }
  }, [])
  
  const disconnectService = (service) => {
    if (service === 'google') {
      // Remove all Google tokens
      localStorage.removeItem('google_token')
      localStorage.removeItem('google_calendar_token')
      localStorage.removeItem('gmail_token')
      setApiStatus(prev => ({ ...prev, google: false }))
      toast.success('Google services disconnected')
      // Trigger refresh event
      window.dispatchEvent(new Event('workshopUpdated'))
      window.dispatchEvent(new Event('googleAuthUpdated'))
    }
  }
  
  const handleConnectGoogle = async () => {
    try {
      const response = await fetch('/api/google/auth?action=url')
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        toast.error('Google OAuth not configured', {
          description: errorData.message || 'Please configure your Google OAuth credentials.',
          duration: 6000,
        })
        return
      }
      
      const data = await response.json()
      
      if (data.requiresConfig) {
        toast.error('Google OAuth not configured', {
          description: data.message || 'Please configure your Google OAuth credentials.',
          duration: 6000,
        })
        return
      }
      
      if (!data.authUrl) {
        toast.error('Failed to get authentication URL')
        return
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

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        toast.error('Popup blocked', {
          description: 'Please allow popups for this site and try again',
        })
        return
      }

      let timeout
      let messageReceived = false

      const messageHandler = (event) => {
        const allowedOrigin = window.location.origin
        if (event.origin !== allowedOrigin) {
          return
        }
        
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          messageReceived = true
          const { accessToken, services } = event.data
          // Store unified token
          localStorage.setItem('google_token', accessToken)
          // Also store for backward compatibility
          localStorage.setItem('google_calendar_token', accessToken)
          localStorage.setItem('gmail_token', accessToken)
          setApiStatus(prev => ({ ...prev, google: true }))
          try {
            popup?.close()
          } catch (error) {
            // Popup might already be closed
          }
          clearTimeout(timeout)
          window.removeEventListener('message', messageHandler)
          const serviceList = services ? services.join(', ') : 'Calendar, Gmail, Drive, and Docs'
          toast.success('Google Services Connected!', {
            description: `${serviceList} are now connected and ready to use`,
            duration: 5000,
          })
          window.dispatchEvent(new Event('googleAuthUpdated'))
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          messageReceived = true
          clearTimeout(timeout)
          window.removeEventListener('message', messageHandler)
          toast.error('Authentication Failed', {
            description: event.data.error || 'Please try again',
          })
        }
      }
      
      window.addEventListener('message', messageHandler)
      
      timeout = setTimeout(() => {
        if (!messageReceived) {
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
      }, 5 * 60 * 1000)
    } catch (error) {
      console.error('Error connecting Google services:', error)
      toast.error('Failed to connect Google services', {
        description: error.message,
      })
    }
  }
  
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-1.5 sm:p-2 lg:p-2.5">
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <SettingsIcon className="h-12 w-12 animate-spin text-accent mx-auto mb-4" />
              <p className="text-muted-foreground">Loading settings...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-1.5 sm:p-2 lg:p-2.5">
      <div className="mx-auto w-full max-w-5xl space-y-1.5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <SettingsIcon className="h-8 w-8 text-accent" />
                Settings
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your dashboard preferences and integrations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="outline" className="text-xs">
                Unsaved changes
              </Badge>
            )}
            <Button onClick={resetSettings} variant="outline" size="sm">
              Reset
            </Button>
            <Button onClick={saveSettings} size="sm" className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
        
        {/* API Connections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              Connections
            </CardTitle>
            <CardDescription>
              Manage your connected services and integrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Unified Google Services */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/20 p-2">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-card-foreground">Google Services</p>
                  <p className="text-sm text-muted-foreground">
                    Calendar, Gmail, Drive, and Docs - all connected together
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {apiStatus.google ? (
                  <>
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => disconnectService('google')}
                      className="gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <>
                    <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/50">
                      <XCircle className="h-3 w-3 mr-1" />
                      Not Connected
                    </Badge>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleConnectGoogle}
                      className="gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Connect
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Authorized Domains */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              Authorized Domains
            </CardTitle>
            <CardDescription>
              Configure domains authorized for OAuth and API access. Used for Google Workspace integration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="authorizedDomains">Authorized Domains</Label>
              <div className="space-y-2">
                {(() => {
                  const saved = localStorage.getItem('authorized_domains')
                  const domains = saved ? JSON.parse(saved) : ['@lauchpadphilly.org']
                  return domains.map((domain, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={domain}
                        onChange={(e) => {
                          const newDomains = [...domains]
                          newDomains[index] = e.target.value
                          localStorage.setItem('authorized_domains', JSON.stringify(newDomains))
                          toast.success('Domain updated')
                        }}
                        placeholder="e.g., @example.com"
                        className="flex-1 font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const newDomains = domains.filter((_, i) => i !== index)
                          localStorage.setItem('authorized_domains', JSON.stringify(newDomains))
                          toast.success('Domain removed')
                          setTimeout(() => window.location.reload(), 500)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                })()}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const saved = localStorage.getItem('authorized_domains')
                    const domains = saved ? JSON.parse(saved) : ['@lauchpadphilly.org']
                    const newDomain = prompt('Enter new authorized domain (e.g., @example.com):', '@')
                    if (newDomain && newDomain.trim()) {
                      const newDomains = [...domains, newDomain.trim()]
                      localStorage.setItem('authorized_domains', JSON.stringify(newDomains))
                      toast.success('Domain added')
                      setTimeout(() => window.location.reload(), 500)
                    }
                  }}
                  className="w-full"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Add Domain
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                These domains are used to filter student communications and validate OAuth requests. 
                Format: @domain.com (include the @ symbol).
              </p>
              <div className="mt-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-500 font-medium mb-1">OAuth Configuration:</p>
                <p className="text-xs text-blue-500/90 mb-2">
                  Make sure these domains are also added to your Google OAuth application's authorized domains in the{' '}
                  <a 
                    href="https://console.cloud.google.com/apis/credentials" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Google Cloud Console
                  </a>
                  .
                </p>
                <p className="text-xs text-blue-500/90">
                  <strong>Production URL:</strong> For your Vercel deployment, add{' '}
                  <code className="bg-blue-500/20 px-1 rounded">taheera-time-data-tracker.vercel.app</code>{' '}
                  to authorized domains in the OAuth consent screen.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* OpenAI API Key Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              OpenAI API Key (Optional)
            </CardTitle>
            <CardDescription>
              Optionally add your own API key. If not provided, the server-configured key will be used.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openaiKey">OpenAI API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="openaiKey"
                  type="text"
                  placeholder={apiStatus.openai ? "API key is configured" : "Enter your OpenAI API key (sk-...)"}
                  value={(() => {
                    const saved = localStorage.getItem('openai_api_key')
                    if (saved) {
                      return saved.substring(0, 7) + '...' + saved.substring(saved.length - 4)
                    }
                    return ''
                  })()}
                  disabled
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    const currentKey = localStorage.getItem('openai_api_key')
                    const newKey = prompt(
                      currentKey 
                        ? 'Enter new OpenAI API key (leave empty to remove):' 
                        : 'Enter your OpenAI API key:',
                      currentKey || ''
                    )
                    if (newKey !== null) {
                      if (newKey.trim() === '') {
                        localStorage.removeItem('openai_api_key')
                        setApiStatus(prev => ({ ...prev, openai: false }))
                        toast.success('OpenAI API key removed')
                      } else {
                        if (!newKey.trim().startsWith('sk-')) {
                          toast.warning('API keys typically start with "sk-"')
                        }
                        localStorage.setItem('openai_api_key', newKey.trim())
                        setApiStatus(prev => ({ ...prev, openai: true }))
                        toast.success('OpenAI API key saved')
                      }
                      // Reload to update UI
                      setTimeout(() => window.location.reload(), 500)
                    }
                  }}
                >
                  {apiStatus.openai ? 'Update' : 'Add'} Key
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Your API key is stored locally in your browser. This is optional - if you don't provide one, the server-configured key will be used. Get your key from{' '}
                <a 
                  href="https://platform.openai.com/api-keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  OpenAI Platform
                </a>
              </p>
              <div className="mt-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-xs text-yellow-500 font-medium mb-1">Note:</p>
                <p className="text-xs text-yellow-500/90">
                  If you encounter model access errors, ensure your API key has access to chat models in your{' '}
                  <a 
                    href="https://platform.openai.com/settings/organization/limits" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    OpenAI dashboard
                  </a>
                  . The system will automatically try multiple models if one is unavailable.
                </p>
              </div>
            </div>
            {apiStatus.openai && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <p className="text-sm text-green-500">
                  API key is configured. You can now use ChatGPT.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/chatgpt')}
                  className="ml-auto"
                >
                  Open ChatGPT
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* OpenAI Project & Organization Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              OpenAI Project & Organization
            </CardTitle>
            <CardDescription>
              Configure your OpenAI organization and project IDs for personalized usage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organizationId">Organization ID (Optional)</Label>
              <Input
                id="organizationId"
                type="text"
                placeholder="org-..."
                value={(() => {
                  const saved = localStorage.getItem('openai_organization_id')
                  return saved || ''
                })()}
                onChange={(e) => {
                  const value = e.target.value.trim()
                  if (value) {
                    localStorage.setItem('openai_organization_id', value)
                  } else {
                    localStorage.removeItem('openai_organization_id')
                  }
                  toast.success('Organization ID saved')
                }}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Your OpenAI organization ID. Find it in your{' '}
                <a 
                  href="https://platform.openai.com/account/org-settings" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  organization settings
                </a>
                .
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectId">Project ID (Optional)</Label>
              <Input
                id="projectId"
                type="text"
                placeholder="proj_..."
                value={(() => {
                  const saved = localStorage.getItem('openai_project_id')
                  return saved || ''
                })()}
                onChange={(e) => {
                  const value = e.target.value.trim()
                  if (value) {
                    localStorage.setItem('openai_project_id', value)
                  } else {
                    localStorage.removeItem('openai_project_id')
                  }
                  toast.success('Project ID saved')
                }}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Your OpenAI project ID. This allows you to use specific projects and track usage per project. Find it in your{' '}
                <a 
                  href="https://platform.openai.com/projects" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  OpenAI projects dashboard
                </a>
                .
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-xs text-blue-500 font-medium mb-1">Benefits:</p>
              <ul className="text-xs text-blue-500/90 list-disc list-inside space-y-1">
                <li>Track usage per project</li>
                <li>Use project-specific rate limits</li>
                <li>Organize costs by project</li>
                <li>Access project-specific features</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-accent" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel of your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={settings.theme}
                onValueChange={(value) => updateSetting('theme', value)}
              >
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <SettingsIcon className="h-4 w-4" />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select
                value={settings.dateFormat}
                onValueChange={(value) => updateSetting('dateFormat', value)}
              >
                <SelectTrigger id="dateFormat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timeFormat">Time Format</Label>
              <Select
                value={settings.timeFormat}
                onValueChange={(value) => updateSetting('timeFormat', value)}
              >
                <SelectTrigger id="timeFormat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                  <SelectItem value="24h">24-hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        {/* Data Refresh */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-accent" />
              Data Refresh
            </CardTitle>
            <CardDescription>
              Configure how often data is automatically refreshed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="dashboardRefresh">
                Dashboard Refresh Interval (seconds)
              </Label>
              <Input
                id="dashboardRefresh"
                type="number"
                min="10"
                max="300"
                value={settings.dashboardRefresh}
                onChange={(e) => updateSetting('dashboardRefresh', parseInt(e.target.value) || 30)}
              />
              <p className="text-xs text-muted-foreground">
                Current: {settings.dashboardRefresh} seconds
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="workshopRefresh">
                Workshop Stats Refresh (seconds)
              </Label>
              <Input
                id="workshopRefresh"
                type="number"
                min="10"
                max="300"
                value={settings.workshopRefresh}
                onChange={(e) => updateSetting('workshopRefresh', parseInt(e.target.value) || 30)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="communicationRefresh">
                Communication Stats Refresh (seconds)
              </Label>
              <Input
                id="communicationRefresh"
                type="number"
                min="10"
                max="300"
                value={settings.communicationRefresh}
                onChange={(e) => updateSetting('communicationRefresh', parseInt(e.target.value) || 30)}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-accent" />
              Notifications
            </CardTitle>
            <CardDescription>
              Control notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Show toast notifications for actions
                </p>
              </div>
              <Switch
                checked={settings.enableNotifications}
                onCheckedChange={(checked) => updateSetting('enableNotifications', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Success Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Show notifications for successful actions
                </p>
              </div>
              <Switch
                checked={settings.successNotifications}
                onCheckedChange={(checked) => updateSetting('successNotifications', checked)}
                disabled={!settings.enableNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Error Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Show notifications for errors
                </p>
              </div>
              <Switch
                checked={settings.errorNotifications}
                onCheckedChange={(checked) => updateSetting('errorNotifications', checked)}
                disabled={!settings.enableNotifications}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Dashboard Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-accent" />
              Dashboard Preferences
            </CardTitle>
            <CardDescription>
              Choose which sections to display on the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Show Quick Stats</Label>
              <Switch
                checked={settings.showQuickStats}
                onCheckedChange={(checked) => updateSetting('showQuickStats', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Show Workshop Statistics</Label>
              <Switch
                checked={settings.showWorkshopStats}
                onCheckedChange={(checked) => updateSetting('showWorkshopStats', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Show Communication Stats</Label>
              <Switch
                checked={settings.showCommunicationStats}
                onCheckedChange={(checked) => updateSetting('showCommunicationStats', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Show AI Recommendations</Label>
              <Switch
                checked={settings.showAIRecommendations}
                onCheckedChange={(checked) => updateSetting('showAIRecommendations', checked)}
              />
            </div>
            
          </CardContent>
        </Card>
        
        {/* Export Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-accent" />
              Export Preferences
            </CardTitle>
            <CardDescription>
              Configure default export settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="exportFormat">Default Export Format</Label>
              <Select
                value={settings.defaultExportFormat}
                onValueChange={(value) => updateSetting('defaultExportFormat', value)}
              >
                <SelectTrigger id="exportFormat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Include Metadata</Label>
                <p className="text-sm text-muted-foreground">
                  Include export date and version info
                </p>
              </div>
              <Switch
                checked={settings.includeMetadata}
                onCheckedChange={(checked) => updateSetting('includeMetadata', checked)}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Form Editor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              Form Editor
            </CardTitle>
            <CardDescription>
              Edit student check-in and calendar event forms. Switch between forms using the tabs below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormEditor 
              defaultFormId="101-checkin"
              onSave={() => {
                toast.success('Form configuration updated!')
              }}
            />
          </CardContent>
        </Card>
        
        {/* Legal & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              Legal & Privacy
            </CardTitle>
            <CardDescription>
              View our privacy policy and terms of service
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/50">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-accent" />
                <div>
                  <p className="font-medium text-card-foreground">Privacy Policy</p>
                  <p className="text-sm text-muted-foreground">
                    Learn how we handle your data and protect your privacy
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/privacy')}
                className="gap-2"
              >
                View
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/50">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-accent" />
                <div>
                  <p className="font-medium text-card-foreground">Terms of Service</p>
                  <p className="text-sm text-muted-foreground">
                    Read our terms and conditions of use
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/terms')}
                className="gap-2"
              >
                View
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/50 bg-destructive/5">
              <div>
                <p className="font-medium text-card-foreground">Clear All Data</p>
                <p className="text-sm text-muted-foreground">
                  Remove all locally stored data and reset to defaults
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                    localStorage.clear()
                    toast.success('All data cleared')
                    setTimeout(() => {
                      window.location.reload()
                    }, 1000)
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

