'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ErrorMessage } from '@/components/ui/error-message'
import { Feedback } from '@/components/ui/feedback'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Textarea } from '@/components/ui/textarea'
import { ThemeToggle, ThemeToggleAdvanced } from '@/components/ui/theme-toggle'

export default function Home() {
  return (
    <main className="bg-background min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-3xl font-bold">Reflect App</h1>
            <p className="text-muted-foreground">
              Dark mode implementation demo
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <ThemeToggleAdvanced />
          </div>
        </header>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Form Components</CardTitle>
              <CardDescription>
                Testing form elements in both light and dark themes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your message"
                  variant="filled"
                />
              </div>
              <div className="flex gap-2">
                <Button>Submit</Button>
                <Button variant="outline">Cancel</Button>
                <Button variant="ghost">Reset</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>UI Components</CardTitle>
              <CardDescription>
                Various UI components with dark mode support
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <LoadingSpinner size="sm" />
                <LoadingSpinner />
                <LoadingSpinner size="lg" variant="muted" />
              </div>

              <ErrorMessage
                message="This is an error message example"
                variant="default"
              />

              <ErrorMessage
                title="Validation Error"
                message="This is a filled error message"
                variant="filled"
              />

              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">Rate this demo:</p>
                <Feedback
                  showLabels={true}
                  onFeedback={(type) => console.log('Feedback:', type)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Color Palette Test</CardTitle>
            <CardDescription>
              Semantic color tokens that adapt to theme changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h3 className="font-medium">Background Colors</h3>
                <div className="space-y-1">
                  <div className="bg-background rounded border p-2 text-sm">
                    background
                  </div>
                  <div className="bg-card rounded border p-2 text-sm">card</div>
                  <div className="bg-muted rounded border p-2 text-sm">
                    muted
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Interactive Colors</h3>
                <div className="space-y-1">
                  <div className="bg-primary text-primary-foreground rounded p-2 text-sm">
                    primary
                  </div>
                  <div className="bg-secondary text-secondary-foreground rounded p-2 text-sm">
                    secondary
                  </div>
                  <div className="bg-accent text-accent-foreground rounded p-2 text-sm">
                    accent
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Text Colors</h3>
                <div className="space-y-1">
                  <div className="text-foreground rounded border p-2 text-sm">
                    foreground
                  </div>
                  <div className="text-muted-foreground rounded border p-2 text-sm">
                    muted-foreground
                  </div>
                  <div className="text-destructive rounded border p-2 text-sm">
                    destructive
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
