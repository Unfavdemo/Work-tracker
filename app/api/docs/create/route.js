import { NextResponse } from 'next/server'
import { createGoogleDoc } from '@/lib/google-docs'

export async function POST(request) {
  try {
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, content } = body

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Document title is required' },
        { status: 400 }
      )
    }

    const doc = await createGoogleDoc(accessToken, {
      title: title.trim(),
      content: content || '',
    })

    return NextResponse.json({ 
      doc, 
      success: true,
      message: 'Google Doc created successfully',
    })
  } catch (error) {
    console.error('Error creating Google Doc:', error)
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      response: error.response?.data,
    })
    
    // Check for authentication errors
    if (error.code === 401 || error.code === 403 || 
        error.message?.includes('invalid authentication') ||
        error.message?.includes('authentication credential') ||
        error.message?.includes('Invalid Credentials')) {
      return NextResponse.json(
        { 
          error: 'Invalid or expired authentication token. Please reconnect your Google account.',
          type: 'authentication',
        },
        { status: 401 }
      )
    }

    // Check for permission/scope errors
    if (error.code === 403 && 
        (error.message?.includes('insufficient permissions') ||
         error.message?.includes('permission denied') ||
         error.response?.data?.error?.message?.includes('insufficient'))) {
      return NextResponse.json(
        { 
          error: 'Insufficient permissions. Please reconnect and grant Drive and Docs permissions.',
          type: 'permission',
        },
        { status: 403 }
      )
    }
    
    // Return detailed error message
    const errorMessage = error.response?.data?.error?.message || 
                        error.message || 
                        'Failed to create Google Doc'
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.response?.data?.error || undefined,
      },
      { status: error.code || 500 }
    )
  }
}

