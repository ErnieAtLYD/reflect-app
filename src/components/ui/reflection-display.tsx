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
      <div className={cn('space-y-3', className)}>
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
            {icon}
          </div>
          <h3 className="text-foreground font-semibold">{title}</h3>
        </div>
        <p className="text-muted-foreground leading-relaxed">{content}</p>
      </div>
    </motion.div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LoadingSpinner size="sm" />
          <span className="text-muted-foreground text-sm">
            Generating reflection...
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
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="bg-muted h-8 w-8 animate-pulse rounded-lg" />
              <div className="bg-muted h-4 w-24 animate-pulse rounded" />
            </div>
            <div className="space-y-2">
              <div className="bg-muted h-4 w-full animate-pulse rounded" />
              <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
              <div className="bg-muted h-4 w-1/2 animate-pulse rounded" />
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
      <div className={cn('mx-auto mt-8 max-w-4xl', className)}>
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                  <Sparkles className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl">Your Reflection</CardTitle>
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

          <CardContent>
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
                <div className="space-y-6">
                  <ReflectionSection
                    title="Summary"
                    content={data.summary}
                    icon={<Sparkles className="h-4 w-4" />}
                    delay={0.1}
                  />

                  <ReflectionSection
                    title="Pattern Noticed"
                    content={data.pattern}
                    icon={<TrendingUp className="h-4 w-4" />}
                    delay={0.2}
                  />

                  <ReflectionSection
                    title="Suggestion"
                    content={data.suggestion}
                    icon={<Lightbulb className="h-4 w-4" />}
                    delay={0.3}
                  />

                  {/* Metadata */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    <div className="border-t pt-4">
                      <p className="text-muted-foreground text-center text-xs">
                        Processed by {data.metadata.model} in{' '}
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
