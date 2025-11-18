import { NextResponse } from 'next/server'
import { createCalendarEvent } from '@/lib/google-calendar'

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
    const { title, start, end, description, location, timeZone, calendarId } = body

    if (!title || !start || !end) {
      return NextResponse.json(
        { error: 'Title, start, and end are required' },
        { status: 400 }
      )
    }

    const event = await createCalendarEvent(
      accessToken,
      {
        title,
        start,
        end,
        description,
        location,
        timeZone,
      },
      calendarId || 'primary'
    )

    return NextResponse.json({ event, success: true })
  } catch (error) {
    console.error('Error creating calendar event:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create calendar event' },
      { status: 500 }
    )
  }
}

