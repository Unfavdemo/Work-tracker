'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Clock, Play, Pause, Square, Plus, X, Loader2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function TimeTracker() {
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [currentTask, setCurrentTask] = useState('')
  const [showTaskInput, setShowTaskInput] = useState(false)
  const [timeEntries, setTimeEntries] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const intervalRef = useRef(null)
  const startTimeRef = useRef(null)
  const pausedTimeRef = useRef(0)

  useEffect(() => {
    fetchTimeEntries()
  }, [])

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        const now = Date.now()
        const elapsed = Math.floor((now - startTimeRef.current + pausedTimeRef.current) / 1000)
        setElapsedTime(elapsed)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, isPaused])

  const fetchTimeEntries = async () => {
    try {
      const response = await fetch('/api/time/entries')
      if (response.ok) {
        const data = await response.json()
        if (data.entries) {
          setTimeEntries(data.entries.slice(0, 5)) // Show last 5 entries
        }
      }
    } catch (error) {
      console.error('Error fetching time entries:', error)
    }
  }

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const handleStart = () => {
    if (!currentTask.trim() && !showTaskInput) {
      setShowTaskInput(true)
      toast.info('Please enter a task name to start tracking')
      return
    }

    if (showTaskInput && !currentTask.trim()) {
      toast.error('Please enter a task name')
      return
    }

    if (isPaused) {
      // Resume from pause
      setIsPaused(false)
      startTimeRef.current = Date.now() - pausedTimeRef.current
      toast.success('Timer resumed')
    } else {
      // Start new timer
      startTimeRef.current = Date.now()
      pausedTimeRef.current = 0
      setElapsedTime(0)
      setIsRunning(true)
      setShowTaskInput(false)
      toast.success(`Started tracking: ${currentTask || 'Untitled Task'}`)
    }
  }

  const handlePause = () => {
    if (isRunning && !isPaused) {
      setIsPaused(true)
      pausedTimeRef.current = elapsedTime * 1000
      toast.info('Timer paused')
    }
  }

  const handleStop = async () => {
    if (!isRunning && elapsedTime === 0) return

    const finalTime = elapsedTime
    const taskName = currentTask.trim() || 'Untitled Task'

    setIsLoading(true)
    try {
      const response = await fetch('/api/time/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task: taskName,
          duration: finalTime,
          startTime: startTimeRef.current,
          endTime: Date.now(),
        }),
      })

      if (response.ok) {
        toast.success(`Saved ${formatTime(finalTime)} for "${taskName}"`)
        setElapsedTime(0)
        setCurrentTask('')
        setIsRunning(false)
        setIsPaused(false)
        pausedTimeRef.current = 0
        fetchTimeEntries()
      } else {
        toast.error('Failed to save time entry')
      }
    } catch (error) {
      console.error('Error saving time entry:', error)
      toast.error('Failed to save time entry')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setElapsedTime(0)
    setIsRunning(false)
    setIsPaused(false)
    setCurrentTask('')
    setShowTaskInput(false)
    pausedTimeRef.current = 0
    toast.info('Timer reset')
  }

  return (
    <Card className="border-2 border-border/70 bg-card transition-all duration-500 hover:border-accent hover:shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-card-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              Time Tracker
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Track time spent on workshops and activities
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 w-full h-full flex flex-col">
        {/* Task Input */}
        {showTaskInput && (
          <div className="flex gap-3 animate-in slide-in-from-top duration-200">
            <Input
              placeholder="Enter task name (e.g., Workshop Creation, Email Response)"
              value={currentTask}
              onChange={(e) => setCurrentTask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && currentTask.trim()) {
                  handleStart()
                } else if (e.key === 'Escape') {
                  setShowTaskInput(false)
                  setCurrentTask('')
                }
              }}
              className="flex-1"
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowTaskInput(false)
                setCurrentTask('')
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Current Task Display */}
        {!showTaskInput && currentTask && (
          <div className="rounded-lg border border-border/50 bg-secondary/30 p-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">Current Task</p>
            <p className="text-base font-semibold text-card-foreground">{currentTask}</p>
          </div>
        )}

        {/* Timer Display */}
          <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-border/50 bg-gradient-to-br from-secondary/40 to-secondary/20 p-6">
          <div className="text-6xl font-mono font-bold text-card-foreground tabular-nums">
            {formatTime(elapsedTime)}
          </div>
          
          {/* Control Buttons */}
          <div className="flex items-center gap-3">
            {!isRunning && !isPaused && (
              <>
                <Button
                  onClick={() => {
                    if (!currentTask) {
                      setShowTaskInput(true)
                    } else {
                      handleStart()
                    }
                  }}
                  className="gap-2"
                  size="lg"
                >
                  <Play className="h-4 w-4" />
                  Start
                </Button>
                {currentTask && (
                  <Button
                    variant="outline"
                    onClick={() => setShowTaskInput(true)}
                    className="gap-2"
                    size="lg"
                  >
                    <Plus className="h-4 w-4" />
                    Change Task
                  </Button>
                )}
              </>
            )}

            {isRunning && !isPaused && (
              <>
                <Button
                  onClick={handlePause}
                  variant="outline"
                  className="gap-2"
                  size="lg"
                >
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
                <Button
                  onClick={handleStop}
                  variant="destructive"
                  className="gap-2"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  Stop & Save
                </Button>
              </>
            )}

            {isPaused && (
              <>
                <Button
                  onClick={handleStart}
                  className="gap-2"
                  size="lg"
                >
                  <Play className="h-4 w-4" />
                  Resume
                </Button>
                <Button
                  onClick={handleStop}
                  variant="destructive"
                  className="gap-2"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  Stop & Save
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="lg"
                >
                  Reset
                </Button>
              </>
            )}

            {!isRunning && !isPaused && !currentTask && (
              <Button
                onClick={() => setShowTaskInput(true)}
                variant="outline"
                className="gap-2"
                size="lg"
              >
                <Plus className="h-4 w-4" />
                New Task
              </Button>
            )}
          </div>
        </div>

        {/* Recent Time Entries */}
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-card-foreground">Recent Entries</h4>
          {timeEntries.length > 0 ? (
            <div className="space-y-3">
              {timeEntries.map((entry, index) => (
                <div
                  key={entry.id || index}
                  className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/20 p-4 text-base"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-card-foreground truncate">{entry.task}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.date ? new Date(entry.date).toLocaleDateString() : 'Today'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span className="font-mono font-semibold text-card-foreground tabular-nums">
                      {formatTime(entry.duration || 0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border/50 bg-secondary/10 p-4 text-center">
              <Clock className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No time entries yet</p>
              <p className="text-xs text-muted-foreground mt-1">Start tracking time to see your history here</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

