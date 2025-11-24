import { Clock, FileText, Sparkles, Calendar, MessageSquare, Mail, Users, MessageCircle, Lightbulb, TrendingUp, AlertCircle } from 'lucide-react'

export const timeData = [
  { day: 'Mon', hours: 0 },
  { day: 'Tue', hours: 0 },
  { day: 'Wed', hours: 0 },
  { day: 'Thu', hours: 0 },
  { day: 'Fri', hours: 0 },
  { day: 'Sat', hours: 0 },
  { day: 'Sun', hours: 0 },
]

export const aiUsageData = [
  { week: 'W1', usage: 45 },
  { week: 'W2', usage: 62 },
  { week: 'W3', usage: 58 },
  { week: 'W4', usage: 73 },
]

export const upcomingEvents = [
  { 
    id: '1',
    title: 'Data Science Workshop', 
    time: '10:00 AM', 
    date: 'Today', 
    status: 'upcoming',
    type: 'workshop'
  },
  { 
    id: '2',
    title: 'AI Ethics Session', 
    time: '2:00 PM', 
    date: 'Today', 
    status: 'upcoming',
    type: 'session'
  },
  { 
    id: '3',
    title: 'Python Basics', 
    time: '9:00 AM', 
    date: 'Tomorrow', 
    status: 'scheduled',
    type: 'workshop'
  },
  { 
    id: '4',
    title: 'ML Fundamentals', 
    time: '3:00 PM', 
    date: 'Nov 19', 
    status: 'scheduled',
    type: 'workshop'
  },
  { 
    id: '5',
    title: 'Data Visualization', 
    time: '11:00 AM', 
    date: 'Nov 20', 
    status: 'scheduled',
    type: 'workshop'
  },
  { 
    id: '6',
    title: 'Team Meeting', 
    time: '4:00 PM', 
    date: 'Nov 21', 
    status: 'scheduled',
    type: 'meeting'
  },
]

export const communicationData = [
  { 
    type: 'Meetings', 
    count: 42, 
    icon: Users, 
    progress: 85, 
    color: 'hsl(var(--chart-1))',
    trend: 12
  },
  { 
    type: 'Emails', 
    count: 156, 
    icon: Mail, 
    progress: 72, 
    color: 'hsl(var(--chart-2))',
    trend: -5
  },
  { 
    type: 'Conversations', 
    count: 89, 
    icon: MessageSquare, 
    progress: 60, 
    color: 'hsl(var(--chart-3))',
    trend: 8
  },
  { 
    type: 'Slack', 
    count: 234, 
    icon: MessageCircle, 
    progress: 95, 
    color: 'hsl(var(--chart-1))',
    trend: 15
  },
]

export const recommendations = [
  {
    id: '1',
    title: 'Peak Productivity',
    description: 'Your best workshop creation time is Tuesday mornings',
    icon: TrendingUp,
    type: 'insight',
    priority: 'medium',
  },
  {
    id: '2',
    title: 'AI Optimization',
    description: 'Consider using AI for slide deck templates to save 30% time',
    icon: Lightbulb,
    type: 'suggestion',
    priority: 'high',
  },
  {
    id: '3',
    title: 'Communication Gap',
    description: 'Slack response time increased by 15% this week',
    icon: AlertCircle,
    type: 'alert',
    priority: 'high',
  },
]


export const activityFeed = [
  {
    id: '1',
    type: 'workshop_created',
    title: 'Created new workshop: Advanced Python',
    timestamp: '2 hours ago',
    icon: FileText,
    color: 'chart-1'
  },
  {
    id: '2',
    type: 'communication',
    title: 'Responded to 15 student emails',
    timestamp: '4 hours ago',
    icon: Mail,
    color: 'chart-2'
  },
  {
    id: '3',
    type: 'ai_usage',
    title: 'Used AI to generate workshop outline',
    timestamp: '6 hours ago',
    icon: Sparkles,
    color: 'chart-3'
  },
  {
    id: '4',
    type: 'meeting',
    title: 'Completed team sync meeting',
    timestamp: '1 day ago',
    icon: Users,
    color: 'chart-4'
  },
  {
    id: '5',
    type: 'workshop_completed',
    title: 'Completed Data Science Workshop',
    timestamp: '2 days ago',
    icon: FileText,
    color: 'chart-1'
  },
  {
    id: '6',
    type: 'communication',
    title: 'Sent workshop materials to 32 students',
    timestamp: '3 days ago',
    icon: Mail,
    color: 'chart-2'
  },
  {
    id: '7',
    type: 'workshop_created',
    title: 'Created workshop: Statistics & Probability',
    timestamp: '4 days ago',
    icon: FileText,
    color: 'chart-1'
  },
]

export const performanceMetrics = {
  productivity: { value: 87, label: 'Productivity Score', trend: 5 },
  engagement: { value: 92, label: 'Student Engagement', trend: 8 },
  efficiency: { value: 78, label: 'Time Efficiency', trend: -2 },
  quality: { value: 94, label: 'Content Quality', trend: 3 },
}

export const recentWorkshops = []

export const additionalRecommendations = [
  {
    id: '4',
    title: 'Time Management',
    description: 'Schedule workshops during your peak hours (10 AM - 12 PM) for better efficiency',
    icon: Clock,
    type: 'insight',
    priority: 'medium',
  },
  {
    id: '5',
    title: 'Student Feedback',
    description: 'Recent workshops received 95% positive feedback - great job!',
    icon: TrendingUp,
    type: 'insight',
    priority: 'low',
  },
]

export const meetingData = [
  {
    id: '1',
    title: 'Team Sync Meeting',
    date: '2024-11-15',
    time: '10:00 AM',
    duration: 45,
    participants: 8,
    type: 'team',
    status: 'completed',
    platform: 'Zoom',
  },
  {
    id: '2',
    title: 'Student Office Hours',
    date: '2024-11-14',
    time: '2:00 PM',
    duration: 60,
    participants: 12,
    type: 'student',
    status: 'completed',
    platform: 'Google Meet',
  },
  {
    id: '3',
    title: 'Workshop Planning Session',
    date: '2024-11-13',
    time: '3:30 PM',
    duration: 30,
    participants: 5,
    type: 'planning',
    status: 'completed',
    platform: 'Zoom',
  },
  {
    id: '4',
    title: 'Weekly Team Standup',
    date: '2024-11-12',
    time: '9:00 AM',
    duration: 15,
    participants: 6,
    type: 'team',
    status: 'completed',
    platform: 'Zoom',
  },
  {
    id: '5',
    title: 'Student Q&A Session',
    date: '2024-11-11',
    time: '4:00 PM',
    duration: 90,
    participants: 25,
    type: 'student',
    status: 'completed',
    platform: 'Google Meet',
  },
]

export const meetingStats = {
  total: 42,
  thisMonth: 18,
  totalDuration: 1260, // minutes
  avgDuration: 30,
  totalParticipants: 342,
  avgParticipants: 8,
  trend: 12,
}

