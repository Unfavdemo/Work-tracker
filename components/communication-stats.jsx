'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, Filter, MoreVertical, Loader2, Mail, MessageSquare, Users, MessageCircle, Download, RefreshCw, Settings, Calendar } from 'lucide-react'
import { communicationData } from '@/lib/data'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Icon mapping for communication stats
const iconMap = {
  Mail,
  MessageSquare,
  Users,
  MessageCircle,
}

export function CommunicationStats() {
  const router = useRouter()
  const [filter, setFilter] = useState('all')
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    fetchCommunicationStats()
    // Refresh every 30 seconds
    const interval = setInterval(fetchCommunicationStats, 30000)
    
    // Listen for workshop update events
    const handleWorkshopUpdate = () => {
      fetchCommunicationStats()
    }
    window.addEventListener('workshopUpdated', handleWorkshopUpdate)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('workshopUpdated', handleWorkshopUpdate)
    }
  }, [])
  
  const fetchCommunicationStats = async () => {
    setIsLoading(true)
    try {
      // Get Gmail token from localStorage if available
      const gmailToken = localStorage.getItem('google_token') || localStorage.getItem('gmail_token')
      
      // Build headers with Gmail token if available
      const headers = {}
      if (gmailToken) {
        headers['Authorization'] = `Bearer ${gmailToken}`
      }
      
      const response = await fetch('/api/communication/stats', {
        headers
      })
      if (response.ok) {
        const result = await response.json()
        if (result.stats) {
          setData(result.stats)
          applyFilter(result.stats, filter)
        } else {
          setData([])
          setFilteredData([])
        }
      } else {
        setData([])
        setFilteredData([])
      }
    } catch (error) {
      console.error('Error fetching communication stats:', error)
      setData([])
      setFilteredData([])
    } finally {
      setIsLoading(false)
    }
  }
  
  const applyFilter = (dataToFilter, filterType) => {
    if (filterType === 'all') {
      setFilteredData(dataToFilter)
    } else {
      setFilteredData(dataToFilter.filter(item => item.type === filterType))
    }
  }
  
  useEffect(() => {
    applyFilter(data, filter)
  }, [filter, data])
  
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
    toast.success(`Filtered to: ${newFilter === 'all' ? 'All Types' : newFilter}`)
  }
  
  const handleExport = () => {
    const exportData = JSON.stringify(filteredData.length > 0 ? filteredData : data, null, 2)
    const blob = new Blob([exportData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `communication-stats-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Communication stats exported!')
  }
  
  const handleRefresh = () => {
    fetchCommunicationStats()
    toast.success('Communication stats refreshed!')
  }
  
  return (
    <Card className="group border-2 border-border/70 bg-card transition-all duration-500 hover:border-accent hover:shadow-2xl pt-0">
      <CardHeader className="pt-3 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-card-foreground">Student Communication</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Track all communication channels
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Filter className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleFilterChange('all')}>
                  <Users className="mr-2 h-5 w-5" />
                  All Types
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange('Emails')}>
                  <Mail className="mr-2 h-5 w-5" />
                  Emails
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange('Meetings')}>
                  <Users className="mr-2 h-5 w-5" />
                  Meetings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange('Conversations')}>
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Conversations
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange('Slack')}>
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Slack
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleRefresh}>
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Refresh Data
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExport}>
                  <Download className="mr-2 h-5 w-5" />
                  Export Data
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  <Settings className="mr-2 h-5 w-5" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="w-full h-full flex flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 flex-1">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="space-y-4 w-full flex-1">
            {(filteredData.length > 0 ? filteredData : data).map((item, index) => {
            // Handle both string icon names (from API) and component icons (from static data)
            const Icon = typeof item.icon === 'string' 
              ? (iconMap[item.icon] || Mail) 
              : (item.icon || Mail)
            return (
              <div 
                key={item.type} 
                className="group relative overflow-hidden rounded-lg border border-border/50 bg-gradient-to-br from-secondary/40 to-secondary/20 p-5 transition-all duration-500 hover:scale-[1.02] hover:border-accent/50 hover:bg-secondary/60 hover:shadow-lg w-full"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative space-y-3 w-full">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="relative rounded-lg bg-gradient-to-br p-3 shadow-md transition-all duration-500 group-hover:scale-110 group-hover:rotate-3" style={{ background: `linear-gradient(135deg, ${item.color}20, ${item.color}10)` }}>
                        <Icon className="h-6 w-6 transition-colors" style={{ color: item.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-semibold text-card-foreground">{item.type}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-muted-foreground">This month</p>
                          {item.trend !== undefined && (
                            <div className={cn(
                              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-medium backdrop-blur-sm",
                              item.trend > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                            )}>
                              {item.trend > 0 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              {Math.abs(item.trend)}%
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-3xl font-bold text-card-foreground">{item.count}</span>
                      <p className="text-sm text-muted-foreground">
                        {item.type === 'Emails' ? 'received' : 'messages'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 w-full">
                    <div className="flex items-center justify-between text-sm w-full">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium text-card-foreground">{item.progress}% of target</span>
                    </div>
                    <div className="relative w-full">
                      <Progress 
                        value={item.progress} 
                        className="h-4 transition-all duration-700 w-full" 
                      />
                      <div 
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                        style={{ background: `linear-gradient(90deg, transparent, ${item.color}40, transparent)` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

