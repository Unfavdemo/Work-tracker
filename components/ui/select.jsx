import * as React from "react"
import { cn } from "@/lib/utils"

const Select = React.forwardRef(({ children, className, value, onValueChange, disabled, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const selectRef = React.useRef(null)

  React.useImperativeHandle(ref, () => selectRef.current)

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const childrenArray = React.Children.toArray(children)
  const trigger = childrenArray.find(child => child.type === SelectTrigger)
  const content = childrenArray.find(child => child.type === SelectContent)

  return (
    <div ref={selectRef} className="relative">
      {React.cloneElement(trigger, {
        onClick: () => !disabled && setIsOpen(!isOpen),
        isOpen,
      })}
      {isOpen && content && (
        <div className="absolute z-50 w-full mt-1">
          {React.cloneElement(content, {
            onSelect: (val) => {
              onValueChange?.(val)
              setIsOpen(false)
            },
            currentValue: value,
          })}
        </div>
      )}
    </div>
  )
})
Select.displayName = "Select"

const SelectTrigger = React.forwardRef(({ className, children, isOpen, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
    <svg
      className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </button>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = React.forwardRef(({ className, children, onSelect, currentValue, ...props }, ref) => {
  const childrenArray = React.Children.toArray(children)
  const items = childrenArray.filter(child => child.type === SelectItem)

  return (
    <div
      ref={ref}
      className={cn(
        "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
        className
      )}
      {...props}
    >
      <div className="p-1">
        {items.map((item, index) =>
          React.cloneElement(item, {
            key: index,
            isSelected: item.props.value === currentValue,
            onClick: () => onSelect?.(item.props.value),
          })
        )}
      </div>
    </div>
  )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef(({ className, children, isSelected, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
      isSelected && "bg-accent text-accent-foreground",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
SelectItem.displayName = "SelectItem"

const SelectValue = React.forwardRef(({ className, placeholder, children, ...props }, ref) => {
  const value = children || placeholder
  return (
    <span ref={ref} className={cn("block truncate", className)} {...props}>
      {value}
    </span>
  )
})
SelectValue.displayName = "SelectValue"

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue }

