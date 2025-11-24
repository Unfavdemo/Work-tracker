import { NextResponse } from 'next/server'
import { getGmailAuthUrl, getGmailTokensFromCode } from '@/lib/gmail'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const code = searchParams.get('code')

    // Handle OAuth callback
    if (action === 'callback' && code) {
      try {
        const tokens = await getGmailTokensFromCode(code)
        return NextResponse.json({ 
          success: true,
          tokens,
          message: 'Gmail authentication successful'
        })
      } catch (error) {
        return NextResponse.json(
          { error: 'Failed to exchange code for tokens', details: error.message },
          { status: 400 }
        )
      }
    }

    // Return authorization URL
    if (action === 'url') {
      // Check if environment variables are configured
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        return NextResponse.json(
          { 
            error: 'Gmail OAuth not configured',
            requiresConfig: true,
            message: 'Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.'
          },
          { status: 500 }
        )
      }
      
      try {
        const authUrl = getGmailAuthUrl()
        return NextResponse.json({ authUrl })
      } catch (error) {
        console.error('Error generating Gmail auth URL:', error)
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
    console.error('Error in Gmail auth route:', error)
    return NextResponse.json(
      { error: error.message || 'Authentication error' },
      { status: 500 }
    )
  }
}

