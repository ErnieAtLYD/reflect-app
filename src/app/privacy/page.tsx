'use client'

import { ArrowLeft, Lock, Shield, Eye, Database } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePageTracking } from '@/hooks/use-analytics'

export default function PrivacyPage() {
  usePageTracking()
  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reflect
          </Button>
        </Link>
        <div className="mb-4 flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-lg">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-foreground font-heading text-3xl font-bold sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-sm">
              How we protect your thoughts and data
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Content */}
      <div className="max-w-4xl space-y-8">
        {/* Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Our Privacy Commitment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Reflect is built with privacy as the foundation. Your thoughts are
              yours, and they stay that way. We believe in radical transparency
              about what happens to your data.
            </p>
            <div className="bg-success/10 border-success/20 rounded-lg border p-4">
              <p className="text-success-foreground font-medium">
                🔒 Your journal entries are never stored on our servers
              </p>
            </div>
          </CardContent>
        </Card>

        {/* What We Don't Collect */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              What We DON&apos;T Collect
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-muted-foreground space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-success mt-1">✓</span>
                <span>
                  <strong>No personal information</strong> - No names, emails,
                  or accounts required
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success mt-1">✓</span>
                <span>
                  <strong>No journal storage</strong> - Your entries are
                  processed and immediately discarded
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success mt-1">✓</span>
                <span>
                  <strong>No tracking cookies</strong> - We don&apos;t track you
                  across the web
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success mt-1">✓</span>
                <span>
                  <strong>No analytics</strong> - We don&apos;t use Google
                  Analytics or similar services
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success mt-1">✓</span>
                <span>
                  <strong>No IP logging</strong> - We don&apos;t store
                  connection information
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How Reflect Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
                  1
                </div>
                <div>
                  <h4 className="font-medium">You write your entry</h4>
                  <p className="text-muted-foreground text-sm">
                    Your thoughts stay in your browser
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
                  2
                </div>
                <div>
                  <h4 className="font-medium">AI processes temporarily</h4>
                  <p className="text-muted-foreground text-sm">
                    Sent securely to OpenAI, processed, and immediately
                    discarded
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
                  3
                </div>
                <div>
                  <h4 className="font-medium">You receive your reflection</h4>
                  <p className="text-muted-foreground text-sm">
                    The AI&apos;s response comes back to you - no copies kept
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Local Storage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Optional Local History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              You can optionally enable local history storage to save your
              entries and reflections in your browser. This is entirely optional
              and under your control.
            </p>
            <ul className="text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Stored locally in your browser only</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Limited to your last 5 entries</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Can be disabled or cleared anytime</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Never sent to our servers</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card>
          <CardHeader>
            <CardTitle>Your Rights</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3">
            <p>Since we don&apos;t store your data, you automatically have:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-success mt-1">✓</span>
                <span>
                  <strong>Right to be forgotten</strong> - Your data is never
                  stored to begin with
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success mt-1">✓</span>
                <span>
                  <strong>Data portability</strong> - Your local history can be
                  exported anytime
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success mt-1">✓</span>
                <span>
                  <strong>Control</strong> - You decide what to keep locally and
                  what to delete
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Questions?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              If you have any questions about this privacy policy or how Reflect
              works, feel free to reach out. We&apos;re committed to
              transparency and will gladly explain any aspect of our privacy
              practices.
            </p>
            <p className="text-muted-foreground mt-4 text-sm">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
