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

    const stats = await getStudentEmailStats(accessToken, { days, studentKeywords })

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching student email stats:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch student email stats',
        details: error.code || 'Unknown error'
      },
      { status: 500 }
    )
  }
}

