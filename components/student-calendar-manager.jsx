'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, User, Clock, Loader2, Trash2, RefreshCw, Eye, CheckCircle2, Filter } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function StudentCalendarManager() {
  const [isLoading, setIsLoading] = useState(false)
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  useEffect(() => {
    fetchEvents()
    const handleEventUpdate = () => {
      fetchEvents()
    }
    window.addEventListener('calendarEventUpdated', handleEventUpdate)
    
    return () => {
      window.removeEventListener('calendarEventUpdated', handleEventUpdate)
    }
  }, [])

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/student-calendar')
      if (response.ok) {
        const result = await response.json()
        if (result.events) {
          setEvents(result.events)
        }
      }
    } catch (error) {
      console.error('Error fetching calendar events:', error)
    } finally {
      setIsLoading(false)
    }
  }


  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this event request?')) {
      return
    }

    try {
      const response = await fetch(`/api/student-calendar?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Event deleted successfully')
        fetchEvents()
        window.dispatchEvent(new Event('calendarEventUpdated'))
      } else {
        toast.error('Failed to delete event')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Failed to delete event')
    }
  }

  const handleView = (event) => {
    setSelectedEvent(event)
    setIsViewDialogOpen(true)
  }

  const getStatusBadge = (status) => {
    if (status === 'added' || status === 'approved') {
      return (
        <Badge variant="default" className="text-xs flex items-center gap-1 bg-green-600">
          <CheckCircle2 className="h-3 w-3" />
          Added to Calendar
        </Badge>
      )
    }
    if (status === 'failed') {
      return (
        <Badge variant="destructive" className="text-xs flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Failed
        </Badge>
      )
    }
    return (
      <Badge variant="default" className="text-xs flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending'}
      </Badge>
    )
  }

  return (
    <Card className="border-2 border-border/70 bg-card transition-all duration-500 hover:border-accent hover:shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-card-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              Student Calendar Requests
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              View student calendar events (automatically added to your calendar)
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={fetchEvents}
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {events.map((event) => {
              const startDate = new Date(event.start)
              const endDate = new Date(event.end)
              
              return (
                <div
                  key={event.id}
                  className="group rounded-lg border border-border/50 bg-gradient-to-br from-secondary/40 to-secondary/20 p-3 transition-all duration-300 hover:border-accent/50 hover:bg-secondary/60 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <User className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                        <span className="text-sm font-semibold text-card-foreground">
                          {event.studentName}
                        </span>
                        {getStatusBadge(event.status)}
                        <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          {startDate.toLocaleDateString()}
                        </span>
                        <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          {startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - {endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-card-foreground">
                        {event.title}
                      </p>
                      {event.location && (
                        <p className="text-xs text-muted-foreground">
                          📍 {event.location}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => handleView(event)}
                        title="View Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(event.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No calendar event requests yet.
          </div>
        )}
      </CardContent>

      {/* View Event Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              Calendar Event Details
            </DialogTitle>
            <DialogDescription>
              Review the full event request details
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (() => {
            const startDate = new Date(selectedEvent.start)
            const endDate = new Date(selectedEvent.end)
            
            return (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Student Name</p>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-card-foreground">
                        {selectedEvent.studentName}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    {getStatusBadge(selectedEvent.status)}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Event Title</p>
                  <p className="text-sm font-medium text-card-foreground">{selectedEvent.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Start Date & Time</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-card-foreground">
                        {startDate.toLocaleString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">End Date & Time</p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-card-foreground">
                        {endDate.toLocaleString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedEvent.location && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <p className="text-sm text-card-foreground">{selectedEvent.location}</p>
                  </div>
                )}

                {selectedEvent.description && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <div className="p-3 rounded-lg bg-secondary/40 border border-border/50">
                      <p className="text-sm text-card-foreground whitespace-pre-wrap">
                        {selectedEvent.description}
                      </p>
                    </div>
                  </div>
                )}

                {selectedEvent.calendarEventId && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      ✓ Event added to Google Calendar
                    </p>
                  </div>
                )}
                {selectedEvent.status === 'failed' && selectedEvent.calendarError && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-destructive">
                      ⚠ Failed to add to calendar: {selectedEvent.calendarError}
                    </p>
                  </div>
                )}
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>
    </Card>
  )
}

