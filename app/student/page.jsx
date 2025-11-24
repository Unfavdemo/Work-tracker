'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GraduationCap, Rocket, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/theme-toggle'

export default function StudentSelectionPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-background/80 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      <div className="mx-auto max-w-5xl w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between pt-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 p-3 shadow-lg">
                <Sparkles className="h-6 w-6 text-accent" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                Student Portal
              </h1>
            </div>
            <p className="text-base text-muted-foreground pl-12">
              Select your program to access your dedicated portal
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {/* 101 Student Portal */}
          <Card 
            className="border-2 border-border/70 bg-card/80 backdrop-blur-sm transition-all duration-500 hover:border-accent hover:shadow-2xl hover:shadow-accent/20 hover:-translate-y-1 cursor-pointer group relative overflow-hidden"
            onClick={() => router.push('/student/101')}
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/0 group-hover:from-accent/5 group-hover:to-accent/0 transition-all duration-500 pointer-events-none"></div>
            
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 p-4 group-hover:from-blue-500/30 group-hover:to-blue-600/20 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg">
                  <GraduationCap className="h-7 w-7 text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-card-foreground group-hover:text-accent transition-colors">
                    101 Student
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Foundation Program</p>
                </div>
              </div>
              <CardDescription className="text-muted-foreground text-base leading-relaxed">
                Access the 101 Student Portal to submit bi-weekly check-ins and request calendar events. Track your progress and stay connected.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Bi-weekly check-ins</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Calendar event requests</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Progress tracking</span>
                </div>
              </div>
              <Button 
                className="w-full gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                size="lg"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push('/student/101')
                }}
              >
                Enter Portal
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* Liftoff Student Portal */}
          <Card 
            className="border-2 border-border/70 bg-card/80 backdrop-blur-sm transition-all duration-500 hover:border-accent hover:shadow-2xl hover:shadow-accent/20 hover:-translate-y-1 cursor-pointer group relative overflow-hidden"
            onClick={() => router.push('/student/liftoff')}
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/0 group-hover:from-accent/5 group-hover:to-accent/0 transition-all duration-500 pointer-events-none"></div>
            
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 p-4 group-hover:from-purple-500/30 group-hover:to-purple-600/20 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 shadow-lg">
                  <Rocket className="h-7 w-7 text-purple-500 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-card-foreground group-hover:text-accent transition-colors">
                    Lift Student
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">Advanced Program</p>
                </div>
              </div>
              <CardDescription className="text-muted-foreground text-base leading-relaxed">
                Access the Liftoff Student Portal to submit bi-weekly check-ins and request calendar events. Elevate your journey to the next level.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Bi-weekly check-ins</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Calendar event requests</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Advanced tracking</span>
                </div>
              </div>
              <Button 
                className="w-full gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                size="lg"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push('/student/liftoff')
                }}
              >
                Enter Portal
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="border-2 border-border/50 bg-card/60 backdrop-blur-sm mt-12 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 p-3 shadow-md">
                <Sparkles className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-base font-semibold">How to use</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Click on the card for your program (101 Student or Lift Student) to access your dedicated portal. 
                  Each portal allows you to submit bi-weekly check-ins and request calendar events. Your responses help us better support you on your journey.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
