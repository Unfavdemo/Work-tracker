import { NextResponse } from 'next/server'
import { addWorkshop, getWorkshopStats } from '@/lib/workshop-storage'

// POST - Create a new workshop
export async function POST(request) {
  try {
    const body = await request.json()
    const { 
      title, students, duration, rating, status, date, time,
      weekOverview, rubricFocus, competencyFocus, indicatorFocus,
      studentObjectives, cccCode, cccTitle, level6, level8, level10, level12,
      openingQuestion, introOverview, activities, journalReflection,
      activityStructure, checkout
    } = body

    // Validation
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Workshop title is required' },
        { status: 400 }
      )
    }

    const newWorkshop = {
      id: `workshop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      weekOverview: weekOverview || '',
      students: parseInt(students) || 0,
      duration: duration || '0h',
      rating: parseFloat(rating) || 0,
      status: status || 'in_progress',
      date: date || new Date().toISOString().split('T')[0],
      time: time || '',
      rubricFocus: rubricFocus || '',
      competencyFocus: competencyFocus || '',
      indicatorFocus: indicatorFocus || '',
      studentObjectives: studentObjectives || '',
      cccCode: cccCode || '',
      cccTitle: cccTitle || '',
      level6: level6 || '',
      level8: level8 || '',
      level10: level10 || '',
      level12: level12 || '',
      openingQuestion: openingQuestion || '',
      introOverview: introOverview || '',
      activities: activities || '',
      journalReflection: journalReflection || '',
      activityStructure: activityStructure || '',
      checkout: checkout || '',
      createdAt: new Date().toISOString(),
    }

    addWorkshop(newWorkshop)
    const stats = getWorkshopStats()

    return NextResponse.json({
      workshop: newWorkshop,
      stats,
      message: 'Workshop created successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating workshop:', error)
    return NextResponse.json(
      { error: 'Failed to create workshop' },
      { status: 500 }
    )
  }
}

// GET - Get workshop creation stats
export async function GET(request) {
  try {
    const { getWorkshops, getWorkshopStats } = await import('@/lib/workshop-storage')
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const allWorkshops = getWorkshops()
    let filteredWorkshops = [...allWorkshops]

    // Filter by date range if provided
    if (startDate || endDate) {
      filteredWorkshops = filteredWorkshops.filter(workshop => {
        const workshopDate = new Date(workshop.date || workshop.createdAt)
        if (startDate && workshopDate < new Date(startDate)) return false
        if (endDate && workshopDate > new Date(endDate)) return false
        return true
      })
    }

    // Calculate additional time-based stats
    const today = new Date()
    const todayWorkshops = filteredWorkshops.filter(w => {
      const workshopDate = new Date(w.date || w.createdAt)
      return workshopDate.toDateString() === today.toDateString()
    })

    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const thisWeekWorkshops = filteredWorkshops.filter(w => {
      const workshopDate = new Date(w.date || w.createdAt)
      return workshopDate >= weekStart
    })

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const thisMonthWorkshops = filteredWorkshops.filter(w => {
      const workshopDate = new Date(w.date || w.createdAt)
      return workshopDate >= monthStart
    })

    const baseStats = getWorkshopStats()

    return NextResponse.json({
      stats: {
        ...baseStats,
        today: todayWorkshops.length,
        thisWeek: thisWeekWorkshops.length,
        thisMonth: thisMonthWorkshops.length,
      },
      workshops: filteredWorkshops,
    })
  } catch (error) {
    console.error('Error fetching workshop stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workshop stats' },
      { status: 500 }
    )
  }
}

