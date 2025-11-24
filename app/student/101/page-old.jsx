'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MessageSquare, Calendar, Clock, Loader2, CheckCircle2, Send, Plus, ClipboardList } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/theme-toggle'

export default function Student101Page() {
  const [activeTab, setActiveTab] = useState('checkin')
  const [isSubmittingCheckin, setIsSubmittingCheckin] = useState(false)
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false)
  const [checkinSubmitted, setCheckinSubmitted] = useState(false)
  const [eventSubmitted, setEventSubmitted] = useState(false)
  
  const [checkinForm, setCheckinForm] = useState({
    studentName: '',
    date: new Date().toISOString().split('T')[0],
    launchpadWeekRating: '',
    assignmentConfidence: '',
    assignmentAssistance: '',
    challengesBarriers: '',
    barrierAssistance: '',
    extraSupport: '',
    stepsTaken: '',
    highSchoolUpdates: '',
    highSchoolAssistance: '',
    beaconDeliverables: '',
    missingDeliverables: '',
    questionsFeedback: '',
  })

  const [eventForm, setEventForm] = useState({
    studentName: '',
    title: '',
    start: '',
    end: '',
    description: '',
    location: '',
  })

  const handleCheckinChange = (field, value) => {
    setCheckinForm(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleEventChange = (field, value) => {
    setEventForm(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCheckinSubmit = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!checkinForm.studentName.trim()) {
      toast.error('Please enter your name')
      return
    }

    if (!checkinForm.date) {
      toast.error('Please select today\'s date')
      return
    }

    if (!checkinForm.assignmentConfidence) {
      toast.error('Please indicate your confidence level about staying on track with assignments')
      return
    }

    if (!checkinForm.assignmentAssistance.trim()) {
      toast.error('Please describe what assistance you need to stay on track with assignments')
      return
    }

    if (!checkinForm.challengesBarriers) {
      toast.error('Please indicate if you are experiencing any challenges or barriers')
      return
    }

    if (!checkinForm.barrierAssistance.trim()) {
      toast.error('Please describe what assistance you need surrounding the indicated barrier(s)')
      return
    }

    if (!checkinForm.extraSupport.trim()) {
      toast.error('Please indicate any areas where you could use extra support')
      return
    }

    if (!checkinForm.stepsTaken.trim()) {
      toast.error('Please describe what steps you have taken to address challenges')
      return
    }

    if (!checkinForm.highSchoolUpdates) {
      toast.error('Please select a high school update option (select "None" if in Liftoff)')
      return
    }

    if (!checkinForm.beaconDeliverables) {
      toast.error('Please indicate if you are up to date with your Beacon deliverables')
      return
    }

    if (checkinForm.beaconDeliverables === 'No' && !checkinForm.missingDeliverables.trim()) {
      toast.error('Please list any deliverables you are missing')
      return
    }

    if (!checkinForm.questionsFeedback.trim()) {
      toast.error('Please provide any questions, feedback, or concerns')
      return
    }

    setIsSubmittingCheckin(true)
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentName: checkinForm.studentName,
          date: checkinForm.date,
          message: JSON.stringify(checkinForm), // Store full form data
          category: '101-checkin',
          rating: checkinForm.launchpadWeekRating || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Failed to submit check-in')
        return
      }

      const result = await response.json()
      
      toast.success('Check-in submitted successfully!', {
        description: 'Thank you for your check-in. Your responses have been recorded.',
      })
      
      // Reset form
      setCheckinForm({
        studentName: '',
        date: new Date().toISOString().split('T')[0],
        launchpadWeekRating: '',
        assignmentConfidence: '',
        assignmentAssistance: '',
        challengesBarriers: '',
        barrierAssistance: '',
        extraSupport: '',
        stepsTaken: '',
        highSchoolUpdates: '',
        highSchoolAssistance: '',
        beaconDeliverables: '',
        missingDeliverables: '',
        questionsFeedback: '',
      })
      setCheckinSubmitted(true)
      setTimeout(() => setCheckinSubmitted(false), 3000)
    } catch (error) {
      console.error('Error submitting check-in:', error)
      toast.error('Failed to submit check-in')
    } finally {
      setIsSubmittingCheckin(false)
    }
  }

  const handleEventSubmit = async (e) => {
    e.preventDefault()
    
    if (!eventForm.studentName.trim()) {
      toast.error('Please enter your name')
      return
    }

    if (!eventForm.title.trim()) {
      toast.error('Please enter an event title')
      return
    }

    if (!eventForm.start || !eventForm.end) {
      toast.error('Please select both start and end times')
      return
    }

    const startDate = new Date(eventForm.start)
    const endDate = new Date(eventForm.end)
    
    if (endDate <= startDate) {
      toast.error('End time must be after start time')
      return
    }

    setIsSubmittingEvent(true)
    try {
      const response = await fetch('/api/student-calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...eventForm,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Failed to submit calendar event')
        return
      }

      const result = await response.json()
      
      toast.success('Calendar event submitted successfully!', {
        description: 'Your event has been added to the calendar.',
      })
      
      // Reset form
      setEventForm({
        studentName: '',
        title: '',
        start: '',
        end: '',
        description: '',
        location: '',
      })
      setEventSubmitted(true)
      setTimeout(() => setEventSubmitted(false), 3000)
    } catch (error) {
      console.error('Error submitting calendar event:', error)
      toast.error('Failed to submit calendar event')
    } finally {
      setIsSubmittingEvent(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl w-full space-y-6 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              101 Student Portal
            </h1>
            <p className="text-sm text-muted-foreground">
              Submit check-in and request calendar events
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab('checkin')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'checkin'
                ? 'border-accent text-accent'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Bi-Weekly Check-in
            </div>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'calendar'
                ? 'border-accent text-accent'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar Event
            </div>
          </button>
        </div>

        {/* Check-in Form */}
        {activeTab === 'checkin' && (
          <Card className="border-2 border-border/70 bg-card transition-all duration-500 hover:border-accent hover:shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-card-foreground flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-accent" />
                101 Bi-Weekly Check-in Form
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                This check-in form is designed to help you reflect on your week, your progress, challenges, and successes to identify any support you may need related to Launchpad or your personal life. Your insights help us better understand how to support you on your journey.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {checkinSubmitted ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="rounded-full bg-accent/20 p-4">
                    <CheckCircle2 className="h-12 w-12 text-accent" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">Check-in Submitted!</h3>
                    <p className="text-sm text-muted-foreground">
                      Thank you for your check-in. Your responses have been recorded.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCheckinSubmit} className="space-y-6">
                  <div className="text-xs text-muted-foreground mb-4">* Indicates required question</div>

                  {/* Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="studentName">What is your name? *</Label>
                    <Input
                      id="studentName"
                      placeholder="Enter your name"
                      value={checkinForm.studentName}
                      onChange={(e) => handleCheckinChange('studentName', e.target.value)}
                      required
                      disabled={isSubmittingCheckin}
                    />
                  </div>

                  {/* Date */}
                  <div className="space-y-1.5">
                    <Label htmlFor="date">Today's Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={checkinForm.date}
                      onChange={(e) => handleCheckinChange('date', e.target.value)}
                      required
                      disabled={isSubmittingCheckin}
                    />
                  </div>

                  {/* Launchpad Week Rating */}
                  <div className="space-y-1.5">
                    <Label>How are things going at Launchpad for you this week?</Label>
                    <div className="flex gap-4 items-center">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <label key={num} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="launchpadWeekRating"
                            value={num}
                            checked={checkinForm.launchpadWeekRating === String(num)}
                            onChange={(e) => handleCheckinChange('launchpadWeekRating', e.target.value)}
                            disabled={isSubmittingCheckin}
                            className="w-4 h-4"
                          />
                          <span>{num}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Assignment Confidence */}
                  <div className="space-y-1.5">
                    <Label>How confident do you feel about staying on track with your assignments this week? *</Label>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">not confident</span>
                      <span className="text-xs text-muted-foreground">confident</span>
                    </div>
                    <div className="flex gap-4 items-center">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <label key={num} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="assignmentConfidence"
                            value={num}
                            checked={checkinForm.assignmentConfidence === String(num)}
                            onChange={(e) => handleCheckinChange('assignmentConfidence', e.target.value)}
                            disabled={isSubmittingCheckin}
                            className="w-4 h-4"
                            required
                          />
                          <span>{num}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Assignment Assistance */}
                  <div className="space-y-1.5">
                    <Label htmlFor="assignmentAssistance">What assistance do you feel you need to stay on track with your assignments? *</Label>
                    <Textarea
                      id="assignmentAssistance"
                      placeholder="Describe what assistance you need..."
                      value={checkinForm.assignmentAssistance}
                      onChange={(e) => handleCheckinChange('assignmentAssistance', e.target.value)}
                      required
                      disabled={isSubmittingCheckin}
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  {/* Challenges/Barriers */}
                  <div className="space-y-1.5">
                    <Label>Are you currently experiencing any challenges or barriers? (Personal, academic, or professional) *</Label>
                    <div className="flex flex-col gap-2">
                      {['Personal', 'Academic', 'Professional', 'Other', 'None'].map((option) => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="challengesBarriers"
                            value={option}
                            checked={checkinForm.challengesBarriers === option}
                            onChange={(e) => handleCheckinChange('challengesBarriers', e.target.value)}
                            disabled={isSubmittingCheckin}
                            className="w-4 h-4"
                            required
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Barrier Assistance */}
                  <div className="space-y-1.5">
                    <Label htmlFor="barrierAssistance">What assistance do you feel you need surrounding the indicated barrier(s)? *</Label>
                    <Textarea
                      id="barrierAssistance"
                      placeholder="Describe what assistance you need..."
                      value={checkinForm.barrierAssistance}
                      onChange={(e) => handleCheckinChange('barrierAssistance', e.target.value)}
                      required
                      disabled={isSubmittingCheckin}
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  {/* Extra Support */}
                  <div className="space-y-1.5">
                    <Label htmlFor="extraSupport">Are there any areas where you could use extra support? (resources, stress, mental health, time management, clothing, food, transportation, etc.) *</Label>
                    <Textarea
                      id="extraSupport"
                      placeholder="List any areas where you need extra support..."
                      value={checkinForm.extraSupport}
                      onChange={(e) => handleCheckinChange('extraSupport', e.target.value)}
                      required
                      disabled={isSubmittingCheckin}
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  {/* Steps Taken */}
                  <div className="space-y-1.5">
                    <Label htmlFor="stepsTaken">If you're facing challenges, what steps have you already taken to address them? *</Label>
                    <Textarea
                      id="stepsTaken"
                      placeholder="Describe the steps you've taken..."
                      value={checkinForm.stepsTaken}
                      onChange={(e) => handleCheckinChange('stepsTaken', e.target.value)}
                      required
                      disabled={isSubmittingCheckin}
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  {/* High School Updates */}
                  <div className="space-y-1.5">
                    <Label>Are there any high school updates you'd like to discuss? For 101 student only. Liftoff please select none. *</Label>
                    <p className="text-xs text-muted-foreground mb-2">For 101 student only. Liftoff please select none.</p>
                    <div className="flex flex-col gap-2">
                      {['Credits', 'Class Updates', 'Counselor Meetings', 'Attendance Challenges', 'College Readiness', 'None', 'Option 7'].map((option) => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="highSchoolUpdates"
                            value={option}
                            checked={checkinForm.highSchoolUpdates === option}
                            onChange={(e) => handleCheckinChange('highSchoolUpdates', e.target.value)}
                            disabled={isSubmittingCheckin}
                            className="w-4 h-4"
                            required
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* High School Assistance */}
                  <div className="space-y-1.5">
                    <Label htmlFor="highSchoolAssistance">What assistant do you feel you need surrounding high school? *Skip if you are in Liftoff</Label>
                    <Textarea
                      id="highSchoolAssistance"
                      placeholder="Describe what assistance you need (skip if in Liftoff)..."
                      value={checkinForm.highSchoolAssistance}
                      onChange={(e) => handleCheckinChange('highSchoolAssistance', e.target.value)}
                      disabled={isSubmittingCheckin}
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  {/* Beacon Deliverables */}
                  <div className="space-y-1.5">
                    <Label>Are you up to date with your Beacon deliverables? *</Label>
                    <div className="flex flex-col gap-2">
                      {['Yes', 'No', 'I\'m not sure'].map((option) => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="beaconDeliverables"
                            value={option}
                            checked={checkinForm.beaconDeliverables === option}
                            onChange={(e) => handleCheckinChange('beaconDeliverables', e.target.value)}
                            disabled={isSubmittingCheckin}
                            className="w-4 h-4"
                            required
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Missing Deliverables */}
                  {checkinForm.beaconDeliverables === 'No' && (
                    <div className="space-y-1.5">
                      <Label htmlFor="missingDeliverables">If no, list any deliverables you're missing. *</Label>
                      <Textarea
                        id="missingDeliverables"
                        placeholder="List any missing deliverables..."
                        value={checkinForm.missingDeliverables}
                        onChange={(e) => handleCheckinChange('missingDeliverables', e.target.value)}
                        required={checkinForm.beaconDeliverables === 'No'}
                        disabled={isSubmittingCheckin}
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  )}

                  {/* Questions/Feedback/Concerns */}
                  <div className="space-y-1.5">
                    <Label htmlFor="questionsFeedback">Do you have any questions, feedback, or concerns? *</Label>
                    <Textarea
                      id="questionsFeedback"
                      placeholder="Share any questions, feedback, or concerns..."
                      value={checkinForm.questionsFeedback}
                      onChange={(e) => handleCheckinChange('questionsFeedback', e.target.value)}
                      required
                      disabled={isSubmittingCheckin}
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full gap-2"
                    size="lg"
                    disabled={isSubmittingCheckin}
                  >
                    {isSubmittingCheckin ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Submit Check-in
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        {/* Calendar Event Form */}
        {activeTab === 'calendar' && (
          <Card className="border-2 border-border/70 bg-card transition-all duration-500 hover:border-accent hover:shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-card-foreground flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent" />
                Request Calendar Event
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Submit an event request to be added to the calendar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {eventSubmitted ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="rounded-full bg-accent/20 p-4">
                    <CheckCircle2 className="h-12 w-12 text-accent" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">Event Request Submitted!</h3>
                    <p className="text-sm text-muted-foreground">
                      Your event request has been sent and will be reviewed.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleEventSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="eventStudentName">Your Name *</Label>
                    <Input
                      id="eventStudentName"
                      placeholder="Enter your name"
                      value={eventForm.studentName}
                      onChange={(e) => handleEventChange('studentName', e.target.value)}
                      required
                      disabled={isSubmittingEvent}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Study Session, Meeting, Workshop"
                      value={eventForm.title}
                      onChange={(e) => handleEventChange('title', e.target.value)}
                      required
                      disabled={isSubmittingEvent}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="start">Start Date & Time *</Label>
                      <Input
                        id="start"
                        type="datetime-local"
                        value={eventForm.start}
                        onChange={(e) => handleEventChange('start', e.target.value)}
                        required
                        disabled={isSubmittingEvent}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="end">End Date & Time *</Label>
                      <Input
                        id="end"
                        type="datetime-local"
                        value={eventForm.end}
                        onChange={(e) => handleEventChange('end', e.target.value)}
                        required
                        disabled={isSubmittingEvent}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="location">Location (Optional)</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Room 101, Online, Zoom Meeting"
                      value={eventForm.location}
                      onChange={(e) => handleEventChange('location', e.target.value)}
                      disabled={isSubmittingEvent}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Add any additional details about the event..."
                      value={eventForm.description}
                      onChange={(e) => handleEventChange('description', e.target.value)}
                      disabled={isSubmittingEvent}
                      rows={4}
                      className="resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full gap-2"
                    size="lg"
                    disabled={isSubmittingEvent}
                  >
                    {isSubmittingEvent ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Submit Event Request
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="border border-border/50 bg-card/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-accent/20 p-2">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">How it works</p>
                <p className="text-xs text-muted-foreground">
                  {activeTab === 'checkin' 
                    ? 'Your check-in responses will be reviewed to help us better understand how to support you on your journey. All responses are confidential.'
                    : 'Your calendar event request will be reviewed and added to the calendar if approved. You will be notified once the event is processed.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

