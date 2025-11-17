import { Clock, FileText, Sparkles, Calendar, MessageSquare, Mail, Users, MessageCircle, Lightbulb, TrendingUp, AlertCircle } from 'lucide-react'

export const timeData = [
  { day: 'Mon', hours: 4.5 },
  { day: 'Tue', hours: 6.2 },
  { day: 'Wed', hours: 3.8 },
  { day: 'Thu', hours: 5.5 },
  { day: 'Fri', hours: 4.0 },
  { day: 'Sat', hours: 2.5 },
  { day: 'Sun', hours: 1.8 },
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

export const workshopStats = {
  avgTime: { value: 4.6, unit: 'h', trend: 0.3 },
  decksCreated: { value: 28, unit: '', trend: 4 },
  aiUsage: { value: 62, unit: '%', trend: 8 },
}

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

export const recentWorkshops = [
  {
    id: '1',
    title: 'Data Science Fundamentals',
    students: 45,
    duration: '4.5h',
    rating: 4.8,
    status: 'completed',
    date: '2024-11-15'
  },
  {
    id: '2',
    title: 'Machine Learning Basics',
    students: 38,
    duration: '5.2h',
    rating: 4.9,
    status: 'completed',
    date: '2024-11-12'
  },
  {
    id: '3',
    title: 'Python for Beginners',
    students: 52,
    duration: '3.8h',
    rating: 4.7,
    status: 'completed',
    date: '2024-11-10'
  },
  {
    id: '4',
    title: 'Advanced Analytics',
    students: 28,
    duration: '6.1h',
    rating: 4.9,
    status: 'in_progress',
    date: '2024-11-16'
  },
  {
    id: '5',
    title: 'Deep Learning Workshop',
    students: 35,
    duration: '7.2h',
    rating: 4.9,
    status: 'completed',
    date: '2024-11-08'
  },
  {
    id: '6',
    title: 'Statistics & Probability',
    students: 41,
    duration: '5.8h',
    rating: 4.6,
    status: 'completed',
    date: '2024-11-05'
  },
]

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

