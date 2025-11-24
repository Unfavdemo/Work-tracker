import { NextResponse } from 'next/server'
import { fetchCalendarEvents } from '@/lib/google-calendar'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      )
    }

    // Get events from 7 days ago to 30 days in the future
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    const timeMin = searchParams.get('timeMin') || sevenDaysAgo.toISOString()
    const timeMax = searchParams.get('timeMax') || thirtyDaysFromNow.toISOString()
    const maxResults = parseInt(searchParams.get('maxResults') || '50')
    const calendarId = searchParams.get('calendarId') || 'primary'

    console.log('Fetching calendar events with token:', accessToken ? 'Token present' : 'No token')
    
    const events = await fetchCalendarEvents(accessToken, {
      timeMin,
      timeMax,
      maxResults,
      calendarId,
    })

    console.log('Raw events from Google Calendar:', events.length)

    // Transform Google Calendar events to match our component's expected format
    const transformedEvents = events.map((event, index) => {
      // Handle all-day events (date) vs timed events (dateTime)
      const start = event.start?.dateTime || event.start?.date
      const end = event.end?.dateTime || event.end?.date
      
      if (!start) {
        console.warn('Event missing start time:', event.id, event.summary)
        return null
      }
      
      const startDate = new Date(start)
      
      // Validate date
      if (isNaN(startDate.getTime())) {
        console.warn('Invalid start date for event:', event.id, event.summary, start)
        return null
      }
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const eventDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
      
      let dateLabel = ''
      const diffTime = eventDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) {
        dateLabel = 'Today'
      } else if (diffDays === 1) {
        dateLabel = 'Tomorrow'
      } else {
        dateLabel = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }

      // For all-day events, show "All Day" instead of time
      const isAllDay = !event.start?.dateTime && event.start?.date
      const timeLabel = isAllDay 
        ? 'All Day' 
        : startDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })

      return {
        id: event.id,
        title: event.summary || 'No Title',
        time: timeLabel,
        date: dateLabel,
        status: diffDays < 0 ? 'past' : diffDays === 0 ? 'upcoming' : 'scheduled',
        type: event.eventType || 'event',
        description: event.description || '',
        location: event.location || '',
        start: start,
        end: end,
        htmlLink: event.htmlLink,
      }
    }).filter(event => event !== null) // Remove any null events from invalid dates

    console.log('Transformed events:', transformedEvents.length)
    return NextResponse.json({ events: transformedEvents })
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      originalError: error.originalError,
    })
    
    // Check if it's an authentication error
    const isAuthError = error.code === 401 || 
                       error.code === 403 || 
                       error.message?.includes('invalid authentication') ||
                       error.message?.includes('authentication credential') ||
                       error.message?.includes('Invalid or expired authentication token')
    
    // Check if it's a network error
    const isNetworkError = error.code === 'ENOTFOUND' || 
                          error.code === 'ECONNREFUSED' || 
                          error.code === 'ETIMEDOUT' ||
                          error.code === 'NETWORK_ERROR' ||
                          error.message?.includes('getaddrinfo') ||
                          error.message?.includes('ENOTFOUND') ||
                          error.message?.includes('Network error')
    
    let statusCode = 500
    let errorMessage = error.message || 'Failed to fetch calendar events'
    
    if (isAuthError) {
      statusCode = error.code || 401
      errorMessage = 'Invalid or expired authentication token'
    } else if (isNetworkError) {
      statusCode = 503 // Service Unavailable
      errorMessage = error.message || 'Network error: Unable to connect to Google Calendar API'
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.code || 'Unknown error',
        type: isAuthError ? 'authentication' : isNetworkError ? 'network' : 'unknown'
      },
      { status: statusCode }
    )
  }
}

