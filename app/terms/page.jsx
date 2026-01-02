'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TermsOfServicePage() {
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
            <h1 className="text-3xl font-bold">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              Terms and Conditions
            </CardTitle>
            <CardDescription>
              Please read these terms carefully before using Workshop Tracker.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 prose prose-invert max-w-none">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using Workshop Tracker, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Use License</h2>
              <p className="text-muted-foreground mb-4">
                Permission is granted to temporarily use Workshop Tracker for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained in the application</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. User Responsibilities</h2>
              <p className="text-muted-foreground mb-4">
                You are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Maintaining the confidentiality of your account and authentication tokens</li>
                <li>All activities that occur under your account</li>
                <li>Ensuring the accuracy of data you enter into the system</li>
                <li>Complying with all applicable laws and regulations</li>
                <li>Respecting the privacy and rights of students and other users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Third-Party Integrations</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  This application integrates with third-party services including Google Workspace, Zoom, and OpenAI. By using these integrations, you agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Comply with the terms of service of each third-party service</li>
                  <li>Understand that we are not responsible for third-party service availability or data handling</li>
                  <li>Accept that third-party services may have their own privacy policies and terms</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Data and Content</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <CheckCircle2 className="h-4 w-4 inline mr-2 text-green-500" />
                  You retain ownership of all data you create and store in the application.
                </p>
                <p>
                  <AlertTriangle className="h-4 w-4 inline mr-2 text-yellow-500" />
                  You are responsible for backing up your data. We recommend regularly exporting your data.
                </p>
                <p>
                  <XCircle className="h-4 w-4 inline mr-2 text-red-500" />
                  We are not liable for any data loss that may occur.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Prohibited Uses</h2>
              <p className="text-muted-foreground mb-4">
                You may not use this application:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>In any way that violates any applicable law or regulation</li>
                <li>To transmit any malicious code or viruses</li>
                <li>To collect or store personal data of others without consent</li>
                <li>To impersonate or misrepresent your affiliation with any person or entity</li>
                <li>To interfere with or disrupt the application or servers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Disclaimer</h2>
              <p className="text-muted-foreground">
                The materials on Workshop Tracker are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Limitations</h2>
              <p className="text-muted-foreground">
                In no event shall Workshop Tracker or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the application, even if we or an authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Revisions and Errata</h2>
              <p className="text-muted-foreground">
                The materials appearing on Workshop Tracker could include technical, typographical, or photographic errors. We do not warrant that any of the materials are accurate, complete, or current. We may make changes to the materials at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Modifications to Terms</h2>
              <p className="text-muted-foreground">
                We may revise these terms of service at any time without notice. By using this application, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Contact Information</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us through the application settings or your usual communication channels.
              </p>
              <p className="text-muted-foreground mt-2">
                This application is hosted at:{' '}
                <a 
                  href="https://your-app.vercel.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  https://your-app.vercel.app
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
            <Link href="/privacy">
              <FileText className="h-4 w-4 mr-2" />
              View Privacy Policy
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

