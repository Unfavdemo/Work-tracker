import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { AnalyticsWrapper } from '@/components/analytics-wrapper'
import { Footer } from '@/components/footer'
import './globals.css'
import { ErrorHandler } from '@/components/error-handler'

const geist = Geist({ 
  subsets: ["latin"],
  variable: '--font-geist-sans',
  display: 'swap',
})
const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono',
  display: 'swap',
})

export const metadata = {
  title: 'Taheera\'s Workshop Tracker | Dashboard',
  description: 'Monitor workshop creation, student communication, and AI usage with real-time insights and smart recommendations',
  generator: 'Next.js',
  keywords: ['workshop', 'tracker', 'dashboard', 'analytics', 'education'],
  authors: [{ name: 'Taheera' }],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.svg',
        media: '(prefers-color-scheme: light)',
        type: 'image/svg+xml',
      },
      {
        url: '/icon-dark-32x32.svg',
        media: '(prefers-color-scheme: dark)',
        type: 'image/svg+xml',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        <ErrorHandler />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <div className="flex flex-col min-h-screen">
            {children}
            <Footer />
          </div>
          <Toaster position="top-right" richColors />
          <AnalyticsWrapper />
        </ThemeProvider>
      </body>
    </html>
  )
}

