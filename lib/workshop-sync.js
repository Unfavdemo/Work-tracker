/**
 * Workshop Sync Utility
 * Converts events from various APIs (Google Calendar) into workshop format
 */

/**
 * Convert Google Calendar events to workshops
 * @param {Array} calendarEvents - Array of Google Calendar events
 * @returns {Array} Array of workshop objects
 */
export function convertCalendarEventsToWorkshops(calendarEvents) {
  if (!Array.isArray(calendarEvents)) return []
  
  return calendarEvents
    .filter(event => {
      // Filter for workshop-like events (you can customize this logic)
      const title = (event.summary || event.title || '').toLowerCase()
      const description = (event.description || '').toLowerCase()
      
      // Check if it's a workshop (contains keywords or has workshop-like structure)
      const isWorkshop = 
        title.includes('workshop') ||
        title.includes('training') ||
        title.includes('session') ||
        title.includes('class') ||
        description.includes('workshop') ||
        description.includes('training')
      
      return isWorkshop || event.type === 'workshop'
    })
    .map((event, index) => {
      const start = event.start?.dateTime || event.start?.date || event.start
      const end = event.end?.dateTime || event.end?.date || event.end
      const startDate = start ? new Date(start) : new Date()
      const endDate = end ? new Date(end) : new Date()
      
      // Calculate duration in hours
      const durationMs = endDate - startDate
      const durationHours = Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10
      const duration = durationHours > 0 ? `${durationHours}h` : '1h'
      
      // Determine status based on date
      const now = new Date()
      let status = 'scheduled'
      if (startDate < now && endDate < now) {
        status = 'completed'
      } else if (startDate <= now && endDate >= now) {
        status = 'in_progress'
      }
      
      // Extract student count from description or attendees
      const attendees = event.attendees || []
      const students = attendees.length > 0 ? attendees.length : 0
      
      return {
        id: `calendar-${event.id || `event-${index}`}`,
        title: event.summary || event.title || 'Untitled Workshop',
        students: students,
        duration: duration,
        rating: 0, // No rating from calendar
        status: status,
        date: startDate.toISOString().split('T')[0],
        createdAt: startDate.toISOString(),
        source: 'google_calendar',
        originalEvent: {
          id: event.id,
          htmlLink: event.htmlLink,
          location: event.location,
          description: event.description,
        },
      }
    })
}

/**
 * Merge workshops from different sources, removing duplicates
 * @param {Array} workshops - Array of workshop arrays from different sources
 * @returns {Array} Merged and deduplicated workshops
 */
export function mergeWorkshops(...workshopArrays) {
  const allWorkshops = workshopArrays.flat()
  const seen = new Map()
  
  // Deduplicate by title and date (same workshop on same day)
  return allWorkshops.filter(workshop => {
    const key = `${workshop.title.toLowerCase()}-${workshop.date}`
    
    if (seen.has(key)) {
      // If duplicate, prefer manually created over API-sourced
      const existing = seen.get(key)
      if (workshop.source && !existing.source) {
        // Keep the manually created one
        return false
      }
      if (!workshop.source && existing.source) {
        // Replace API-sourced with manually created
        const index = allWorkshops.indexOf(existing)
        if (index > -1) {
          allWorkshops[index] = workshop
        }
        seen.set(key, workshop)
        return false
      }
      return false
    }
    
    seen.set(key, workshop)
    return true
  })
}

