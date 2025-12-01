# Taheera's Workshop Tracker

A comprehensive time tracking and data management dashboard built with Next.js for monitoring workshop creation, student communication, and AI usage analytics.

## Features

### Core Features
- **Workshop Management**: Track and manage workshops with detailed statistics including student count, duration, ratings, and status
- **Workshop Creator**: Create and manage workshops with dynamic form builder
- **Communication Analytics**: Monitor communication channels including meetings, emails, conversations, and Slack interactions
- **Email Tracking**: Track Gmail interactions and email statistics
- **AI Usage Tracking**: Comprehensive AI efficiency and usage pattern tracking with detailed analytics
- **ChatGPT Integration**: Built-in ChatGPT interface for AI-assisted workshop creation
- **Time Tracking**: Track time spent on workshops, meetings, and activities
- **Case Notes**: Manage and organize case notes for students and workshops
- **Student Management**: 
  - Student feedback management system
  - Student calendar management
  - Individual student pages with detailed tracking
- **Performance Metrics**: View productivity scores, student engagement, time efficiency, and content quality metrics
- **Schedule Panel**: View upcoming events and scheduled workshops with Google Calendar integration
- **AI Recommendations**: Get intelligent insights and suggestions for optimizing workshop creation and communication
- **Search & Filter**: Powerful search functionality with autocomplete suggestions across workshops, events, and activities
- **Data Export**: Export workshop data in JSON format
- **Settings Page**: Comprehensive settings for integrations, preferences, and form management
- **Dark/Light Theme**: Toggle between dark and light themes for comfortable viewing
- **Responsive Design**: Fully responsive layout that works on all device sizes

### Integrations
- **Google Workspace**: 
  - Google Calendar integration for event management
  - Gmail integration for email tracking
  - Google Docs integration for document creation
