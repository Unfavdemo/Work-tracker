'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Edit, 
  Plus, 
  Trash2, 
  Save, 
  X, 
  GripVertical, 
  Eye,
  Loader2,
  FileText,
  ArrowUp,
  ArrowDown,
  GraduationCap,
  Rocket,
  Calendar,
  FolderPlus
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const FIELD_TYPES = [
  { value: 'text', label: 'Text Input' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'date', label: 'Date' },
  { value: 'datetime-local', label: 'Date & Time' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
]

const DEFAULT_FORM_ICONS = {
  '101-checkin': GraduationCap,
  'liftoff-checkin': Rocket,
  'calendar-event': Calendar,
}

const getFormIcon = (formId) => {
  return DEFAULT_FORM_ICONS[formId] || FileText
}

export function FormEditor({ defaultFormId = '101-checkin', onSave }) {
  const [currentFormId, setCurrentFormId] = useState(defaultFormId)
  const [formConfig, setFormConfig] = useState(null)
  const [availableForms, setAvailableForms] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingForms, setLoadingForms] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingField, setEditingField] = useState(null)
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false)
  const [isNewFormDialogOpen, setIsNewFormDialogOpen] = useState(false)
  const [newFormData, setNewFormData] = useState({ name: '', description: '' })
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    loadAllForms()
  }, [])

  useEffect(() => {
    if (availableForms.length > 0) {
      loadFormConfig()
    }
  }, [currentFormId, availableForms])

  const loadAllForms = async () => {
    try {
      setLoadingForms(true)
      const response = await fetch('/api/forms')
      if (!response.ok) {
        throw new Error('Failed to load forms')
      }
      const data = await response.json()
      const forms = data.formConfigs.map(form => ({
        id: form.id,
        label: form.name,
        icon: getFormIcon(form.id),
      }))
      setAvailableForms(forms)
      
      // If current form doesn't exist, switch to first form
      if (!forms.find(f => f.id === currentFormId) && forms.length > 0) {
        setCurrentFormId(forms[0].id)
      }
    } catch (error) {
      console.error('Error loading forms:', error)
      toast.error('Failed to load forms')
    } finally {
      setLoadingForms(false)
    }
  }

  const loadFormConfig = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/forms?id=${currentFormId}`)
      if (!response.ok) {
        throw new Error('Failed to load form configuration')
      }
      const data = await response.json()
      setFormConfig(data.formConfig)
      setPreviewMode(false) // Reset preview mode when switching forms
    } catch (error) {
      console.error('Error loading form config:', error)
      toast.error('Failed to load form configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formConfig) return

    try {
      setSaving(true)
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formConfig }),
      })

      if (!response.ok) {
        throw new Error('Failed to save form configuration')
      }

      toast.success('Form configuration saved successfully!')
      
      // Reload forms list in case name changed
      await loadAllForms()
      
      if (onSave) {
        onSave(formConfig)
      }
    } catch (error) {
      console.error('Error saving form config:', error)
      toast.error('Failed to save form configuration')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateNewForm = async () => {
    if (!newFormData.name.trim()) {
      toast.error('Form name is required')
      return
    }

    try {
      setSaving(true)
      const newFormId = `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newFormConfig = {
        id: newFormId,
        name: newFormData.name.trim(),
        description: newFormData.description.trim() || '',
        portals: [], // Empty array - can be assigned to portals later
        fields: [],
        updatedAt: new Date().toISOString(),
      }

      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formConfig: newFormConfig }),
      })

      if (!response.ok) {
        throw new Error('Failed to create form')
      }

      toast.success('New form created successfully!')
      setIsNewFormDialogOpen(false)
      setNewFormData({ name: '', description: '' })
      
      // Reload forms and switch to new form
      await loadAllForms()
      setCurrentFormId(newFormId)
    } catch (error) {
      console.error('Error creating form:', error)
      toast.error('Failed to create form')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteForm = async (formId) => {
    // Prevent deleting default forms
    const defaultForms = ['101-checkin', 'liftoff-checkin', 'calendar-event']
    if (defaultForms.includes(formId)) {
      toast.error('Cannot delete default forms')
      return
    }

    if (!confirm(`Are you sure you want to delete "${availableForms.find(f => f.id === formId)?.label}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/forms?id=${formId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete form')
      }

      toast.success('Form deleted successfully!')
      
      // Switch to first available form if current form was deleted
      if (currentFormId === formId) {
        const remainingForms = availableForms.filter(f => f.id !== formId)
        if (remainingForms.length > 0) {
          setCurrentFormId(remainingForms[0].id)
        }
      }
      
      await loadAllForms()
    } catch (error) {
      console.error('Error deleting form:', error)
      toast.error('Failed to delete form')
    }
  }

  const handleAddField = () => {
    const newField = {
      id: `field-${Date.now()}`,
      type: 'text',
      label: 'New Field',
      placeholder: '',
      required: false,
      order: formConfig.fields.length,
    }
    setEditingField(newField)
    setIsFieldDialogOpen(true)
  }

  const handleEditField = (field) => {
    setEditingField({ ...field })
    setIsFieldDialogOpen(true)
  }

  const handleDeleteField = (fieldId) => {
    setFormConfig({
      ...formConfig,
      fields: formConfig.fields.filter(f => f.id !== fieldId).map((f, idx) => ({ ...f, order: idx })),
    })
    toast.success('Field deleted')
  }

  const handleSaveField = () => {
    if (!editingField || !editingField.label.trim()) {
      toast.error('Field label is required')
      return
    }

    if (!formConfig) return

    const existingIndex = formConfig.fields.findIndex(f => f.id === editingField.id)
    let updatedFields

    if (existingIndex >= 0) {
      // Update existing field
      updatedFields = formConfig.fields.map(f => 
        f.id === editingField.id ? editingField : f
      )
    } else {
      // Add new field
      updatedFields = [...formConfig.fields, editingField]
    }

    setFormConfig({
      ...formConfig,
      fields: updatedFields,
    })
    setIsFieldDialogOpen(false)
    setEditingField(null)
    toast.success('Field saved')
  }

  const handleMoveField = (fieldId, direction) => {
    const fields = [...formConfig.fields]
    const index = fields.findIndex(f => f.id === fieldId)
    
    if (index === -1) return
    
    if (direction === 'up' && index > 0) {
      [fields[index], fields[index - 1]] = [fields[index - 1], fields[index]]
    } else if (direction === 'down' && index < fields.length - 1) {
      [fields[index], fields[index + 1]] = [fields[index + 1], fields[index]]
    }

    const reorderedFields = fields.map((f, idx) => ({ ...f, order: idx }))
    setFormConfig({
      ...formConfig,
      fields: reorderedFields,
    })
  }

  const handleFieldChange = (field, key, value) => {
    setEditingField({
      ...field,
      [key]: value,
    })
  }

  const handleOptionsChange = (field, value) => {
    const options = value.split(',').map(opt => opt.trim()).filter(opt => opt)
    setEditingField({
      ...field,
      options,
    })
  }

  if (loadingForms) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* New Form Button at Top */}
      <div className="flex justify-end">
        <Button
          onClick={() => setIsNewFormDialogOpen(true)}
          size="lg"
          className="bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 shadow-lg hover:shadow-xl transition-all"
        >
          <FolderPlus className="h-5 w-5 mr-2" />
          Create New Form
        </Button>
      </div>

      {/* Form Tabs */}
      <Tabs value={currentFormId} onValueChange={setCurrentFormId} className="w-full">
        <TabsList className="w-full overflow-x-auto">
          {availableForms.map((form) => {
            const Icon = form.icon
            return (
              <TabsTrigger key={form.id} value={form.id} className="flex items-center gap-2 whitespace-nowrap">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{form.label}</span>
                <span className="sm:hidden">{form.label.split(' ')[0]}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {availableForms.map((form) => (
          <TabsContent key={form.id} value={form.id} className="mt-6">
            {loading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            ) : !formConfig ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Form configuration not found</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <FileText className="h-6 w-6 text-accent" />
                            {formConfig.name}
                          </CardTitle>
                          {!['101-checkin', 'liftoff-checkin', 'calendar-event'].includes(formConfig.id) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteForm(formConfig.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <CardDescription className="mt-2">
                          {formConfig.description || 'Edit form fields, labels, and configurations'}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setPreviewMode(!previewMode)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {previewMode ? 'Edit Mode' : 'Preview'}
                        </Button>
                        <Button
                          onClick={handleSave}
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="formName">Form Name</Label>
                        <Input
                          id="formName"
                          value={formConfig.name}
                          onChange={(e) => setFormConfig({ ...formConfig, name: e.target.value })}
                          placeholder="Enter form name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="formDescription">Description</Label>
                        <Textarea
                          id="formDescription"
                          value={formConfig.description || ''}
                          onChange={(e) => setFormConfig({ ...formConfig, description: e.target.value })}
                          placeholder="Enter form description"
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Assign to Portals</Label>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="portal-101"
                              checked={formConfig.portals?.includes('101') || false}
                              onChange={(e) => {
                                const portals = formConfig.portals || []
                                if (e.target.checked) {
                                  setFormConfig({
                                    ...formConfig,
                                    portals: [...portals, '101'],
                                  })
                                } else {
                                  setFormConfig({
                                    ...formConfig,
                                    portals: portals.filter(p => p !== '101'),
                                  })
                                }
                              }}
                              className="w-4 h-4"
                            />
                            <Label htmlFor="portal-101" className="flex items-center gap-2 cursor-pointer">
                              <GraduationCap className="h-4 w-4" />
                              101 Student Portal
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="portal-liftoff"
                              checked={formConfig.portals?.includes('liftoff') || false}
                              onChange={(e) => {
                                const portals = formConfig.portals || []
                                if (e.target.checked) {
                                  setFormConfig({
                                    ...formConfig,
                                    portals: [...portals, 'liftoff'],
                                  })
                                } else {
                                  setFormConfig({
                                    ...formConfig,
                                    portals: portals.filter(p => p !== 'liftoff'),
                                  })
                                }
                              }}
                              className="w-4 h-4"
                            />
                            <Label htmlFor="portal-liftoff" className="flex items-center gap-2 cursor-pointer">
                              <Rocket className="h-4 w-4" />
                              Liftoff Student Portal
                            </Label>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Select which student portals this form should appear in
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Fields List */}
                {!previewMode && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Form Fields</CardTitle>
              <Button onClick={handleAddField} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {formConfig.fields
                .sort((a, b) => a.order - b.order)
                .map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">{field.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {field.type} {field.required && '(Required)'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveField(field.id, 'up')}
                        disabled={field.order === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveField(field.id, 'down')}
                        disabled={field.order === formConfig.fields.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditField(field)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteField(field.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              {formConfig.fields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No fields yet. Click "Add Field" to get started.
                </div>
              )}
            </div>
                </CardContent>
              </Card>
            )}

            {/* Preview */}
            {previewMode && (
        <Card>
          <CardHeader>
            <CardTitle>Form Preview</CardTitle>
            <CardDescription>
              This is how the form will appear to users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              {formConfig.fields
                .sort((a, b) => a.order - b.order)
                .map((field) => (
                  <div key={field.id} className="space-y-1.5">
                    <Label htmlFor={field.id}>
                      {field.label} {field.required && '*'}
                    </Label>
                    {field.type === 'textarea' ? (
                      <Textarea
                        id={field.id}
                        placeholder={field.placeholder}
                        required={field.required}
                        rows={3}
                        disabled
                      />
                    ) : field.type === 'radio' ? (
                      <div className="flex flex-col gap-2">
                        {field.options?.map((option) => (
                          <label key={option} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={field.id}
                              value={option}
                              disabled
                              className="w-4 h-4"
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    ) : field.type === 'select' ? (
                      <Select disabled>
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
                    ) : (
                      <Input
                        id={field.id}
                        type={field.type}
                        placeholder={field.placeholder}
                        required={field.required}
                        disabled
                      />
                    )}
                  </div>
                ))}
            </form>
          </CardContent>
        </Card>
      )}
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* New Form Dialog */}
      <Dialog open={isNewFormDialogOpen} onOpenChange={setIsNewFormDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Form</DialogTitle>
            <DialogDescription>
              Create a new form configuration. You can add fields after creation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newFormName">Form Name *</Label>
              <Input
                id="newFormName"
                value={newFormData.name}
                onChange={(e) => setNewFormData({ ...newFormData, name: e.target.value })}
                placeholder="e.g., Workshop Feedback Form"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newFormDescription">Description</Label>
              <Textarea
                id="newFormDescription"
                value={newFormData.description}
                onChange={(e) => setNewFormData({ ...newFormData, description: e.target.value })}
                placeholder="Brief description of the form's purpose"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsNewFormDialogOpen(false)
                setNewFormData({ name: '', description: '' })
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateNewForm} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Form
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Field Edit Dialog */}
      <Dialog open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingField?.id && formConfig?.fields?.find(f => f.id === editingField.id)
                ? 'Edit Field'
                : 'Add Field'}
            </DialogTitle>
            <DialogDescription>
              Configure the field properties
            </DialogDescription>
          </DialogHeader>
          {editingField && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fieldLabel">Field Label *</Label>
                <Input
                  id="fieldLabel"
                  value={editingField.label}
                  onChange={(e) => handleFieldChange(editingField, 'label', e.target.value)}
                  placeholder="Enter field label"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fieldType">Field Type *</Label>
                <Select
                  value={editingField.type}
                  onValueChange={(value) => handleFieldChange(editingField, 'type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(editingField.type === 'text' || 
                editingField.type === 'textarea' || 
                editingField.type === 'email' ||
                editingField.type === 'number') && (
                <div className="space-y-2">
                  <Label htmlFor="fieldPlaceholder">Placeholder</Label>
                  <Input
                    id="fieldPlaceholder"
                    value={editingField.placeholder || ''}
                    onChange={(e) => handleFieldChange(editingField, 'placeholder', e.target.value)}
                    placeholder="Enter placeholder text"
                  />
                </div>
              )}

              {(editingField.type === 'radio' || editingField.type === 'select') && (
                <div className="space-y-2">
                  <Label htmlFor="fieldOptions">
                    Options (comma-separated) *
                  </Label>
                  <Input
                    id="fieldOptions"
                    value={editingField.options?.join(', ') || ''}
                    onChange={(e) => handleOptionsChange(editingField, e.target.value)}
                    placeholder="Option 1, Option 2, Option 3"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate options with commas
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="fieldRequired">Required Field</Label>
                  <p className="text-xs text-muted-foreground">
                    Make this field mandatory
                  </p>
                </div>
                <Switch
                  id="fieldRequired"
                  checked={editingField.required || false}
                  onCheckedChange={(checked) => 
                    handleFieldChange(editingField, 'required', checked)
                  }
                />
              </div>

              {(editingField.type === 'radio' || editingField.type === 'select') && (
                <div className="space-y-2">
                  <Label htmlFor="conditionalField">Conditional Display</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="conditionalFieldName" className="text-sm">
                        Show when field:
                      </Label>
                      <Select
                        value={editingField.conditional?.field || ''}
                        onValueChange={(value) => 
                          handleFieldChange(editingField, 'conditional', {
                            ...editingField.conditional,
                            field: value,
                          })
                        }
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {formConfig.fields
                            .filter(f => f.id !== editingField.id && (f.type === 'radio' || f.type === 'select'))
                            .map((f) => (
                              <SelectItem key={f.id} value={f.id}>
                                {f.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {editingField.conditional?.field && (
                      <div className="flex items-center gap-2">
                        <Label htmlFor="conditionalValue" className="text-sm">
                          equals:
                        </Label>
                        <Input
                          id="conditionalValue"
                          value={editingField.conditional?.value || ''}
                          onChange={(e) => 
                            handleFieldChange(editingField, 'conditional', {
                              ...editingField.conditional,
                              value: e.target.value,
                            })
                          }
                          placeholder="Value"
                          className="flex-1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsFieldDialogOpen(false)
                setEditingField(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveField}>
              Save Field
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

