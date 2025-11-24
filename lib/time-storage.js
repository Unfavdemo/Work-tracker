// Shared time entries storage (matches the one in app/api/time/entries/route.js)
// In production, replace with database

let timeEntries = []

export function getTimeEntries() {
  return [...timeEntries] // Return a copy to prevent direct mutation
}

export function addTimeEntry(entry) {
  timeEntries.push(entry)
  // Keep only last 1000 entries
  if (timeEntries.length > 1000) {
    timeEntries = timeEntries.slice(-1000)
  }
  return entry
}

export function removeTimeEntry(id) {
  const initialLength = timeEntries.length
  timeEntries = timeEntries.filter(entry => entry.id !== id)
  return initialLength > timeEntries.length
}

// Export as default for compatibility
export default { timeEntries: getTimeEntries }

