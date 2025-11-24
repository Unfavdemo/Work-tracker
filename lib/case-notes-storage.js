// Shared case notes storage module
// In production, replace this with a database (PostgreSQL, MongoDB, etc.)

let caseNotes = []

export function getCaseNotes() {
  return caseNotes
}

export function addCaseNote(caseNote) {
  caseNotes.push(caseNote)
  // Keep only last 1000 case notes in memory
  if (caseNotes.length > 1000) {
    caseNotes = caseNotes.slice(-1000)
  }
  return caseNote
}

export function deleteCaseNote(id) {
  caseNotes = caseNotes.filter(note => note.id !== id)
  return true
}

export function getCaseNoteStats() {
  const total = caseNotes.length
  const thisMonth = caseNotes.filter(note => {
    const noteDate = new Date(note.date)
    const now = new Date()
    return noteDate.getMonth() === now.getMonth() && noteDate.getFullYear() === now.getFullYear()
  }).length

  return {
    total,
    thisMonth,
  }
}

