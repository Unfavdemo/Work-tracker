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
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch student email threads',
        details: error.code || 'Unknown error'
      },
      { status: 500 }
    )
  }
}

