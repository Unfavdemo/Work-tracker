// Shared workshop storage module
// In production, replace this with a database (PostgreSQL, MongoDB, etc.)

let workshops = []

export function getWorkshops() {
  return workshops
}

export function addWorkshop(workshop) {
  workshops.push(workshop)
  // Keep only last 1000 workshops in memory
  if (workshops.length > 1000) {
    workshops = workshops.slice(-1000)
  }
  return workshop
}

export function getWorkshopStats() {
  const total = workshops.length
  const completed = workshops.filter(w => w.status === 'completed').length
  const inProgress = workshops.filter(w => w.status === 'in_progress').length
  const scheduled = workshops.filter(w => w.status === 'scheduled').length
  const totalStudents = workshops.reduce((sum, w) => sum + (w.students || 0), 0)
  const avgRating = workshops.length > 0
    ? workshops.reduce((sum, w) => sum + (w.rating || 0), 0) / workshops.length
    : 0

  return {
    total,
    completed,
    inProgress,
    scheduled,
    totalStudents,
    avgRating: Math.round(avgRating * 10) / 10,
  }
}

