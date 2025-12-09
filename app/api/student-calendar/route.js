import { NextResponse } from 'next/server'
import { getStudentEvents, addStudentEvent, deleteStudentEvent, updateStudentEventStatus, getStudentEventStats } from '@/lib/student-calendar-storage'
import { createCalendarEvent } from '@/lib/google-calendar'

// GET - Get all student calendar events
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentName = searchParams.get('studentName')
    const status = searchParams.get('status')
    
    let events = getStudentEvents()
    
    // Filter by student name if provided
    if (studentName) {
      events = events.filter(event => 
        event.studentName?.toLowerCase().includes(studentName.toLowerCase())
      )
    }
    
    // Filter by status if provided
    if (status) {
      events = events.filter(event => event.status === status)
    }
    
    // Sort by date (newest first)
    events.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
    
    const stats = getStudentEventStats()
    
    return NextResponse.json({
      events,
      stats,
      total: events.length,
    })
  } catch (error) {
    console.error('Error fetching student calendar events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch student calendar events' },
      { status: 500 }
    )
  }
}

// POST - Create a new student calendar event and automatically add to calendar
export async function POST(request) {
  try {
    const body = await request.json()
    const { studentName, title, start, end, description, location, timeZone } = body

    // Validation
    if (!studentName || !studentName.trim()) {
      return NextResponse.json(
        { error: 'Student name is required' },
        { status: 400 }
      )
    }

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Event title is required' },
        { status: 400 }
      )
    }

    if (!start || !end) {
      return NextResponse.json(
        { error: 'Start and end times are required' },
        { status: 400 }
      )
    }

    // Validate dates
    const startDate = new Date(start)
    const endDate = new Date(end)
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      )
    }

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      )
    }

    const newEvent = {
      id: `student-event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      studentName: studentName.trim(),
      title: title.trim(),
      start,
      end,
      description: description?.trim() || '',
      location: location?.trim() || '',
      timeZone: timeZone || 'America/New_York',
      status: 'pending', // Events require approval before being added to calendar
      createdAt: new Date().toISOString(),
    }

    addStudentEvent(newEvent)
    const stats = getStudentEventStats()

    return NextResponse.json({
      event: newEvent,
      stats,
      message: 'Calendar event request submitted. Waiting for approval.',
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating student calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to submit calendar event' },
      { status: 500 }
    )
  }
}

// PATCH - Update event status (e.g., approve and add to calendar)
export async function PATCH(request) {
  try {
    const body = await request.json()
    const { id, status, accessToken } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    const event = getStudentEvents().find(e => e.id === id)
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // If approving, try to add to Google Calendar
    if (status === 'approved' && accessToken) {
      try {
        const calendarEvent = await createCalendarEvent(
          accessToken,
          {
            title: event.title,
            start: event.start,
            end: event.end,
            description: `Requested by student: ${event.studentName}\n\n${event.description}`,
            location: event.location,
            timeZone: event.timeZone,
          },
          'primary'
        )
        
        const updatedEvent = updateStudentEventStatus(id, 'approved')
        if (updatedEvent) {
          updatedEvent.calendarEventId = calendarEvent.id
        }
        const stats = getStudentEventStats()
        
        return NextResponse.json({
          event: { ...event, status: 'approved', calendarEventId: calendarEvent.id },
          stats,
          message: 'Event approved and added to calendar',
        })
      } catch (calendarError) {
        console.error('Error adding event to calendar:', calendarError)
        // Still update status but note the error
        const updatedEvent = updateStudentEventStatus(id, 'approved')
        if (updatedEvent) {
          updatedEvent.calendarError = calendarError.message
        }
        return NextResponse.json({
          event: { ...event, status: 'approved', calendarError: calendarError.message },
          warning: 'Event approved but failed to add to calendar. Please add manually.',
        })
      }
    }
    
    // If disapproving, just update status
    if (status === 'disapproved' || status === 'rejected') {
      updateStudentEventStatus(id, 'disapproved')
      const stats = getStudentEventStats()
      return NextResponse.json({
        event: { ...event, status: 'disapproved' },
        stats,
        message: 'Event request rejected',
      })
    }

    updateStudentEventStatus(id, status)
    const stats = getStudentEventStats()

    return NextResponse.json({
      event: { ...event, status },
      stats,
      message: 'Event status updated successfully',
    })
  } catch (error) {
    console.error('Error updating student calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to update event status' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a student calendar event
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    const deleted = deleteStudentEvent(id)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Event deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting student calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}

