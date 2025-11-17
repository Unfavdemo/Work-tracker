'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { recentWorkshops } from '@/lib/data'
import { FileText, Users, Clock, Star, Download, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function WorkshopList({ searchQuery = '' }) {
  // Filter workshops based on search query
  const filteredWorkshops = recentWorkshops.filter(workshop => {
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

  const handleMenuClick = () => {
    toast.info('Workshop List Options', {
      description: 'Sort, filter, or bulk export workshops',
    })
  }

  return (
    <Card className="border-2 border-border/70 bg-card transition-all duration-500 hover:border-accent hover:shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-card-foreground">Recent Workshops</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Your workshop history and statistics
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleMenuClick}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredWorkshops.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm font-medium text-muted-foreground">No workshops found</p>
            <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredWorkshops.map((workshop) => (
            <div
              key={workshop.id}
              className="group rounded-lg border border-border/50 bg-gradient-to-br from-secondary/40 to-secondary/20 p-3 transition-all duration-300 hover:border-accent/50 hover:bg-secondary/60 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-accent" />
                    <h3 className="text-sm font-semibold text-card-foreground">{workshop.title}</h3>
                    <Badge
                      variant={workshop.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {workshop.status}
                    </Badge>
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

