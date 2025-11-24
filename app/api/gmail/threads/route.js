import { NextResponse } from 'next/server'
import { getRecentStudentEmailThreads } from '@/lib/gmail'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '')
    const maxResults = parseInt(searchParams.get('maxResults') || '10')
    const studentKeywords = searchParams.get('keywords')?.split(',') || []
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      )
    }

    const threads = await getRecentStudentEmailThreads(accessToken, maxResults, studentKeywords)

    return NextResponse.json({ threads })
  } catch (error) {
    console.error('Error fetching student email threads:', error)
    
    // Check if it's an authentication error
    const isAuthError = error.code === 401 || 
                       error.code === 403 || 
                       error.message?.includes('invalid authentication') ||
                       error.message?.includes('authentication credential') ||
                       error.message?.includes('OAuth 2') ||
                       error.message?.includes('Invalid or expired authentication token') ||
                       error.message?.includes('Request had invalid authentication credentials')
    
    const statusCode = isAuthError ? (error.code || 401) : 500
    const errorMessage = isAuthError 
      ? 'Invalid or expired authentication token'
      : (error.message || 'Failed to fetch student email threads')
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.code || 'Unknown error'
      },
      { status: statusCode }
    )
  }
}

