'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Loader2, FileText } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/theme-toggle'
import { DynamicForm } from '@/components/dynamic-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function LiftoffStudentPage() {
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFormId, setActiveFormId] = useState(null)

  useEffect(() => {
    loadForms()
  }, [])

  const loadForms = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/forms?portal=liftoff')
      if (!response.ok) {
        throw new Error('Failed to load forms')
      }
      const data = await response.json()
      setForms(data.formConfigs || [])
      if (data.formConfigs && data.formConfigs.length > 0) {
        setActiveFormId(data.formConfigs[0].id)
      }
    } catch (error) {
      console.error('Error loading forms:', error)
      toast.error('Failed to load forms')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl w-full flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (forms.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl w-full space-y-6 animate-in fade-in duration-700">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Liftoff Student Portal
              </h1>
              <p className="text-sm text-muted-foreground">
                Submit forms and request calendar events
              </p>
            </div>
            <ThemeToggle />
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No forms available at this time.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl w-full space-y-6 animate-in fade-in duration-700">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Liftoff Student Portal
              </h1>
            <p className="text-sm text-muted-foreground">
              Submit forms and request calendar events
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Forms Tabs */}
        {forms.length > 1 ? (
          <Tabs value={activeFormId} onValueChange={setActiveFormId} className="w-full">
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${forms.length}, 1fr)` }}>
              {forms.map((form) => (
                <TabsTrigger key={form.id} value={form.id} className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">{form.name}</span>
                  <span className="sm:hidden">{form.name.split(' ')[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            {forms.map((form) => (
              <TabsContent key={form.id} value={form.id} className="mt-6">
                <DynamicForm 
                  formId={form.id}
                  onSuccess={() => {
                    // Form will handle its own success state
                  }}
                />
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          forms.length === 1 && (
            <DynamicForm 
              formId={forms[0].id}
              onSuccess={() => {
                // Form will handle its own success state
              }}
            />
          )
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
                  Fill out the form above and submit. Your responses will be reviewed and you'll receive confirmation once submitted.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

