'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, User, Calendar, Loader2, Trash2, RefreshCw, Eye, Filter } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function StudentFeedbackManager() {
  const [isLoading, setIsLoading] = useState(false)
  const [feedbacks, setFeedbacks] = useState([])
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [filterCategory, setFilterCategory] = useState('all')

  useEffect(() => {
    fetchFeedbacks()
    const handleFeedbackUpdate = () => {
      fetchFeedbacks()
    }
    window.addEventListener('feedbackUpdated', handleFeedbackUpdate)
    
    return () => {
      window.removeEventListener('feedbackUpdated', handleFeedbackUpdate)
    }
  }, [])

  const fetchFeedbacks = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/feedback')
      if (response.ok) {
        const result = await response.json()
        if (result.feedbacks) {
          // Explicitly filter out any calendar requests - they should only appear in Student Calendar Requests
          const filteredFeedbacks = result.feedbacks.filter(feedback => {
            // Exclude calendar-related items
            const isCalendarRequest = 
              feedback.category === 'calendar' ||
              feedback.category === 'scheduling' ||
              feedback.message?.toLowerCase().includes('calendar request') ||
              feedback.message?.toLowerCase().includes('calendar event') ||
              feedback.id?.startsWith('student-event-')
            return !isCalendarRequest
          })
          setFeedbacks(filteredFeedbacks)
        }
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this feedback?')) {
      return
    }

    try {
      const response = await fetch(`/api/feedback?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Feedback deleted successfully')
        fetchFeedbacks()
        window.dispatchEvent(new Event('feedbackUpdated'))
      } else {
        toast.error('Failed to delete feedback')
      }
    } catch (error) {
      console.error('Error deleting feedback:', error)
      toast.error('Failed to delete feedback')
    }
  }

  const handleView = (feedback) => {
    setSelectedFeedback(feedback)
    setIsViewDialogOpen(true)
  }

  const parseFeedbackData = (feedback) => {
    try {
      if (feedback.message && feedback.message.startsWith('{')) {
        return JSON.parse(feedback.message)
      }
      return null
    } catch {
      return null
    }
  }

  const getCategoryLabel = (category) => {
    const labels = {
      'checkin': 'Check-in',
      '101-checkin': '101 Check-in',
      'liftoff-checkin': 'Liftoff Check-in',
      'general': 'General',
      'workshop': 'Workshop',
      'communication': 'Communication',
      'scheduling': 'Scheduling',
      'other': 'Other',
    }
    return labels[category] || category
  }

  const filteredFeedbacks = filterCategory === 'all' 
    ? feedbacks 
    : feedbacks.filter(f => f.category === filterCategory)

  const categories = [...new Set(feedbacks.map(f => f.category))]

  return (
    <Card className="border-2 border-border/70 bg-card transition-all duration-500 hover:border-accent hover:shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-card-foreground flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-accent" />
              Student Feedback & Check-ins
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              View and manage student feedback and check-in submissions. Calendar requests are managed separately in the Student Calendar Requests section.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={fetchFeedbacks}
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {feedbacks.length > 0 && (
          <div className="flex items-center gap-2 mt-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {getCategoryLabel(cat)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredFeedbacks.length > 0 ? (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredFeedbacks.map((feedback) => {
              const parsedData = parseFeedbackData(feedback)
              const isCheckin = parsedData !== null
              
              return (
                <div
                  key={feedback.id}
                  className="group rounded-lg border border-border/50 bg-gradient-to-br from-secondary/40 to-secondary/20 p-3 transition-all duration-300 hover:border-accent/50 hover:bg-secondary/60 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <User className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                        <span className="text-sm font-semibold text-card-foreground">
                          {feedback.studentName || 'Anonymous'}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {getCategoryLabel(feedback.category)}
                        </Badge>
                        {feedback.rating && (
                          <Badge variant="secondary" className="text-xs">
                            ⭐ {feedback.rating}/5
                          </Badge>
                        )}
                        <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {isCheckin ? (
                        <div className="space-y-1">
                          {parsedData.questionsFeedback && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              <span className="font-medium">Q&A: </span>
                              {parsedData.questionsFeedback}
                            </p>
                          )}
                          {parsedData.assignmentConfidence && (
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium">Assignment Confidence: </span>
                              {parsedData.assignmentConfidence}/5
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {feedback.message}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => handleView(feedback)}
                        title="View Details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(feedback.id)}
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
            No feedback submissions yet.
          </div>
        )}
      </CardContent>

      {/* View Feedback Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-accent" />
              Feedback Details
            </DialogTitle>
            <DialogDescription>
              Review the full feedback submission
            </DialogDescription>
          </DialogHeader>
          {selectedFeedback && (() => {
            const parsedData = parseFeedbackData(selectedFeedback)
            const isCheckin = parsedData !== null

            return (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Student Name</p>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-card-foreground">
                        {selectedFeedback.studentName || 'Anonymous'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Date</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-card-foreground">
                        {new Date(selectedFeedback.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {isCheckin ? (
                  <div className="space-y-4">
                    {parsedData.date && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Check-in Date</p>
                        <p className="text-sm text-card-foreground">{parsedData.date}</p>
                      </div>
                    )}
                    {parsedData.launchpadWeekRating && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">How are things going at Launchpad this week?</p>
                        <p className="text-sm text-card-foreground">{parsedData.launchpadWeekRating}/5</p>
                      </div>
                    )}
                    {parsedData.assignmentConfidence && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Assignment Confidence</p>
                        <p className="text-sm text-card-foreground">{parsedData.assignmentConfidence}/5</p>
                      </div>
                    )}
                    {parsedData.assignmentAssistance && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Assignment Assistance Needed</p>
                        <div className="p-3 rounded-lg bg-secondary/40 border border-border/50">
                          <p className="text-sm text-card-foreground whitespace-pre-wrap">{parsedData.assignmentAssistance}</p>
                        </div>
                      </div>
                    )}
                    {parsedData.challengesBarriers && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Challenges/Barriers</p>
                        <p className="text-sm text-card-foreground">{parsedData.challengesBarriers}</p>
                      </div>
                    )}
                    {parsedData.barrierAssistance && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Barrier Assistance Needed</p>
                        <div className="p-3 rounded-lg bg-secondary/40 border border-border/50">
                          <p className="text-sm text-card-foreground whitespace-pre-wrap">{parsedData.barrierAssistance}</p>
                        </div>
                      </div>
                    )}
                    {parsedData.extraSupport && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Areas for Extra Support</p>
                        <div className="p-3 rounded-lg bg-secondary/40 border border-border/50">
                          <p className="text-sm text-card-foreground whitespace-pre-wrap">{parsedData.extraSupport}</p>
                        </div>
                      </div>
                    )}
                    {parsedData.stepsTaken && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Steps Taken to Address Challenges</p>
                        <div className="p-3 rounded-lg bg-secondary/40 border border-border/50">
                          <p className="text-sm text-card-foreground whitespace-pre-wrap">{parsedData.stepsTaken}</p>
                        </div>
                      </div>
                    )}
                    {parsedData.highSchoolUpdates && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">High School Updates</p>
                        <p className="text-sm text-card-foreground">{parsedData.highSchoolUpdates}</p>
                      </div>
                    )}
                    {parsedData.highSchoolAssistance && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">High School Assistance Needed</p>
                        <div className="p-3 rounded-lg bg-secondary/40 border border-border/50">
                          <p className="text-sm text-card-foreground whitespace-pre-wrap">{parsedData.highSchoolAssistance}</p>
                        </div>
                      </div>
                    )}
                    {parsedData.beaconDeliverables && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Beacon Deliverables Status</p>
                        <p className="text-sm text-card-foreground">{parsedData.beaconDeliverables}</p>
                      </div>
                    )}
                    {parsedData.missingDeliverables && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Missing Deliverables</p>
                        <div className="p-3 rounded-lg bg-secondary/40 border border-border/50">
                          <p className="text-sm text-card-foreground whitespace-pre-wrap">{parsedData.missingDeliverables}</p>
                        </div>
                      </div>
                    )}
                    {parsedData.questionsFeedback && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Questions, Feedback, or Concerns</p>
                        <div className="p-3 rounded-lg bg-secondary/40 border border-border/50">
                          <p className="text-sm text-card-foreground whitespace-pre-wrap">{parsedData.questionsFeedback}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Message</p>
                    <div className="p-3 rounded-lg bg-secondary/40 border border-border/50">
                      <p className="text-sm text-card-foreground whitespace-pre-wrap">{selectedFeedback.message}</p>
                    </div>
                  </div>
                )}

                {selectedFeedback.rating && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Rating</p>
                    <p className="text-sm text-card-foreground">⭐ {selectedFeedback.rating}/5</p>
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

