import { NextResponse } from 'next/server'
import { getFormConfig, getAllFormConfigs, saveFormConfig, deleteFormConfig } from '@/lib/form-storage'

// GET - Get form configurations
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const formId = searchParams.get('id')
    const portalId = searchParams.get('portal')
    
    if (formId) {
      const config = getFormConfig(formId)
      if (!config) {
        return NextResponse.json(
          { error: 'Form configuration not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ formConfig: config })
    }
    
    if (portalId) {
      const { getFormsByPortal } = await import('@/lib/form-storage')
      const configs = getFormsByPortal(portalId)
      return NextResponse.json({ formConfigs: configs })
    }
    
    const configs = getAllFormConfigs()
    return NextResponse.json({ formConfigs: configs })
  } catch (error) {
    console.error('Error fetching form configurations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch form configurations' },
      { status: 500 }
    )
  }
}

// POST - Create or update a form configuration
export async function POST(request) {
  try {
    const body = await request.json()
    const { formConfig } = body

    if (!formConfig) {
      return NextResponse.json(
        { error: 'Form configuration is required' },
        { status: 400 }
      )
    }

    if (!formConfig.name || !formConfig.name.trim()) {
      return NextResponse.json(
        { error: 'Form name is required' },
        { status: 400 }
      )
    }

    const saved = saveFormConfig(formConfig)
    return NextResponse.json({
      formConfig: saved,
      message: 'Form configuration saved successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Error saving form configuration:', error)
    return NextResponse.json(
      { error: 'Failed to save form configuration' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a form configuration
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const formId = searchParams.get('id')

    if (!formId) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      )
    }

    const deleted = deleteFormConfig(formId)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Form configuration not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Form configuration deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting form configuration:', error)
    return NextResponse.json(
      { error: 'Failed to delete form configuration' },
      { status: 500 }
    )
  }
}

