import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  const inputRef = React.useRef(null)
  const combinedRef = React.useCallback((node) => {
    inputRef.current = node
    
    // Initialize valueAsNumber immediately when node is available
    if (node && type === 'number') {
      try {
        // Ensure valueAsNumber is always available, even if browser hasn't initialized it yet
        if (!('valueAsNumber' in node) || Object.getOwnPropertyDescriptor(node, 'valueAsNumber') === undefined) {
          // Define valueAsNumber property to prevent extension errors
          Object.defineProperty(node, 'valueAsNumber', {
            get() {
              const value = this.value
              return value === '' || value === null || value === undefined ? NaN : Number(value)
            },
            set(val) {
              this.value = val === null || val === undefined || isNaN(val) ? '' : String(val)
            },
            enumerable: true,
            configurable: true
          })
        }
      } catch (error) {
        // Silently ignore - property may already be defined
        console.debug('Input valueAsNumber initialization:', error)
      }
    }
    
    if (typeof ref === 'function') {
      ref(node)
    } else if (ref) {
      ref.current = node
    }
  }, [ref, type])

  // Additional protection: ensure valueAsNumber is available after mount
  React.useEffect(() => {
    if (!inputRef.current || type !== 'number') return
    
    try {
      // Double-check that valueAsNumber is available
      if (!('valueAsNumber' in inputRef.current)) {
        Object.defineProperty(inputRef.current, 'valueAsNumber', {
          get() {
            const value = this.value
            return value === '' || value === null || value === undefined ? NaN : Number(value)
          },
          set(val) {
            this.value = val === null || val === undefined || isNaN(val) ? '' : String(val)
          },
          enumerable: true,
          configurable: true
        })
      }
    } catch (error) {
      // Silently ignore
      console.debug('Input valueAsNumber check:', error)
    }
  }, [type])

  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-md border border-input bg-background px-4 py-3 text-base ring-offset-background file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={combinedRef}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }

