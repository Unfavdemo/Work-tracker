'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Loader2, FileText, Save, Trash2, Clock, FolderOpen } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { saveDraft, getDrafts, deleteDraft, getDraft } from '@/lib/drafts'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function WorkshopCreator({ onWorkshopCreated }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentDraftId, setCurrentDraftId] = useState(null)
  const [drafts, setDrafts] = useState([])
  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    weekOverview: '',
    date: new Date().toISOString().split('T')[0],
    rating: '',
    status: 'in_progress',
    
    // Rubric & Competency
    rubricFocus: '',
    competencyFocus: '',
    indicatorFocus: '',
    
    // Student Objectives (comma-separated or one per line)
    studentObjectives: '',
    
    // CCC Rubric Levels
    cccCode: '',
    cccTitle: '',
    level6: '',
    level8: '',
    level10: '',
    level12: '',
    
    // Workshop Content
    openingQuestion: '',
    introOverview: '',
    activities: '',
    journalReflection: '',
    activityStructure: '',
    checkout: '',
  })

  // Load drafts when component mounts or form opens
  useEffect(() => {
    if (isOpen) {
      loadDrafts()
    }
  }, [isOpen])

  const loadDrafts = () => {
    const savedDrafts = getDrafts()
    setDrafts(savedDrafts)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Please enter a slide deck title')
      return
    }
    
    if (!formData.studentObjectives.trim()) {
      toast.error('Please enter at least one student objective')
      return
    }

    setIsLoading(true)
    try {
      // Step 1: Create the workshop
      const response = await fetch('/api/workshops/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Failed to create workshop')
        return
      }

      const result = await response.json()
      
      // Step 2: Create Google Doc if user is authenticated
      const token = localStorage.getItem('google_token') || localStorage.getItem('google_calendar_token')
      let docLink = null
      
      if (token) {
        try {
          // Generate document content with better formatting
          const formatDate = (dateString) => {
            try {
              return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            } catch {
              return dateString
            }
          }

          // Format date as MM/DD/YY
          const formatDateShort = (dateString) => {
            try {
              const date = new Date(dateString)
              const month = String(date.getMonth() + 1).padStart(2, '0')
              const day = String(date.getDate()).padStart(2, '0')
              const year = String(date.getFullYear()).slice(-2)
              return `${month}/${day}/${year}`
            } catch {
              return dateString
            }
          }

          // Format date for display
          const dateStr = formData.date ? formatDateShort(formData.date) : ''

          // Parse student objectives (split by newlines or commas)
          const objectives = formData.studentObjectives
            ? formData.studentObjectives.split(/\n|,/)
              .map(obj => obj.trim())
              .filter(obj => obj.length > 0)
            : []

          // Build the slide deck document
          let docContent = `Slide Deck:\n\n\n`
          
          // Week Overview
          if (formData.weekOverview) {
            docContent += `${formData.weekOverview}\n\n`
          }
          
          // Rubric Focus
          if (formData.rubricFocus) {
            docContent += `Rubric Focus\n\n${formData.rubricFocus}\n\n`
          }
          
          // Date
          if (dateStr) {
            docContent += `Date\n\n${dateStr}\n\n`
          }
          
          // Competency Focus
          if (formData.competencyFocus) {
            docContent += `Competency Focus\n\n${formData.competencyFocus}\n\n\n`
          }
          
          // Indicator Focus
          if (formData.indicatorFocus) {
            docContent += `Indicator Focus\n\n${formData.indicatorFocus}\n\n\n`
          }
          
          // Student Objectives & Rubric Review
          if (objectives.length > 0) {
            docContent += `Student Objectives & Rubric Review\n\n`
            docContent += `By the end of this lesson, students will be able to:\n\n`
            objectives.forEach(obj => {
              docContent += `${obj}\n\n\n`
            })
          }
          
          // CCC Rubric
          if (formData.cccCode || formData.cccTitle) {
            const cccTitle = formData.cccTitle || formData.cccCode || 'CCC'
            docContent += `${formData.cccCode || ''} – ${cccTitle}\n\n`
            
            if (formData.level6) {
              docContent += `🔹 Level 6\n\n${formData.level6}\n\n\n`
            }
            if (formData.level8) {
              docContent += `🔹 Level 8\n\n${formData.level8}\n\n\n`
            }
            if (formData.level10) {
              docContent += `🔹 Level 10\n\n${formData.level10}\n\n\n`
            }
            if (formData.level12) {
              docContent += `🔹 Level 12\n\n${formData.level12}\n\n\n`
            }
          }
          
          // Workshop Intro/Overview
          if (formData.introOverview || formData.openingQuestion) {
            docContent += `Workshop Intro/Overview\n\n\n`
            
            if (formData.openingQuestion) {
              docContent += `Opening Question:\n\n${formData.openingQuestion}\n\n`
            }
            
            if (formData.introOverview) {
              docContent += `${formData.introOverview}\n\n\n`
            }
          }
          
          // Activities
          if (formData.activities) {
            docContent += `${formData.activities}\n\n\n`
          }
          
          // Journal Reflection
          if (formData.journalReflection) {
            docContent += `${formData.journalReflection}\n\n\n\n`
          }
          
          // Activity Structure
          if (formData.activityStructure) {
            docContent += `Activity Structure (Before the Forum)\n\n${formData.activityStructure}\n\n\n`
          }
          
          // Checkout
          if (formData.checkout) {
            docContent += `Checkout\n\n(10 minutes)\n\n${formData.checkout}\n`
          }
          
          // Add metadata at the end
          docContent += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
          docContent += `WORKSHOP METADATA\n\n`
          if (formData.rating) {
            docContent += `Rating: ${formData.rating}/5\n`
          }
          docContent += `Status: ${formData.status.charAt(0).toUpperCase() + formData.status.slice(1).replace('_', ' ')}\n`
          docContent += `Created: ${new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}\n`

          const docResponse = await fetch('/api/docs/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: `Slide Deck: ${formData.title || 'Workshop Document'}`,
              content: docContent,
            }),
          })

          if (docResponse.ok) {
            const docResult = await docResponse.json()
            docLink = docResult.doc?.webViewLink
            toast.success(`Workshop "${formData.title}" created successfully!`, {
              description: `Google Doc created. Click to view.`,
              action: docLink ? {
                label: 'Open Doc',
                onClick: () => window.open(docLink, '_blank'),
              } : undefined,
            })
          } else {
            // Workshop created but doc creation failed - still show success
            let errorMessage = 'Unknown error'
            let docError = {}
            
            try {
              const errorText = await docResponse.text()
              console.error('Doc creation failed - Response status:', docResponse.status)
              console.error('Doc creation failed - Response text:', errorText)
              
              try {
                docError = JSON.parse(errorText)
                errorMessage = docError.error || docError.message || `HTTP ${docResponse.status}: ${errorText.substring(0, 100)}`
              } catch {
                // If not JSON, use the text as error message
                errorMessage = errorText || `HTTP ${docResponse.status} error`
              }
            } catch (parseError) {
              console.error('Failed to parse error response:', parseError)
              errorMessage = `HTTP ${docResponse.status} error - Could not parse response`
            }
            
            console.error('Failed to create Google Doc - Full error:', {
              status: docResponse.status,
              statusText: docResponse.statusText,
              error: docError,
              errorMessage,
            })
            
            toast.success(`Workshop "${formData.title}" created successfully!`, {
              description: `Total workshops: ${result.stats?.total || 0}. Google Doc creation failed: ${errorMessage}`,
              duration: 6000,
            })
          }
        } catch (docError) {
          // Workshop created but doc creation failed - still show success
          console.error('Error creating Google Doc:', docError)
          const errorMessage = docError.message || docError.toString() || 'Unknown error'
          toast.success(`Workshop "${formData.title}" created successfully!`, {
            description: `Total workshops: ${result.stats?.total || 0}. Google Doc creation failed: ${errorMessage}`,
            duration: 6000,
          })
        }
      } else {
        // No token - just show workshop creation success
        toast.success(`Workshop "${formData.title}" created successfully!`, {
          description: `Total workshops: ${result.stats?.total || 0}`,
        })
      }
      
      // Delete draft if it was loaded from a draft
      if (currentDraftId) {
        deleteDraft(currentDraftId)
        setCurrentDraftId(null)
      }
      
      // Reset form
      setFormData({
        title: '',
        weekOverview: '',
        date: new Date().toISOString().split('T')[0],
        rating: '',
        status: 'in_progress',
        rubricFocus: '',
        competencyFocus: '',
        indicatorFocus: '',
        studentObjectives: '',
        cccCode: '',
        cccTitle: '',
        level6: '',
        level8: '',
        level10: '',
        level12: '',
        openingQuestion: '',
        introOverview: '',
        activities: '',
        journalReflection: '',
        activityStructure: '',
        checkout: '',
      })
      setIsOpen(false)
      loadDrafts()
      
      // Notify parent component
      if (onWorkshopCreated) {
        onWorkshopCreated()
      }
      
      // Trigger refresh event for all components
      window.dispatchEvent(new Event('workshopUpdated'))
      localStorage.setItem('workshop_created', Date.now().toString())
    } catch (error) {
      console.error('Error creating workshop:', error)
      toast.error('Failed to create workshop')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSaveDraft = () => {
    try {
      const draftId = saveDraft(formData, currentDraftId)
      setCurrentDraftId(draftId)
      loadDrafts()
      toast.success('Draft saved successfully!', {
        description: 'You can continue editing later',
      })
    } catch (error) {
      console.error('Error saving draft:', error)
      toast.error('Failed to save draft')
    }
  }

  const handleLoadDraft = (draftId) => {
    const draft = getDraft(draftId)
    if (draft) {
      setFormData({
        title: draft.title || '',
        weekOverview: draft.weekOverview || '',
        date: draft.date || new Date().toISOString().split('T')[0],
        rating: draft.rating || '',
        status: draft.status || 'in_progress',
        rubricFocus: draft.rubricFocus || '',
        competencyFocus: draft.competencyFocus || '',
        indicatorFocus: draft.indicatorFocus || '',
        studentObjectives: draft.studentObjectives || '',
        cccCode: draft.cccCode || '',
        cccTitle: draft.cccTitle || '',
        level6: draft.level6 || '',
        level8: draft.level8 || '',
        level10: draft.level10 || '',
        level12: draft.level12 || '',
        openingQuestion: draft.openingQuestion || '',
        introOverview: draft.introOverview || '',
        activities: draft.activities || '',
        journalReflection: draft.journalReflection || '',
        activityStructure: draft.activityStructure || '',
        checkout: draft.checkout || '',
      })
      setCurrentDraftId(draftId)
      toast.success('Draft loaded!', {
        description: 'Continue editing your workshop',
      })
    }
  }

  const handleDeleteDraft = (draftId, e) => {
    e.stopPropagation()
    if (deleteDraft(draftId)) {
      if (currentDraftId === draftId) {
        setCurrentDraftId(null)
      }
      loadDrafts()
      toast.success('Draft deleted')
    } else {
      toast.error('Failed to delete draft')
    }
  }

  const handleNewWorkshop = () => {
    setFormData({
      title: '',
      weekOverview: '',
      date: new Date().toISOString().split('T')[0],
      rating: '',
      status: 'in_progress',
      rubricFocus: '',
      competencyFocus: '',
      indicatorFocus: '',
      studentObjectives: '',
      cccCode: '',
      cccTitle: '',
      level6: '',
      level8: '',
      level10: '',
      level12: '',
      openingQuestion: '',
      introOverview: '',
      activities: '',
      journalReflection: '',
      activityStructure: '',
      checkout: '',
    })
    setCurrentDraftId(null)
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  if (!isOpen) {
    return (
      <Card className="border-2 border-border/70 bg-card transition-all duration-500 hover:border-accent hover:shadow-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-card-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" />
            Create Workshop
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Track a new workshop creation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setIsOpen(true)}
            className="w-full gap-2"
            size="lg"
          >
            <Plus className="h-4 w-4" />
            Create New Workshop
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-border/70 bg-card transition-all duration-500 hover:border-accent hover:shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-card-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              Create Workshop
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Add a new workshop to track
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {drafts.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <FolderOpen className="h-4 w-4" />
                    Drafts ({drafts.length})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>Saved Drafts</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {drafts.length === 0 ? (
                    <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                      No saved drafts
                    </div>
                  ) : (
                    drafts.map((draft) => (
                      <DropdownMenuItem
                        key={draft.id}
                        onClick={() => handleLoadDraft(draft.id)}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {draft.title || 'Untitled Workshop'}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(draft.lastModified)}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-2"
                          onClick={(e) => handleDeleteDraft(draft.id, e)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              ×
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
          {/* Basic Information Section */}
          <div className="space-y-3 pb-3 border-b border-border">
            <h3 className="text-sm font-semibold text-card-foreground">Basic Information</h3>
            <div className="space-y-2">
              <Label htmlFor="title">Slide Deck Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Week One Workshop Overview"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weekOverview">Week Overview</Label>
              <Input
                id="weekOverview"
                placeholder="e.g., Week One Workshop Overview"
                value={formData.weekOverview}
                onChange={(e) => handleChange('weekOverview', e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange('status', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Rubric & Competency Section */}
          <div className="space-y-3 pb-3 border-b border-border">
            <h3 className="text-sm font-semibold text-card-foreground">Rubric & Competency</h3>
            <div className="space-y-2">
              <Label htmlFor="rubricFocus">Rubric Focus</Label>
              <Textarea
                id="rubricFocus"
                placeholder='e.g., CCC 2.1 "Own Your Story: Identity, Bias, and Showing Up" Part 1'
                value={formData.rubricFocus}
                onChange={(e) => handleChange('rubricFocus', e.target.value)}
                disabled={isLoading}
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="competencyFocus">Competency Focus</Label>
              <Textarea
                id="competencyFocus"
                placeholder="e.g., Launchpad Student Competency and Concept Framework"
                value={formData.competencyFocus}
                onChange={(e) => handleChange('competencyFocus', e.target.value)}
                disabled={isLoading}
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="indicatorFocus">Indicator Focus</Label>
              <Input
                id="indicatorFocus"
                placeholder="e.g., CCC 2.1 Integrate DEI Practices"
                value={formData.indicatorFocus}
                onChange={(e) => handleChange('indicatorFocus', e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Student Objectives */}
          <div className="space-y-2 pb-3 border-b border-border">
            <Label htmlFor="studentObjectives">Student Objectives (one per line) *</Label>
            <Textarea
              id="studentObjectives"
              placeholder="Identify visible and invisible aspects of their identity&#10;Describe how aspects of identity affect their behavior at school&#10;Reflect on how bias and privilege relate to their experience"
              value={formData.studentObjectives}
              onChange={(e) => handleChange('studentObjectives', e.target.value)}
              required
              disabled={isLoading}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">Enter one objective per line. Each will be formatted as a bullet point.</p>
          </div>

          {/* CCC Rubric Levels */}
          <div className="space-y-3 pb-3 border-b border-border">
            <h3 className="text-sm font-semibold text-card-foreground">CCC Rubric</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="cccCode">CCC Code</Label>
                <Input
                  id="cccCode"
                  placeholder="e.g., CCC.2.1"
                  value={formData.cccCode}
                  onChange={(e) => handleChange('cccCode', e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cccTitle">CCC Title</Label>
                <Input
                  id="cccTitle"
                  placeholder="e.g., Know Myself"
                  value={formData.cccTitle}
                  onChange={(e) => handleChange('cccTitle', e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level6">Level 6</Label>
              <Textarea
                id="level6"
                placeholder="I can explain a few aspects of my identity.&#10;I can take a break or rest when I need to."
                value={formData.level6}
                onChange={(e) => handleChange('level6', e.target.value)}
                disabled={isLoading}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level8">Level 8</Label>
              <Textarea
                id="level8"
                placeholder="I can explain multiple aspects of my identity..."
                value={formData.level8}
                onChange={(e) => handleChange('level8', e.target.value)}
                disabled={isLoading}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level10">Level 10</Label>
              <Textarea
                id="level10"
                placeholder="I can explain multiple aspects of my identity..."
                value={formData.level10}
                onChange={(e) => handleChange('level10', e.target.value)}
                disabled={isLoading}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level12">Level 12</Label>
              <Textarea
                id="level12"
                placeholder="I can explain multiple aspects of my identity..."
                value={formData.level12}
                onChange={(e) => handleChange('level12', e.target.value)}
                disabled={isLoading}
                rows={5}
                className="resize-none"
              />
            </div>
          </div>

          {/* Workshop Content */}
          <div className="space-y-3 pb-3 border-b border-border">
            <h3 className="text-sm font-semibold text-card-foreground">Workshop Content</h3>
            <div className="space-y-2">
              <Label htmlFor="openingQuestion">Opening Question(s)</Label>
              <Textarea
                id="openingQuestion"
                placeholder='e.g., "When you walk into a room before you even speak; what do people assume about you?"'
                value={formData.openingQuestion}
                onChange={(e) => handleChange('openingQuestion', e.target.value)}
                disabled={isLoading}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="introOverview">Workshop Intro/Overview</Label>
              <Textarea
                id="introOverview"
                placeholder="Introduction and overview content..."
                value={formData.introOverview}
                onChange={(e) => handleChange('introOverview', e.target.value)}
                disabled={isLoading}
                rows={5}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activities">Activities</Label>
              <Textarea
                id="activities"
                placeholder="Describe workshop activities (Fast Draw, Class Discussion, etc.)..."
                value={formData.activities}
                onChange={(e) => handleChange('activities', e.target.value)}
                disabled={isLoading}
                rows={8}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="journalReflection">Journal Reflection Prompt</Label>
              <Textarea
                id="journalReflection"
                placeholder="Journal reflection prompt for students..."
                value={formData.journalReflection}
                onChange={(e) => handleChange('journalReflection', e.target.value)}
                disabled={isLoading}
                rows={5}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activityStructure">Activity Structure (Before/After Forum)</Label>
              <Textarea
                id="activityStructure"
                placeholder="Activity structure and discussion prompts..."
                value={formData.activityStructure}
                onChange={(e) => handleChange('activityStructure', e.target.value)}
                disabled={isLoading}
                rows={6}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkout">Checkout</Label>
              <Textarea
                id="checkout"
                placeholder="Checkout activity or closing remarks..."
                value={formData.checkout}
                onChange={(e) => handleChange('checkout', e.target.value)}
                disabled={isLoading}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1 gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Workshop
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isLoading}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save Draft
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleNewWorkshop}
                disabled={isLoading}
                className="text-xs"
              >
                New Workshop
              </Button>
              {currentDraftId && (
                <div className="flex-1 text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Editing saved draft
                </div>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

