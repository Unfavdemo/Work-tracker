import { NextResponse } from 'next/server'
import { recentWorkshops } from '@/lib/data'
import { getWorkshops } from '@/lib/workshop-storage'
import { convertCalendarEventsToWorkshops, mergeWorkshops } from '@/lib/workshop-sync'
import { fetchCalendarEvents } from '@/lib/google-calendar'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const sync = searchParams.get('sync') === 'true' // Force sync from APIs
    
    const sources = []
    const workshopArrays = []
    
    // 1. Get manually created workshops
    const storedWorkshops = getWorkshops()
    if (storedWorkshops.length > 0) {
      workshopArrays.push(storedWorkshops)
      sources.push('manual')
    }
    
    // 2. Try to fetch from Google Calendar API
    try {
      const authHeader = request.headers.get('authorization')
      const accessToken = authHeader?.replace('Bearer ', '')
      
      if (accessToken || sync) {
        // If we have a token or sync is requested, try to fetch
        if (accessToken) {
          const now = new Date()
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
          
          const calendarEvents = await fetchCalendarEvents(accessToken, {
            timeMin: sevenDaysAgo.toISOString(),
            timeMax: thirtyDaysFromNow.toISOString(),
            maxResults: 50,
          })
          
          const calendarWorkshops = convertCalendarEventsToWorkshops(calendarEvents)
          if (calendarWorkshops.length > 0) {
            workshopArrays.push(calendarWorkshops)
            sources.push('google_calendar')
          }
        }
      }
    } catch (calendarError) {
      console.warn('Google Calendar API not available:', calendarError.message)
    }
    
    // 3. Merge all workshops from different sources
    let allWorkshops = workshopArrays.length > 0 
      ? mergeWorkshops(...workshopArrays)
      : (storedWorkshops.length > 0 ? storedWorkshops : [])
    
    // Filter by status if provided
    if (status) {
      allWorkshops = allWorkshops.filter(w => w.status === status)
    }
    
    // Sort by date (newest first)
    allWorkshops.sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt || 0)
      const dateB = new Date(b.date || b.createdAt || 0)
      return dateB - dateA
    })
    
    return NextResponse.json({
      workshops: allWorkshops.slice(0, limit),
      source: sources.length > 0 ? sources.join(',') : 'fallback',
      total: allWorkshops.length,
      sources: sources,
    })
  } catch (error) {
    console.error('Error fetching workshops:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch workshops' },
      { status: 500 }
    )
  }
}



