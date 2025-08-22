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
import { JournalEntryInput } from '@/components/ui/journal-entry-input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ReflectionDisplay } from '@/components/ui/reflection-display'
import { Textarea } from '@/components/ui/textarea'
import { ThemeToggle, ThemeToggleAdvanced } from '@/components/ui/theme-toggle'
import { usePageTracking } from '@/hooks/useAnalytics'

export default function ComponentsDemo() {
  usePageTracking()
  return (
    <main className="bg-background xs:p-6 min-h-screen p-4 sm:p-8">
      <div className="xs:space-y-8 container mx-auto space-y-6">
        <header className="xs:flex-row xs:items-center xs:justify-between flex flex-col gap-4">
          <div>
            <h1 className="font-heading text-foreground xs:text-3xl text-2xl font-bold">
              Reflect App - Components Demo
            </h1>
            <p className="text-muted-foreground xs:text-base text-sm">
              Responsive design & dark mode demo
            </p>
          </div>
          <div className="xs:gap-4 flex items-center gap-2">
            <ThemeToggle />
            <ThemeToggleAdvanced />
          </div>
        </header>

        <div className="xs:gap-6 grid gap-4 sm:gap-8 lg:grid-cols-2">
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
              <div className="space-y-2">
                <Label htmlFor="journal-entry">Journal Entry (Enhanced)</Label>
                <JournalEntryInput
                  id="journal-entry"
                  placeholder="Write your thoughts here..."
                  minLength={20}
                  showCharacterCount={true}
                  showClearButton={true}
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
                  onFeedback={() => {
                    // Feedback received
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Responsive Breakpoint System</CardTitle>
            <CardDescription>
              Custom breakpoints demonstrating adaptive layout behavior
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div
                className="xs:grid-cols-2 xs:gap-3 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                data-testid="breakpoint-grid"
              >
                <div className="bg-primary text-primary-foreground xs:text-sm rounded p-2 text-center text-xs">
                  <div className="font-medium">XS</div>
                  <div className="text-xs opacity-80">480px+</div>
                </div>
                <div className="bg-secondary text-secondary-foreground xs:text-sm rounded p-2 text-center text-xs">
                  <div className="font-medium">SM</div>
                  <div className="text-xs opacity-80">640px+</div>
                </div>
                <div className="bg-accent text-accent-foreground xs:text-sm rounded p-2 text-center text-xs">
                  <div className="font-medium">MD</div>
                  <div className="text-xs opacity-80">768px+</div>
                </div>
                <div className="bg-muted text-muted-foreground xs:text-sm rounded p-2 text-center text-xs">
                  <div className="font-medium">LG</div>
                  <div className="text-xs opacity-80">1024px+</div>
                </div>
                <div className="bg-primary/20 text-foreground xs:text-sm rounded p-2 text-center text-xs">
                  <div className="font-medium">XL</div>
                  <div className="text-xs opacity-80">1280px+</div>
                </div>
                <div className="bg-secondary/20 text-foreground xs:text-sm rounded p-2 text-center text-xs">
                  <div className="font-medium">2XL</div>
                  <div className="text-xs opacity-80">1536px+</div>
                </div>
              </div>

              <div className="border-border rounded-lg border p-4">
                <h4 className="mb-2 text-sm font-medium">
                  Current Breakpoint Indicators:
                </h4>
                <div className="flex flex-wrap gap-1 text-xs">
                  <span className="bg-destructive xs:hidden block rounded px-2 py-1 text-white">
                    Mobile (&lt; 480px)
                  </span>
                  <span className="bg-chart-1 xs:block hidden rounded px-2 py-1 text-white sm:hidden">
                    XS (480px+)
                  </span>
                  <span className="bg-chart-2 hidden rounded px-2 py-1 text-white sm:block md:hidden">
                    SM (640px+)
                  </span>
                  <span className="bg-chart-3 hidden rounded px-2 py-1 text-white md:block lg:hidden">
                    MD (768px+)
                  </span>
                  <span className="bg-chart-4 hidden rounded px-2 py-1 text-white lg:block xl:hidden">
                    LG (1024px+)
                  </span>
                  <span className="bg-chart-5 hidden rounded px-2 py-1 text-white xl:block 2xl:hidden">
                    XL (1280px+)
                  </span>
                  <span className="bg-primary hidden rounded px-2 py-1 text-white 2xl:block">
                    2XL (1536px+)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enhanced Text Input Variants</CardTitle>
            <CardDescription>
              JournalEntryInput component with improved visual styling and focus
              states
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="journal-default">Default Variant</Label>
              <JournalEntryInput
                id="journal-default"
                placeholder="Default variant with subtle border and background..."
                variant="default"
                minRows={2}
                maxRows={6}
                showCharacterCount={true}
                showClearButton={true}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="journal-filled">Filled Variant</Label>
              <JournalEntryInput
                id="journal-filled"
                placeholder="Filled variant with more prominent background..."
                variant="filled"
                minRows={2}
                maxRows={6}
                showCharacterCount={true}
                showClearButton={true}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="journal-ghost">Ghost Variant</Label>
              <JournalEntryInput
                id="journal-ghost"
                placeholder="Ghost variant with subtle hover effects..."
                variant="ghost"
                minRows={2}
                maxRows={6}
                showCharacterCount={true}
                showClearButton={true}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reflection Display Demo</CardTitle>
            <CardDescription>
              Redesigned reflection analysis card - the core value proposition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div>
                <h3 className="mb-4 text-sm font-medium">Success State</h3>
                <ReflectionDisplay
                  state="success"
                  data={{
                    summary:
                      "You've shared some wonderful insights about personal growth and the importance of taking time to reflect. Your thoughts show a thoughtful approach to processing daily experiences.",
                    pattern:
                      "There's a consistent theme of mindfulness and self-awareness in your writing, suggesting you're actively working on personal development and emotional intelligence.",
                    suggestion:
                      'Consider setting aside 10 minutes each evening to continue this reflection practice. You might also try writing down three specific things you learned about yourself each day.',
                    metadata: {
                      model: 'gpt-4-1106-preview',
                      processedAt: '2024-01-01T12:00:00Z',
                      processingTimeMs: 1250,
                    },
                  }}
                />
              </div>

              <div>
                <h3 className="mb-4 text-sm font-medium">Loading State</h3>
                <ReflectionDisplay state="loading" />
              </div>

              <div>
                <h3 className="mb-4 text-sm font-medium">Error State</h3>
                <ReflectionDisplay
                  state="error"
                  error="The AI service is temporarily unavailable. Please try again in a moment."
                  onRetry={() => console.log('Retry clicked')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Color Palette Test</CardTitle>
            <CardDescription>
              Semantic color tokens that adapt to theme changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