- **Zoom**: Meeting integration and tracking
- **ChatGPT**: AI-powered assistance for workshop creation

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) with App Router
- **UI Components**: [Radix UI](https://www.radix-ui.com) primitives
- **Styling**: [Tailwind CSS](https://tailwindcss.com) v4 with custom animations
- **Charts**: [Recharts](https://recharts.org) for data visualization
- **Icons**: [Lucide React](https://lucide.dev)
- **Forms**: [React Hook Form](https://react-hook-form.com) with [Zod](https://zod.dev) validation
- **Date Handling**: [date-fns](https://date-fns.org) and [react-day-picker](https://react-day-picker.js.org)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski) toast notifications
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes) for theme management
- **Google APIs**: [googleapis](https://github.com/googleapis/google-api-nodejs-client) for Google Workspace integration
- **Analytics**: [Vercel Analytics](https://vercel.com/analytics) for usage tracking
- **Command Palette**: [cmdk](https://cmdk.paco.me) for command interface

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Unfavdemo/Taheera-Time-data-tracker-.git
cd Taheera-Time-data-tracker-
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
Taheera-Time-data-tracker-/
├── app/                      # Next.js app directory
│   ├── page.jsx             # Main dashboard page
│   ├── layout.jsx            # Root layout with theme provider
│   ├── globals.css           # Global styles and theme variables
│   ├── settings/             # Settings page
│   │   └── page.jsx
│   ├── ai-usage/             # AI usage analytics page
│   │   └── page.jsx
│   ├── chatgpt/             # ChatGPT integration page
│   │   └── page.jsx
│   ├── student/              # Student management pages
│   │   ├── page.jsx         # Student list
│   │   └── [id]/            # Individual student pages
│   │       └── page.jsx
│   └── api/                  # API routes
│       ├── workshops/        # Workshop CRUD operations
│       ├── communication/    # Communication stats
│       ├── ai-usage/         # AI usage tracking
│       ├── gmail/            # Gmail integration
│       ├── calendar/         # Google Calendar integration
│       ├── zoom/             # Zoom integration
│       ├── chatgpt/          # ChatGPT API
│       ├── time/             # Time tracking
│       ├── case-notes/       # Case notes management
│       ├── feedback/         # Student feedback
│       ├── performance/      # Performance metrics
│       └── recommendations/  # AI recommendations
├── components/               # React components
│   ├── ui/                  # Reusable UI components (Radix UI)
│   ├── workshop-list.jsx
│   ├── workshop-stats.jsx
│   ├── workshop-creator.jsx
│   ├── communication-stats.jsx
│   ├── email-tracker.jsx
│   ├── performance-metrics.jsx
│   ├── ai-recommendations.jsx
│   ├── ai-usage-tracker.jsx
│   ├── schedule-panel.jsx
│   ├── export-panel.jsx
│   ├── date-range-picker.jsx
│   ├── time-tracker.jsx
│   ├── case-notes.jsx
│   ├── student-feedback-manager.jsx
│   ├── student-calendar-manager.jsx
│   ├── chatgpt-enhanced.jsx
│   ├── form-editor.jsx
│   ├── dynamic-form.jsx
│   ├── theme-provider.jsx
│   └── theme-toggle.jsx
├── lib/                      # Utility functions and data
│   ├── data.js              # Mock data and data structures
│   ├── utils.js             # Helper functions
│   ├── workshop-storage.js  # Workshop data persistence
│   ├── ai-usage-storage.js  # AI usage data storage
│   ├── time-storage.js      # Time tracking storage
│   ├── case-notes-storage.js # Case notes storage
│   ├── feedback-storage.js  # Feedback storage
│   ├── form-storage.js      # Form definitions storage
│   ├── student-calendar-storage.js
│   ├── google-auth.js       # Google OAuth
│   ├── google-calendar.js   # Calendar API wrapper
│   ├── gmail.js             # Gmail API wrapper
│   ├── google-docs.js       # Google Docs API
│   ├── workshop-sync.js     # Workshop synchronization
│   ├── recommendation-engine.js
│   └── api-config.js        # API configuration
├── public/                   # Static assets
├── package.json
├── next.config.js
├── tailwind.config.js
└── README.md
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Key Components

### Dashboard (`app/page.jsx`)
The main dashboard provides a comprehensive overview with:
- **Quick Stats Bar**: Active workshops, weekly growth percentage, and AI efficiency metrics
- **Workshop Statistics**: Charts and metrics for workshop creation and management
- **Workshop Creator**: Dynamic form builder for creating new workshops
- **Communication Statistics**: Analytics across email, meetings, and other channels
- **Email Tracker**: Gmail integration for tracking email interactions
- **AI Usage Tracker**: Detailed AI usage analytics and efficiency metrics
- **Time Tracker**: Track time spent on various activities
- **Case Notes**: Manage and organize case notes
- **Performance Metrics**: Productivity scores, engagement metrics, and quality indicators
- **AI Recommendations**: Intelligent insights and optimization suggestions
- **Workshop List**: Recent workshops with filtering and search
- **Schedule Panel**: Upcoming events with Google Calendar integration
- **Student Feedback Manager**: Manage student feedback and reviews
- **Student Calendar Manager**: Manage student-specific calendar events
- **Export Panel**: Export data in JSON format

### Additional Pages

#### Settings (`app/settings/page.jsx`)
- Theme preferences (dark/light/system)
- Integration settings (Google, Zoom, ChatGPT)
- Refresh interval configuration
- Form editor for custom workshop forms
- Data management and export options

#### AI Usage Analytics (`app/ai-usage/page.jsx`)
- Comprehensive AI usage statistics
- Cost tracking and token usage
- Success rate metrics
- Usage logs with filtering
- Time-based analytics and charts

#### ChatGPT Integration (`app/chatgpt/page.jsx`)
- Built-in ChatGPT interface
- AI-assisted workshop creation
- Conversation history
- Context-aware suggestions

#### Student Pages (`app/student/`)
- Student list overview
- Individual student detail pages
- Student-specific analytics and tracking

### Search Functionality
The dashboard includes a powerful search feature with:
- Real-time autocomplete suggestions
- Search across workshops, events, and activities
- Keyboard navigation support (Arrow keys, Enter, Escape)
- Highlighted search results
- Category-based filtering

### API Routes
The application includes comprehensive API routes for:
- **Workshops**: Create, list, stats, and sync operations
- **Communication**: Stats and analytics
- **AI Usage**: Logging and statistics
- **Gmail**: Authentication, stats, and thread management
- **Google Calendar**: Authentication, event creation, and retrieval
- **Zoom**: Authentication and meeting management
- **ChatGPT**: Chat interface and API integration
- **Time Tracking**: Entry management
- **Case Notes**: CRUD operations
- **Feedback**: Student feedback management
- **Performance**: Metrics calculation
- **Recommendations**: AI-powered recommendations

## Customization

### Adding New Data
Edit `lib/data.js` to add or modify:
- Workshop data
- Communication statistics
- Activity feed items
- AI recommendations
- Performance metrics

### Styling
The project uses Tailwind CSS v4 with custom theme variables. Modify `app/globals.css` to customize colors, spacing, and other design tokens.

### Form Builder
Use the Settings page to create custom forms for workshop creation. Forms are stored in `lib/form-storage.js` and can be dynamically rendered using the `DynamicForm` component.

### Storage
The application uses browser localStorage for data persistence. Storage modules are located in the `lib/` directory:
- `workshop-storage.js` - Workshop data
- `ai-usage-storage.js` - AI usage logs
- `time-storage.js` - Time entries
- `case-notes-storage.js` - Case notes
- `feedback-storage.js` - Student feedback
- `form-storage.js` - Form definitions

### Environment Variables
For production deployments, configure the following environment variables:
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `ZOOM_CLIENT_ID` - Zoom OAuth client ID
- `ZOOM_CLIENT_SECRET` - Zoom OAuth client secret
- `OPENAI_API_KEY` - OpenAI API key for ChatGPT integration

## Deployment

### Deploy on Vercel

The easiest way to deploy this Next.js app is using the [Vercel Platform](https://vercel.com/new):

1. Push your code to GitHub
2. Import your repository on Vercel
3. Vercel will automatically detect Next.js and configure the build settings
4. Deploy!

For more details, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## Development

### Local Development
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000)

### Building for Production
```bash
npm run build
npm start
```

### Code Quality
- Run linter: `npm run lint`
- The project uses ESLint for code quality checks

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - Interactive Next.js tutorial
- [Radix UI Documentation](https://www.radix-ui.com/docs) - UI component library
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Utility-first CSS framework
- [Google APIs Documentation](https://developers.google.com/docs/api) - Google Workspace APIs

## License

This project is private and proprietary.
