'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PrivacyPolicyPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              Your Privacy Matters
            </CardTitle>
            <CardDescription>
              We are committed to protecting your privacy and personal information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 prose prose-invert max-w-none">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
              <p className="text-muted-foreground mb-4">
                Taheera's Workshop Tracker collects the following types of information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Workshop and event data that you create and manage</li>
                <li>Student information and communication data (when you connect Google services)</li>
                <li>Usage analytics to improve the application</li>
                <li>Authentication tokens for integrated services (Google Calendar, Gmail, etc.)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">
                We use the collected information to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Provide and maintain the Workshop Tracker service</li>
                <li>Process and manage workshop and calendar events</li>
                <li>Enable integration with Google Workspace services</li>
                <li>Improve user experience and application functionality</li>
                <li>Generate analytics and performance reports</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Data Storage and Security</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <Lock className="h-4 w-4 inline mr-2" />
                  Your data is stored locally in your browser (localStorage) and is not transmitted to external servers unless you explicitly connect third-party services.
                </p>
                <p>
                  <Eye className="h-4 w-4 inline mr-2" />
                  When you connect Google services, authentication tokens are stored securely and only used to access the services you've authorized.
                </p>
                <p>
                  We implement appropriate security measures to protect your information from unauthorized access, alteration, disclosure, or destruction.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Third-Party Services</h2>
              <p className="text-muted-foreground mb-4">
                This application integrates with the following third-party services:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Google Workspace:</strong> Calendar, Gmail, Drive, and Docs integration</li>
                <li><strong>Zoom:</strong> Meeting integration</li>
                <li><strong>OpenAI/ChatGPT:</strong> AI-powered features</li>
                <li><strong>Vercel Analytics:</strong> Usage analytics (anonymized)</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                These services have their own privacy policies. We recommend reviewing their policies to understand how they handle your data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
              <p className="text-muted-foreground mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Access your personal data stored in the application</li>
                <li>Export your data in JSON format</li>
                <li>Delete your data at any time</li>
                <li>Disconnect third-party integrations</li>
                <li>Request information about how your data is used</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
              <p className="text-muted-foreground">
                Your data is retained as long as you use the application. You can delete your data at any time through the application settings or by clearing your browser's local storage.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy, please contact us through the application settings or your usual communication channels.
              </p>
              <p className="text-muted-foreground mt-2">
                This application is hosted at:{' '}
                <a 
                  href="https://taheera-time-data-tracker.vercel.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  https://taheera-time-data-tracker.vercel.app
                </a>
              </p>
            </section>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button asChild>
            <Link href="/terms">
              <FileText className="h-4 w-4 mr-2" />
              View Terms of Service
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

