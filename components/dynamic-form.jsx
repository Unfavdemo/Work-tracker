'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, CheckCircle2, Send, FileText } from 'lucide-react'
import { toast } from 'sonner'

export function DynamicForm({ formId, onSubmit, onSuccess }) {
  const [formConfig, setFormConfig] = useState(null)
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    loadFormConfig()
  }, [formId])

  const loadFormConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/forms?id=${formId}`)
      if (!response.ok) {
        throw new Error('Failed to load form')
      }
      const data = await response.json()
      setFormConfig(data.formConfig)
      
      // Initialize form data with default values
      const initialData = {}
      data.formConfig.fields.forEach(field => {
        if (field.type === 'date') {
          initialData[field.id] = new Date().toISOString().split('T')[0]
        } else {
          initialData[field.id] = ''
        }
      })
      setFormData(initialData)
    } catch (error) {
      console.error('Error loading form:', error)
      toast.error('Failed to load form')
    } finally {
      setLoading(false)
    }
  }

  const handleFieldChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value,
    }))
  }

  const validateForm = () => {
    if (!formConfig) return false

    for (const field of formConfig.fields.sort((a, b) => a.order - b.order)) {
      // Check conditional fields
      if (field.conditional) {
        const conditionalFieldValue = formData[field.conditional.field]
        if (conditionalFieldValue !== field.conditional.value) {
          continue // Skip this field if condition not met
        }
      }

      if (field.required) {
        const value = formData[field.id]
        if (!value || (typeof value === 'string' && !value.trim())) {
          toast.error(`Please fill in: ${field.label}`)
          return false
        }
      }
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    try {
      if (onSubmit) {
        await onSubmit(formData, formConfig)
      } else {
        // Default submission to feedback API
        const response = await fetch('/api/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentName: formData.studentName || 'Anonymous',
            date: formData.date || new Date().toISOString().split('T')[0],
            message: JSON.stringify(formData),
            category: formConfig.id,
            rating: formData.rating || null,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to submit form')
        }
      }

      toast.success('Form submitted successfully!', {
        description: 'Thank you for your submission.',
      })

      setSubmitted(true)
      if (onSuccess) {
        onSuccess()
      }

      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitted(false)
        const initialData = {}
        formConfig.fields.forEach(field => {
          if (field.type === 'date') {
            initialData[field.id] = new Date().toISOString().split('T')[0]
          } else {
            initialData[field.id] = ''
          }
        })
        setFormData(initialData)
      }, 3000)
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Failed to submit form')
    } finally {
      setSubmitting(false)
    }
  }

  const renderField = (field) => {
    const value = formData[field.id] || ''
    const shouldShow = !field.conditional || 
      formData[field.conditional.field] === field.conditional.value

    if (!shouldShow) return null

    return (
      <div key={field.id} className="space-y-1.5">
        <Label htmlFor={field.id}>
          {field.label} {field.required && '*'}
        </Label>
        {field.type === 'textarea' ? (
          <Textarea
            id={field.id}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            disabled={submitting}
            rows={3}
            className="resize-none"
          />
        ) : field.type === 'radio' ? (
          <div className="flex flex-col gap-2">
            {field.options?.map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  required={field.required}
                  disabled={submitting}
                  className="w-4 h-4"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        ) : field.type === 'select' ? (
          <Select
            value={value}
            onValueChange={(val) => handleFieldChange(field.id, val)}
            disabled={submitting}
            required={field.required}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : field.type === 'checkbox' ? (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.id}
              checked={value === true || value === 'true'}
              onChange={(e) => handleFieldChange(field.id, e.target.checked)}
              disabled={submitting}
              className="w-4 h-4"
            />
            <Label htmlFor={field.id} className="font-normal cursor-pointer">
              {field.placeholder || 'Check this box'}
            </Label>
          </div>
        ) : (
          <Input
            id={field.id}
            type={field.type}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            disabled={submitting}
          />
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!formConfig) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Form not found</p>
        </CardContent>
      </Card>
    )
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="rounded-full bg-accent/20 p-4">
            <CheckCircle2 className="h-12 w-12 text-accent" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Form Submitted!</h3>
            <p className="text-sm text-muted-foreground">
              Thank you for your submission. Your responses have been recorded.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-border/70 bg-card transition-all duration-500 hover:border-accent hover:shadow-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-card-foreground flex items-center gap-2">
          <FileText className="h-5 w-5 text-accent" />
          {formConfig.name}
        </CardTitle>
        {formConfig.description && (
          <CardDescription className="text-muted-foreground">
            {formConfig.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="text-xs text-muted-foreground mb-4">* Indicates required field</div>
          
          {formConfig.fields
            .sort((a, b) => a.order - b.order)
            .map(field => renderField(field))}

          <Button
            type="submit"
            className="w-full gap-2"
            size="lg"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Form
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

