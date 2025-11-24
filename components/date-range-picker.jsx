'use client'

import { Button } from '@/components/ui/button'
import { Calendar, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const dateRanges = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
  { label: 'Custom', value: 'custom' },
]

export function DateRangePicker({ onRangeChange }) {
  const [selectedRange, setSelectedRange] = useState('month')
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (value) => {
    setSelectedRange(value)
    setIsOpen(false)
    if (onRangeChange) {
      onRangeChange(value)
    }
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="lg"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 h-12 px-6"
      >
        <Calendar className="h-5 w-5" />
        <span>{dateRanges.find(r => r.value === selectedRange)?.label}</span>
        <ChevronDown className="h-5 w-5" />
      </Button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 z-20 rounded-lg border border-border bg-card shadow-lg p-2 min-w-[200px]">
            {dateRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => handleSelect(range.value)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-md text-base transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  selectedRange === range.value && "bg-accent text-accent-foreground font-medium"
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

