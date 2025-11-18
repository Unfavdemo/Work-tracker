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
      const authUrl = getGmailAuthUrl()
      return NextResponse.json({ authUrl })
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

