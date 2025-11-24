'use client'

import { useEffect } from 'react'

/**
 * Global error handler to catch and suppress errors from browser extensions
 * This prevents extension errors from breaking the application
 */
export function ErrorHandler() {
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event) => {
      const errorMessage = event.reason?.message || ''
      const errorStack = event.reason?.stack || ''
      const errorString = typeof event.reason === 'string' ? event.reason : ''
      
      // Check if error is from a browser extension
      if (
        errorMessage.includes('chrome-extension://') ||
        errorMessage.includes('moz-extension://') ||
        errorMessage.includes('safari-extension://') ||
        errorStack.includes('chrome-extension://') ||
        errorStack.includes('moz-extension://') ||
        errorStack.includes('safari-extension://') ||
        errorMessage.includes('valueAsNumber') ||
        errorMessage.includes('Cannot set properties of null') ||
        errorString.includes('valueAsNumber') ||
        errorString.includes('chrome-extension://')
      ) {
        // Suppress extension-related errors
        event.preventDefault()
        event.stopPropagation()
        console.debug('Suppressed extension error:', errorMessage || errorStack || errorString)
        return
      }
      // Let other errors through normally
    }

    // Handle general errors
    const handleError = (event) => {
      const errorSource = event.filename || event.error?.stack || ''
      const errorMessage = event.message || event.error?.message || ''
      
      // Check if error is from a browser extension
      if (
        errorSource.includes('chrome-extension://') ||
        errorSource.includes('moz-extension://') ||
        errorSource.includes('safari-extension://') ||
        errorMessage.includes('valueAsNumber') ||
        errorMessage.includes('Cannot set properties of null') ||
        errorMessage.includes('chrome-extension://') ||
        (event.error?.stack && event.error.stack.includes('chrome-extension://'))
      ) {
        // Suppress extension-related errors
        event.preventDefault()
        event.stopPropagation()
        console.debug('Suppressed extension error:', errorMessage || errorSource)
        return false
      }
      // Let other errors through normally
    }

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [])

  return null
}

