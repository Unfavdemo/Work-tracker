import { NextResponse } from 'next/server'
import { getFeedbacks, addFeedback, deleteFeedback, getFeedbackStats } from '@/lib/feedback-storage'

// GET - Get all feedbacks
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentName = searchParams.get('studentName')
    
    let feedbacks = getFeedbacks()
    
    // Filter by student name if provided
    if (studentName) {
      feedbacks = feedbacks.filter(feedback => 
        feedback.studentName?.toLowerCase().includes(studentName.toLowerCase())
      )
    }
    
    // Sort by date (newest first)
    feedbacks.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
    
    const stats = getFeedbackStats()
    
    return NextResponse.json({
      feedbacks,
      stats,
      total: feedbacks.length,
    })
  } catch (error) {
    console.error('Error fetching feedbacks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedbacks' },
      { status: 500 }
    )
  }
}

// POST - Create a new feedback
export async function POST(request) {
  try {
    const body = await request.json()
    const { studentName, rating, message, category } = body

    // Validation
    if (!studentName || !studentName.trim()) {
      return NextResponse.json(
        { error: 'Student name is required' },
        { status: 400 }
      )
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Feedback message is required' },
        { status: 400 }
      )
    }

    const newFeedback = {
      id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      studentName: studentName.trim(),
      rating: rating ? parseInt(rating) : null,
      message: message.trim(),
      category: category?.trim() || 'general',
      createdAt: new Date().toISOString(),
    }

    addFeedback(newFeedback)
    const stats = getFeedbackStats()

    return NextResponse.json({
      feedback: newFeedback,
      stats,
      message: 'Feedback submitted successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating feedback:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a feedback
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Feedback ID is required' },
        { status: 400 }
      )
    }

    const deleted = deleteFeedback(id)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Feedback deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting feedback:', error)
    return NextResponse.json(
      { error: 'Failed to delete feedback' },
      { status: 500 }
    )
  }
}

