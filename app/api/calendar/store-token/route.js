import { NextResponse } from 'next/server'

// POST - Store Google Calendar token server-side for automatic event addition
export async function POST(request) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token || !token.trim()) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Store token in global variable (in-memory storage)
    // In production, use a database or secure key-value store
    global.googleCalendarToken = token.trim()

    return NextResponse.json({
      message: 'Token stored successfully',
      success: true,
    })
  } catch (error) {
    console.error('Error storing token:', error)
    return NextResponse.json(
      { error: 'Failed to store token' },
      { status: 500 }
    )
  }
}

// GET - Check if token is stored (without exposing it)
export async function GET() {
  try {
    const hasToken = !!(global.googleCalendarToken || process.env.GOOGLE_CALENDAR_TOKEN)
    
    return NextResponse.json({
      hasToken,
      message: hasToken ? 'Token is available' : 'Token not available',
    })
  } catch (error) {
    console.error('Error checking token:', error)
    return NextResponse.json(
      { error: 'Failed to check token' },
      { status: 500 }
    )
  }
}

