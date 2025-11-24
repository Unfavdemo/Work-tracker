import { NextResponse } from 'next/server'
import { getStudentEmailStats } from '@/lib/gmail'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '')
    const days = parseInt(searchParams.get('days') || '30')
    const studentKeywords = searchParams.get('keywords')?.split(',') || []
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      )
    }

    console.log('Fetching student email stats with token:', accessToken ? 'Token present' : 'No token')
    const stats = await getStudentEmailStats(accessToken, { days, studentKeywords })
    console.log('Student email stats retrieved:', {
      total: stats?.total,
      sent: stats?.sent,
      received: stats?.received,
      hasDailyBreakdown: !!stats?.dailyBreakdown
    })

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching student email stats:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    })
    
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
      : (error.message || 'Failed to fetch student email stats')
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.code || 'Unknown error',
        stats: null
      },
      { status: statusCode }
    )
  }
}

