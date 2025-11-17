# Taheera's Workshop Tracker

A comprehensive time tracking and data management dashboard built with Next.js for monitoring workshop creation, student communication, and AI usage analytics.

## Features

- **Workshop Management**: Track and manage workshops with detailed statistics including student count, duration, ratings, and status
- **Communication Analytics**: Monitor communication channels including meetings, emails, conversations, and Slack interactions
- **AI Usage Tracking**: Track AI efficiency and usage patterns for workshop creation
- **Performance Metrics**: View productivity scores, student engagement, time efficiency, and content quality metrics
- **Activity Feed**: Real-time activity feed showing recent workshop creations, communications, and AI usage
- **Schedule Panel**: View upcoming events and scheduled workshops
- **AI Recommendations**: Get intelligent insights and suggestions for optimizing workshop creation and communication
- **Search & Filter**: Powerful search functionality with autocomplete suggestions across workshops, events, and activities
- **Data Export**: Export workshop data in JSON format
- **Dark/Light Theme**: Toggle between dark and light themes for comfortable viewing
- **Responsive Design**: Fully responsive layout that works on all device sizes

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) with App Router
- **UI Components**: [Radix UI](https://www.radix-ui.com) primitives
- **Styling**: [Tailwind CSS](https://tailwindcss.com) with custom animations
- **Charts**: [Recharts](https://recharts.org) for data visualization
- **Icons**: [Lucide React](https://lucide.dev)
- **Forms**: [React Hook Form](https://react-hook-form.com) with [Zod](https://zod.dev) validation
- **Date Handling**: [date-fns](https://date-fns.org) and [react-day-picker](https://react-day-picker.js.org)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski) toast notifications
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes) for theme management

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
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
├── Taheera-Time/
│   ├── app/              # Next.js app directory
│   │   ├── page.jsx      # Main dashboard page
│   │   ├── layout.jsx    # Root layout
│   │   └── globals.css   # Global styles
│   ├── components/       # React components
│   │   ├── ui/          # Reusable UI components
│   │   ├── workshop-list.jsx
│   │   ├── workshop-stats.jsx
│   │   ├── communication-stats.jsx
│   │   ├── performance-metrics.jsx
│   │   ├── ai-recommendations.jsx
│   │   ├── activity-feed.jsx
│   │   ├── schedule-panel.jsx
│   │   ├── export-panel.jsx
│   │   └── date-range-picker.jsx
│   └── lib/             # Utility functions and data
│       ├── data.js      # Mock data and data structures
│       └── utils.js     # Helper functions
├── package.json
└── README.md
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Key Components

### Dashboard
The main dashboard (`app/page.jsx`) provides a comprehensive overview with:
- Quick stats bar showing active workshops, weekly growth, AI efficiency, and total students
- Workshop statistics with charts and metrics
- Communication statistics across different channels
- Performance metrics visualization
- AI-powered recommendations
- Recent workshops list
- Activity feed
- Schedule panel for upcoming events

### Search Functionality
The dashboard includes a powerful search feature with:
- Real-time autocomplete suggestions
- Search across workshops, events, and activities
- Keyboard navigation support (Arrow keys, Enter, Escape)
- Highlighted search results

## Customization

### Adding New Data
Edit `Taheera-Time/lib/data.js` to add or modify:
- Workshop data
- Communication statistics
- Activity feed items
- AI recommendations
- Performance metrics

### Styling
The project uses Tailwind CSS with custom theme variables. Modify `app/globals.css` to customize colors, spacing, and other design tokens.

## Deployment

### Deploy on Vercel

The easiest way to deploy this Next.js app is using the [Vercel Platform](https://vercel.com/new):

1. Push your code to GitHub
2. Import your repository on Vercel
3. Vercel will automatically detect Next.js and configure the build settings
4. Deploy!

For more details, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - Interactive Next.js tutorial
- [Next.js GitHub Repository](https://github.com/vercel/next.js) - Contribute or provide feedback

## License

This project is private and proprietary.
