'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, Plus, MoreVertical } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { upcomingEvents } from '@/lib/data'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function SchedulePanel({ searchQuery = '' }) {
  // Filter events based on search query
  const filteredEvents = upcomingEvents.filter(event => {
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
              Upcoming workshops and sessions
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
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
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm font-medium text-muted-foreground">No events found</p>
            <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
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
              </div>
            </div>
          </div>
            ))}
          </>
        )}
        <Button 
          variant="outline" 
          className="w-full mt-4 border-dashed border-2 hover:border-accent/50 hover:bg-accent/5 transition-all"
          onClick={handleAddEvent}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Event
        </Button>
      </CardContent>
    </Card>
  )
}

