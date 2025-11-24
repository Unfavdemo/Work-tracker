// Utility functions for managing workshop drafts

const DRAFTS_STORAGE_KEY = 'workshop_drafts'

/**
 * Get all saved drafts
 * @returns {Array} Array of draft objects
 */
export function getDrafts() {
  try {
    const draftsJson = localStorage.getItem(DRAFTS_STORAGE_KEY)
    if (!draftsJson) return []
    const drafts = JSON.parse(draftsJson)
    // Sort by last modified date (newest first)
    return drafts.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
  } catch (error) {
    console.error('Error loading drafts:', error)
    return []
  }
}

/**
 * Save a draft
 * @param {Object} draftData - The workshop form data to save
 * @param {string} draftId - Optional draft ID (for updating existing drafts)
 * @returns {string} The draft ID
 */
export function saveDraft(draftData, draftId = null) {
  try {
    const drafts = getDrafts()
    const id = draftId || `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    
    const draft = {
      id,
      ...draftData,
      lastModified: now,
      createdAt: draftId ? drafts.find(d => d.id === draftId)?.createdAt || now : now,
    }
    
    if (draftId) {
      // Update existing draft
      const index = drafts.findIndex(d => d.id === draftId)
      if (index !== -1) {
        drafts[index] = draft
      } else {
        drafts.push(draft)
      }
    } else {
      // Add new draft
      drafts.push(draft)
    }
    
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts))
    return id
  } catch (error) {
    console.error('Error saving draft:', error)
    throw error
  }
}

/**
 * Get a specific draft by ID
 * @param {string} draftId - The draft ID
 * @returns {Object|null} The draft object or null if not found
 */
export function getDraft(draftId) {
  try {
    const drafts = getDrafts()
    return drafts.find(d => d.id === draftId) || null
  } catch (error) {
    console.error('Error getting draft:', error)
    return null
  }
}

/**
 * Delete a draft
 * @param {string} draftId - The draft ID to delete
 * @returns {boolean} True if deleted successfully
 */
export function deleteDraft(draftId) {
  try {
    const drafts = getDrafts()
    const filtered = drafts.filter(d => d.id !== draftId)
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error('Error deleting draft:', error)
    return false
  }
}

/**
 * Clear all drafts
 */
export function clearAllDrafts() {
  try {
    localStorage.removeItem(DRAFTS_STORAGE_KEY)
    return true
  } catch (error) {
    console.error('Error clearing drafts:', error)
    return false
  }
}

