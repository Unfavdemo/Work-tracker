// Shared student calendar event storage module
// In production, replace this with a database (PostgreSQL, MongoDB, etc.)

let studentEvents = []

export function getStudentEvents() {
  return studentEvents
}

export function addStudentEvent(event) {
  studentEvents.push(event)
  // Keep only last 1000 events in memory
  if (studentEvents.length > 1000) {
    studentEvents = studentEvents.slice(-1000)
  }
  return event
}

export function deleteStudentEvent(id) {
  studentEvents = studentEvents.filter(event => event.id !== id)
  return true
}

export function updateStudentEventStatus(id, status) {
  const event = studentEvents.find(e => e.id === id)
  if (event) {
    event.status = status
    event.updatedAt = new Date().toISOString()
    return event
  }
  return null
}

export function getStudentEventStats() {
  const total = studentEvents.length
  const pending = studentEvents.filter(e => e.status === 'pending').length
  const approved = studentEvents.filter(e => e.status === 'approved').length
  const thisMonth = studentEvents.filter(event => {
    const eventDate = new Date(event.createdAt)
    const now = new Date()
    return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear()
  }).length

  return {
    total,
    pending,
    approved,
    thisMonth,
  }
}

