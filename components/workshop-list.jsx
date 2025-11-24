'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Users, Clock, Star, Download, MoreVertical, Loader2, RefreshCw, Calendar, Video, Settings } from 'lucide-react'
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

export function WorkshopList({ searchQuery = '' }) {
  const router = useRouter()
  const [workshops, setWorkshops] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [sources, setSources] = useState([])
  
  useEffect(() => {
    fetchWorkshops()
    // Refresh every 30 seconds to get new workshops
    const interval = setInterval(fetchWorkshops, 30000)
    
    // Listen for workshop creation events
    const handleWorkshopUpdate = () => {
      fetchWorkshops()
    }
    window.addEventListener('workshopUpdated', handleWorkshopUpdate)
    
    // Listen for storage events (cross-tab communication)
    const handleStorageChange = (e) => {
      if (e.key === 'workshop_created' || e.key === 'workshop_updated') {
        fetchWorkshops()
        // Clear the trigger after using it
        if (e.key === 'workshop_created') {
          localStorage.removeItem('workshop_created')
        }
        if (e.key === 'workshop_updated') {
          localStorage.removeItem('workshop_updated')
        }
      }
    }
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('workshopUpdated', handleWorkshopUpdate)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])
  
  const fetchWorkshops = async () => {
    setIsLoading(true)
    try {
      // Get Google Calendar token if available
      const calendarToken = localStorage.getItem('google_token') || localStorage.getItem('google_calendar_token')
      const headers = calendarToken ? {
        'Authorization': `Bearer ${calendarToken}`
      } : {}
      
      const response = await fetch('/api/workshops/list?limit=10&sync=true', {
        headers
      })
      if (response.ok) {
        const result = await response.json()
        if (result.workshops) {
          setWorkshops(result.workshops)
        }
        if (result.sources) {
          setSources(result.sources)
        }
      }
    } catch (error) {
      console.error('Error fetching workshops:', error)
      // Use fallback data (already set in state)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Filter workshops based on search query
  const filteredWorkshops = workshops.filter(workshop => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      workshop.title.toLowerCase().includes(query) ||
      workshop.status.toLowerCase().includes(query) ||
      workshop.date.includes(query) ||
      workshop.students.toString().includes(query) ||
      workshop.duration.toLowerCase().includes(query)
    )
  })

  const handleExport = (workshop) => {
    const filename = `${workshop.title.toLowerCase().replace(/\s+/g, '_')}_${workshop.date}.json`
    const data = JSON.stringify({
      title: workshop.title,
      students: workshop.students,
      duration: workshop.duration,
      rating: workshop.rating,
      status: workshop.status,
      date: workshop.date,
    }, null, 2)
    
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success(`Workshop data exported!`, {
      description: `Downloaded ${workshop.title} as ${filename}`,
    })
  }

  const handleBulkExport = () => {
    const exportData = JSON.stringify(filteredWorkshops, null, 2)
    const blob = new Blob([exportData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `workshops-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(`Exported ${filteredWorkshops.length} workshops!`)
  }
  
  const handleRefresh = () => {
    fetchWorkshops()
    toast.success('Workshop list refreshed!')
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const calendarToken = localStorage.getItem('google_token') || localStorage.getItem('google_calendar_token')
      const headers = calendarToken ? {
        'Authorization': `Bearer ${calendarToken}`
      } : {}
      
      const response = await fetch('/api/workshops/sync', {
        headers
      })
      
      if (response.ok) {
        const result = await response.json()
        toast.success('Workshops synced successfully', {
          description: `Found ${result.syncResults.google_calendar?.count || 0} from Calendar`,
        })
        // Refresh the list
        fetchWorkshops()
      } else {
        toast.error('Sync failed', {
          description: 'Could not sync workshops from APIs',
        })
      }
    } catch (error) {
      console.error('Error syncing workshops:', error)
      toast.error('Sync failed', {
        description: error.message || 'Could not sync workshops',
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <Card className="border-2 border-border/70 bg-card transition-all duration-500 hover:border-accent hover:shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-card-foreground">Recent Workshops</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Your workshop history and statistics
              {sources.length > 0 && (
                <span className="ml-2 text-xs">
                  ({sources.includes('google_calendar') && '📅 Calendar '}
                  {sources.includes('manual') && '✏️ Manual'})
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={handleSync}
              disabled={isSyncing}
              title="Sync from APIs"
            >
              <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
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
                <DropdownMenuItem onClick={handleRefresh}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh List
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBulkExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export All ({filteredWorkshops.length})
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast.info('Sort options coming soon')}>
                  <FileText className="mr-2 h-4 w-4" />
                  Sort Options
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        ) : filteredWorkshops.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm font-medium text-muted-foreground">No workshops found</p>
            <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filteredWorkshops.map((workshop) => (
            <div
              key={workshop.id}
              className="group rounded-lg border border-border/50 bg-gradient-to-br from-secondary/40 to-secondary/20 p-2 transition-all duration-300 hover:border-accent/50 hover:bg-secondary/60 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-accent" />
                    <h3 className="text-sm font-semibold text-card-foreground">{workshop.title}</h3>
                    <Badge
                      variant={workshop.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {workshop.status}
                    </Badge>
                    {workshop.source === 'google_calendar' && (
                      <Calendar className="h-3 w-3 text-blue-500" title="From Google Calendar" />
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span className="font-medium">{workshop.students}</span>
                      <span>students</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{workshop.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{workshop.rating}</span>
                    </div>
                    <span className="text-xs">{workshop.date}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => handleExport(workshop)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

