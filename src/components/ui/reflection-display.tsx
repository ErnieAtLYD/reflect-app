'use client'

import { motion } from 'framer-motion'
import {
  Check,
  Copy,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Lightbulb,
} from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from '@/components/ui/card'
import { ErrorMessage } from '@/components/ui/error-message'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useClipboard } from '@/hooks/use-clipboard'
import { cn } from '@/lib/utils'
import type { ReflectionResponse } from '@/types/ai'

interface ReflectionDisplayProps {
  /**
   * Current state of the reflection process
   */
  state: 'idle' | 'loading' | 'success' | 'error'

  /**
   * Reflection data from AI processing
   */
  data?: ReflectionResponse

  /**
   * Error message if processing failed
   */
  error?: string

  /**
   * Callback to retry reflection processing
   */
  onRetry?: () => void

  /**
   * Additional CSS classes
   */
  className?: string
}

interface ReflectionSectionProps {
  title: string
  content: string
  icon: React.ReactNode
  delay?: number
  className?: string
}

function ReflectionSection({
  title,
  content,
  icon,
  delay = 0,
  className,
}: ReflectionSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div
        className={cn(
          'border-border/50 bg-card/50 hover:border-border/70 hover:bg-card/70 relative space-y-4 rounded-xl border p-6 backdrop-blur-sm transition-all',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-lg shadow-sm">
            {icon}
          </div>
          <h3 className="text-foreground text-lg font-bold tracking-tight">
            {title}
          </h3>
        </div>
        <div className="ml-13">
          <p className="text-foreground text-base leading-relaxed">{content}</p>
        </div>
      </div>
    </motion.div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-3">
          <LoadingSpinner size="lg" />
          <span className="text-foreground text-lg font-medium">
            Generating your reflection...
          </span>
        </div>
      </div>

      {/* Loading skeletons for each section */}
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <div className="border-border/50 bg-card/50 rounded-xl border p-6 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-muted h-10 w-10 animate-pulse rounded-lg" />
                <div className="bg-muted h-5 w-32 animate-pulse rounded" />
              </div>
              <div className="ml-13 space-y-3">
                <div className="bg-muted h-4 w-full animate-pulse rounded" />
                <div className="bg-muted h-4 w-5/6 animate-pulse rounded" />
                <div className="bg-muted h-4 w-2/3 animate-pulse rounded" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export function ReflectionDisplay({
  state,
  data,
  error,
  onRetry,
  className,
}: ReflectionDisplayProps) {
  const { copied, copyToClipboard } = useClipboard()

  const handleCopy = async () => {
    if (!data) return

    const formattedText = `
Your Reflection

Summary: ${data.summary}

Pattern Noticed: ${data.pattern}

Suggestion: ${data.suggestion}

---
Processed by ${data.metadata.model} in ${data.metadata.processingTimeMs}ms
    `.trim()

    await copyToClipboard(formattedText)
  }

  // Don't render anything in idle state
  if (state === 'idle') {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className={cn('mx-auto mt-12 max-w-5xl', className)}>
        <Card className="border-primary/20 from-background/95 to-muted/30 overflow-hidden border-2 bg-gradient-to-br shadow-xl backdrop-blur-sm">
          <CardHeader className="border-border/50 from-primary/5 to-primary/10 border-b bg-gradient-to-r pt-8 pb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-primary text-primary-foreground flex h-14 w-14 items-center justify-center rounded-xl shadow-lg">
                  <Sparkles className="h-7 w-7" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold tracking-tight">
                    Your Reflection
                  </CardTitle>
                  <p className="text-muted-foreground text-sm font-medium">
                    AI-powered insights from your journal entry
                  </p>
                </div>
              </div>

              {state === 'success' && data && (
                <CardAction>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="gap-2"
                    data-testid="copy-reflection-button"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </CardAction>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {state === 'loading' && <LoadingSkeleton />}

            {state === 'error' && (
              <div className="space-y-4">
                <ErrorMessage
                  title="Reflection Processing Failed"
                  message={
                    error || 'Unable to generate reflection at this time'
                  }
                  variant="filled"
                  showIcon={true}
                />
                {onRetry && (
                  <div className="flex justify-center">
                    <Button
                      onClick={onRetry}
                      variant="outline"
                      className="gap-2"
                      data-testid="retry-reflection-button"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Try Again
                    </Button>
                  </div>
                )}
              </div>
            )}

            {state === 'success' && data && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="space-y-8">
                  <ReflectionSection
                    title="Summary"
                    content={data.summary}
                    icon={<Sparkles className="h-5 w-5" />}
                    delay={0.1}
                  />

                  <ReflectionSection
                    title="Pattern Noticed"
                    content={data.pattern}
                    icon={<TrendingUp className="h-5 w-5" />}
                    delay={0.2}
                  />

                  <ReflectionSection
                    title="Suggestion"
                    content={data.suggestion}
                    icon={<Lightbulb className="h-5 w-5" />}
                    delay={0.3}
                  />

                  {/* Metadata */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    <div className="border-border/30 bg-muted/20 rounded-lg border-t p-4">
                      <p className="text-muted-foreground text-center text-sm font-medium">
                        ✨ Processed by {data.metadata.model} in{' '}
                        {data.metadata.processingTimeMs}ms
                      </p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
