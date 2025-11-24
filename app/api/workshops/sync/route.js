import { NextResponse } from 'next/server'
import { fetchCalendarEvents } from '@/lib/google-calendar'
import { convertCalendarEventsToWorkshops } from '@/lib/workshop-sync'
import { getWorkshops, getWorkshopStats } from '@/lib/workshop-storage'

/**
 * Sync workshops from all connected APIs
 * GET /api/workshops/sync - Force sync from all APIs
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '')
    
    const syncResults = {
      google_calendar: { count: 0, error: null },
      manual: { count: 0 },
    }
    
    // Sync from Google Calendar
    if (accessToken) {
      try {
        const now = new Date()
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        
        const calendarEvents = await fetchCalendarEvents(accessToken, {
          timeMin: sevenDaysAgo.toISOString(),
          timeMax: thirtyDaysFromNow.toISOString(),
          maxResults: 50,
        })
        
        const calendarWorkshops = convertCalendarEventsToWorkshops(calendarEvents)
        syncResults.google_calendar.count = calendarWorkshops.length
      } catch (error) {
        console.error('Error syncing Google Calendar:', error)
        syncResults.google_calendar.error = error.message
      }
    }
    
    // Get manual workshops count
    const manualWorkshops = getWorkshops()
    syncResults.manual.count = manualWorkshops.length
    
    // Get total stats
    const stats = getWorkshopStats()
    
    return NextResponse.json({
      success: true,
      syncResults,
      stats,
      message: 'Workshop sync completed',
    })
  } catch (error) {
    console.error('Error syncing workshops:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to sync workshops' 
      },
      { status: 500 }
    )
  }
}

