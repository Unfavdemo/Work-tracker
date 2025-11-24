// Shared feedback storage module
// In production, replace this with a database (PostgreSQL, MongoDB, etc.)

let feedbacks = []

export function getFeedbacks() {
  return feedbacks
}

export function addFeedback(feedback) {
  feedbacks.push(feedback)
  // Keep only last 1000 feedbacks in memory
  if (feedbacks.length > 1000) {
    feedbacks = feedbacks.slice(-1000)
  }
  return feedback
}

export function deleteFeedback(id) {
  feedbacks = feedbacks.filter(feedback => feedback.id !== id)
  return true
}

export function getFeedbackStats() {
  const total = feedbacks.length
  const thisMonth = feedbacks.filter(feedback => {
    const feedbackDate = new Date(feedback.createdAt)
    const now = new Date()
    return feedbackDate.getMonth() === now.getMonth() && feedbackDate.getFullYear() === now.getFullYear()
  }).length

  const ratings = feedbacks.filter(f => f.rating).map(f => f.rating)
  const averageRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)
    : 0

  return {
    total,
    thisMonth,
    averageRating: parseFloat(averageRating),
  }
}

