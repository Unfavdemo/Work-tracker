import { NextResponse } from 'next/server'
import { getAuthUrl, getTokensFromCode } from '@/lib/google-calendar'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const code = searchParams.get('code')

    // Handle OAuth callback
    if (action === 'callback' && code) {
      try {
        const tokens = await getTokensFromCode(code)
        return NextResponse.json({ 
          success: true,
          tokens,
          message: 'Authentication successful'
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
      const authUrl = getAuthUrl()
      return NextResponse.json({ authUrl })
    }

    return NextResponse.json(
      { error: 'Invalid action parameter' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error in auth route:', error)
    return NextResponse.json(
      { error: error.message || 'Authentication error' },
      { status: 500 }
    )
  }
}

