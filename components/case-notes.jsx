'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, FileText, User, Calendar, Loader2, Trash2, MoreVertical, Download, RefreshCw, Eye } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function CaseNotes() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [caseNotes, setCaseNotes] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }),
    clientName: '',
    discussion: '',
    barriers: '',
    solutions: '',
    nextSteps: '',
  })

  useEffect(() => {
    fetchCaseNotes()
    // Listen for case note creation events
    const handleCaseNoteUpdate = () => {
      fetchCaseNotes()
    }
    window.addEventListener('caseNoteUpdated', handleCaseNoteUpdate)
    
    return () => {
      window.removeEventListener('caseNoteUpdated', handleCaseNoteUpdate)
    }
  }, [])

  const fetchCaseNotes = async () => {
    try {
      const response = await fetch('/api/case-notes')
      if (response.ok) {
        const result = await response.json()
        if (result.notes) {
          setCaseNotes(result.notes)
        }
      }
    } catch (error) {
      console.error('Error fetching case notes:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.clientName.trim()) {
      toast.error('Please enter a client name')
      return
    }

    if (!formData.discussion.trim()) {
      toast.error('Please enter discussion notes')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/case-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Failed to create case note')
        return
      }

      const result = await response.json()
      
      toast.success('Case note created successfully!', {
        description: `Case note for ${formData.clientName} saved`,
      })
      
      // Reset form
      setFormData({
        date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }),
        clientName: '',
        discussion: '',
        barriers: '',
        solutions: '',
        nextSteps: '',
      })
      setIsOpen(false)
      
      // Trigger refresh event
      window.dispatchEvent(new Event('caseNoteUpdated'))
      fetchCaseNotes()
    } catch (error) {
      console.error('Error creating case note:', error)
      toast.error('Failed to create case note')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this case note?')) {
      return
    }

    try {
      const response = await fetch(`/api/case-notes?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Case note deleted successfully')
        fetchCaseNotes()
        window.dispatchEvent(new Event('caseNoteUpdated'))
      } else {
        toast.error('Failed to delete case note')
      }
    } catch (error) {
      console.error('Error deleting case note:', error)
      toast.error('Failed to delete case note')
    }
  }

  const handleExport = (note) => {
    const formattedNote = formatCaseNote(note)
    const filename = `case_note_${note.clientName.toLowerCase().replace(/\s+/g, '_')}_${note.date.replace(/\//g, '_')}.txt`
    const blob = new Blob([formattedNote], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Case note exported!')
  }

  const formatCaseNote = (note) => {
    let formatted = `Case note: On ${note.date} I met with ${note.clientName}.`
    
    if (note.discussion) {
      formatted += ` ${note.discussion}`
    }
    
    if (note.barriers) {
      formatted += ` We discussed his current barriers such as ${note.barriers}.`
    }
    
    if (note.solutions) {
      formatted += ` We talked about ways to ${note.solutions}.`
    }
    
    if (note.nextSteps) {
      formatted += ` Next steps are to ${note.nextSteps}.`
    }
    
    return formatted
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleRefresh = () => {
    fetchCaseNotes()
    toast.success('Case notes refreshed!')
  }

  if (!isOpen) {
    return (
      <Card className="border-2 border-border/70 bg-card transition-all duration-500 hover:border-accent hover:shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-card-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                Case Notes
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Track client meetings and case notes
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={handleRefresh}
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
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
                    Refresh
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setIsOpen(true)}
            className="w-full gap-2"
            size="lg"
          >
            <Plus className="h-4 w-4" />
            Create New Case Note
          </Button>
          
          {/* Recent Case Notes List */}
          {caseNotes.length > 0 && (
            <div className="mt-6 space-y-2 max-h-[400px] overflow-y-auto">
              {caseNotes.slice(0, 5).map((note) => (
                <div
                  key={note.id}
                  className="group rounded-lg border border-border/50 bg-gradient-to-br from-secondary/40 to-secondary/20 p-3 transition-all duration-300 hover:border-accent/50 hover:bg-secondary/60 hover:shadow-lg cursor-pointer"
                  onClick={() => {
                    setSelectedNote(note)
                    setIsViewDialogOpen(true)
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                        <span className="text-sm font-semibold text-card-foreground truncate">
                          {note.clientName}
                        </span>
                        <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-muted-foreground">{note.date}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {formatCaseNote(note).replace(/\n/g, ' ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleExport(note)
                        }}
                        title="Export"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(note.id)
                        }}
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {caseNotes.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  Showing 5 of {caseNotes.length} case notes
                </p>
              )}
            </div>
          )}
          
          {caseNotes.length === 0 && (
            <div className="mt-6 text-center py-8 text-muted-foreground text-sm">
              No case notes yet. Create your first case note to get started.
            </div>
          )}
        </CardContent>
        
        {/* View Case Note Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                Case Note Details
              </DialogTitle>
              <DialogDescription>
                Review the full case note details
              </DialogDescription>
            </DialogHeader>
            {selectedNote && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-card-foreground">{selectedNote.date}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-muted-foreground">Client Name</Label>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-card-foreground">{selectedNote.clientName}</p>
                    </div>
                  </div>
                </div>

                {selectedNote.discussion && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Discussion</Label>
                    <div className="p-3 rounded-lg bg-secondary/40 border border-border/50">
                      <p className="text-sm text-card-foreground whitespace-pre-wrap">{selectedNote.discussion}</p>
                    </div>
                  </div>
                )}

                {selectedNote.barriers && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Current Barriers</Label>
                    <div className="p-3 rounded-lg bg-secondary/40 border border-border/50">
                      <p className="text-sm text-card-foreground whitespace-pre-wrap">{selectedNote.barriers}</p>
                    </div>
                  </div>
                )}

                {selectedNote.solutions && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Solutions Discussed</Label>
                    <div className="p-3 rounded-lg bg-secondary/40 border border-border/50">
                      <p className="text-sm text-card-foreground whitespace-pre-wrap">{selectedNote.solutions}</p>
                    </div>
                  </div>
                )}

                {selectedNote.nextSteps && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Next Steps</Label>
                    <div className="p-3 rounded-lg bg-secondary/40 border border-border/50">
                      <p className="text-sm text-card-foreground whitespace-pre-wrap">{selectedNote.nextSteps}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-4 border-t border-border">
                  <Label className="text-sm font-medium text-muted-foreground">Formatted Case Note</Label>
                  <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <p className="text-sm text-card-foreground font-mono whitespace-pre-wrap">
                      {formatCaseNote(selectedNote)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => {
                      if (selectedNote) {
                        handleExport(selectedNote)
                      }
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 gap-2"
                    onClick={() => {
                      if (selectedNote) {
                        handleDelete(selectedNote.id)
                        setIsViewDialogOpen(false)
                        setSelectedNote(null)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
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
              Create Case Note
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Document client meetings and case notes
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8"
          >
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                placeholder="MM/DD/YY"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">Format: MM/DD/YY (e.g., 11/12/25)</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                placeholder="e.g., Quil"
                value={formData.clientName}
                onChange={(e) => handleChange('clientName', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="discussion">Discussion *</Label>
            <Textarea
              id="discussion"
              placeholder="We discussed his current barriers such as sleep and issues with Septa being unreliable."
              value={formData.discussion}
              onChange={(e) => handleChange('discussion', e.target.value)}
              required
              disabled={isLoading}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">What did you discuss during the meeting?</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="barriers">Current Barriers</Label>
            <Textarea
              id="barriers"
              placeholder="sleep, Septa being unreliable"
              value={formData.barriers}
              onChange={(e) => handleChange('barriers', e.target.value)}
              disabled={isLoading}
              rows={2}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">List current barriers the client is facing</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="solutions">Solutions Discussed</Label>
            <Textarea
              id="solutions"
              placeholder="ways to get better sleep and leaving earlier for work so that you can be on time"
              value={formData.solutions}
              onChange={(e) => handleChange('solutions', e.target.value)}
              disabled={isLoading}
              rows={2}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">What solutions or strategies did you discuss?</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nextSteps">Next Steps</Label>
            <Textarea
              id="nextSteps"
              placeholder="help him manage his barriers so that he can show up and show up"
              value={formData.nextSteps}
              onChange={(e) => handleChange('nextSteps', e.target.value)}
              disabled={isLoading}
              rows={2}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">What are the next steps or action items?</p>
          </div>

          <div className="flex gap-2 pt-2">
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
                  Create Case Note
                </>
              )}
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
        </form>
      </CardContent>
    </Card>
  )
}

