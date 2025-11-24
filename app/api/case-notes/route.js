import { NextResponse } from 'next/server'
import { getCaseNotes, addCaseNote, deleteCaseNote, getCaseNoteStats } from '@/lib/case-notes-storage'

// GET - Get all case notes
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientName = searchParams.get('clientName')
    
    let notes = getCaseNotes()
    
    // Filter by client name if provided
    if (clientName) {
      notes = notes.filter(note => 
        note.clientName.toLowerCase().includes(clientName.toLowerCase())
      )
    }
    
    // Sort by date (newest first)
    notes.sort((a, b) => {
      // Parse date string MM/DD/YY to Date object
      const parseDate = (dateStr) => {
        const [month, day, year] = dateStr.split('/')
        return new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day))
      }
      return parseDate(b.date) - parseDate(a.date)
    })
    
    const stats = getCaseNoteStats()
    
    return NextResponse.json({
      notes,
      stats,
      total: notes.length,
    })
  } catch (error) {
    console.error('Error fetching case notes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch case notes' },
      { status: 500 }
    )
  }
}

// POST - Create a new case note
export async function POST(request) {
  try {
    const body = await request.json()
    const { date, clientName, discussion, barriers, solutions, nextSteps } = body

    // Validation
    if (!date || !date.trim()) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      )
    }

    if (!clientName || !clientName.trim()) {
      return NextResponse.json(
        { error: 'Client name is required' },
        { status: 400 }
      )
    }

    if (!discussion || !discussion.trim()) {
      return NextResponse.json(
        { error: 'Discussion is required' },
        { status: 400 }
      )
    }

    const newCaseNote = {
      id: `case-note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: date.trim(),
      clientName: clientName.trim(),
      discussion: discussion.trim(),
      barriers: barriers?.trim() || '',
      solutions: solutions?.trim() || '',
      nextSteps: nextSteps?.trim() || '',
      createdAt: new Date().toISOString(),
    }

    addCaseNote(newCaseNote)
    const stats = getCaseNoteStats()

    return NextResponse.json({
      note: newCaseNote,
      stats,
      message: 'Case note created successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating case note:', error)
    return NextResponse.json(
      { error: 'Failed to create case note' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a case note
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Case note ID is required' },
        { status: 400 }
      )
    }

    const deleted = deleteCaseNote(id)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Case note not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Case note deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting case note:', error)
    return NextResponse.json(
      { error: 'Failed to delete case note' },
      { status: 500 }
    )
  }
}

