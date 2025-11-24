import { NextResponse } from 'next/server'
import { getUnifiedAuthUrl } from '@/lib/google-auth'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // Return authorization URL
    if (action === 'url') {
      // Check if environment variables are configured
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        return NextResponse.json(
          { 
            error: 'Google OAuth not configured',
            requiresConfig: true,
            message: 'Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.'
          },
          { status: 500 }
        )
      }
      
      try {
        const authUrl = getUnifiedAuthUrl()
        return NextResponse.json({ authUrl })
      } catch (error) {
        console.error('Error generating Google auth URL:', error)
        return NextResponse.json(
          { 
            error: 'Failed to generate authentication URL',
            details: error.message
          },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Invalid action parameter' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in Google auth route:', error)
    return NextResponse.json(
      { error: error.message || 'Authentication error' },
      { status: 500 }
    )
  }
}

