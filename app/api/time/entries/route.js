import { NextResponse } from 'next/server'
import { getTimeEntries, addTimeEntry, removeTimeEntry } from '@/lib/time-storage'

// Helper function to format time
const formatTime = (seconds) => {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

// GET - Retrieve time entries
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit')) || 50
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Get entries from shared storage
    const allEntries = getTimeEntries() || []
    let filteredEntries = [...allEntries]

    // Filter by date range if provided
    if (startDate || endDate) {
      filteredEntries = filteredEntries.filter(entry => {
        const entryDate = new Date(entry.date || entry.endTime)
        if (startDate && entryDate < new Date(startDate)) return false
        if (endDate && entryDate > new Date(endDate)) return false
        return true
      })
    }

    // Sort by date (newest first)
    filteredEntries.sort((a, b) => {
      const dateA = new Date(a.date || a.endTime || 0)
      const dateB = new Date(b.date || b.endTime || 0)
      return dateB - dateA
    })

    // Apply limit
    const limitedEntries = filteredEntries.slice(0, limit)

    // Calculate summary stats
    const totalDuration = filteredEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0)
    const todayEntries = filteredEntries.filter(entry => {
      const entryDate = new Date(entry.date || entry.endTime)
      const today = new Date()
      return entryDate.toDateString() === today.toDateString()
    })
    const todayDuration = todayEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0)

    return NextResponse.json({
      entries: limitedEntries,
      summary: {
        total: filteredEntries.length,
        totalDuration,
        totalDurationFormatted: formatTime(totalDuration),
        today: todayEntries.length,
        todayDuration,
        todayDurationFormatted: formatTime(todayDuration),
      },
    })
  } catch (error) {
    console.error('Error fetching time entries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch time entries' },
      { status: 500 }
    )
  }
}

// POST - Create a new time entry
export async function POST(request) {
  try {
    const body = await request.json()
    const { task, duration, startTime, endTime } = body

    if (!task || duration === undefined) {
      return NextResponse.json(
        { error: 'Task and duration are required' },
        { status: 400 }
      )
    }

    const newEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      task: task.trim(),
      duration: Math.floor(duration), // Ensure it's an integer
      startTime: startTime || Date.now() - (duration * 1000),
      endTime: endTime || Date.now(),
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }

    addTimeEntry(newEntry)

    return NextResponse.json({
      entry: newEntry,
      message: 'Time entry saved successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating time entry:', error)
    return NextResponse.json(
      { error: 'Failed to create time entry' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a time entry
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      )
    }

    // Remove from shared storage
    const removed = removeTimeEntry(id)
    
    if (!removed) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Time entry deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting time entry:', error)
    return NextResponse.json(
      { error: 'Failed to delete time entry' },
      { status: 500 }
    )
  }
}

