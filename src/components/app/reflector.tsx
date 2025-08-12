'use client'

import { motion } from 'framer-motion'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { FirstTimeTooltip } from '@/components/ui/first-time-tooltip'
import { HistoryToggle } from '@/components/ui/history-toggle'
import { HistoryView } from '@/components/ui/history-view'
import { JournalEntryInput } from '@/components/ui/journal-entry-input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ReflectionDisplay } from '@/components/ui/reflection-display'
import { ThemeToggleAdvanced } from '@/components/ui/theme-toggle'
import { aiClient, AIReflectionError } from '@/lib/ai-client'
import { historyStorage } from '@/lib/history-storage'
import type { ReflectionResponse } from '@/types/ai'

export const Reflector = () => {
  const [journalEntry, setJournalEntry] = useState('')
  const [isValidEntry, setIsValidEntry] = useState(false)
  const [showValidationErrors, setShowValidationErrors] = useState(false)

  const [reflectionState, setReflectionState] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [reflectionData, setReflectionData] = useState<
    ReflectionResponse | undefined
  >()
  const [reflectionError, setReflectionError] = useState<string | undefined>()
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null)
  const [abortController, setAbortController] =
    useState<AbortController | null>(null)

  const getFriendlyErrorMessage = (unknownError: unknown): string => {
    let errorMessage = 'Unable to generate reflection at this time'
    if (unknownError instanceof AIReflectionError) {
      if (unknownError.isContentPolicyViolation()) {
        errorMessage =
          'Your entry cannot be processed due to content policy restrictions. Please try a different approach.'
      } else if (unknownError.isRateLimited()) {
        const seconds =
          unknownError.retryAfter && unknownError.retryAfter > 0
            ? unknownError.retryAfter
            : 15
        errorMessage = `Too many requests. Please try again in ${seconds} seconds.`
      } else if (unknownError.isRetryable()) {
        errorMessage =
          'The AI service is temporarily unavailable. Please try again in a moment.'
      } else {
        errorMessage = unknownError.message
      }
    }
    return errorMessage
  }

  const handleReflectNow = async () => {
    // Prevent duplicate submissions if already processing
    if (reflectionState === 'loading') return

    if (!isValidEntry) {
      setShowValidationErrors(true)
      return
    }

    // Check if history is enabled at save time
    const shouldSaveToHistory = historyStorage.isEnabled()

    try {
      setReflectionState('loading')
      setReflectionError(undefined)
      const controller = new AbortController()
      setAbortController(controller)

      const response = await aiClient.processEntry(
        {
          content: journalEntry,
          preferences: {
            tone: 'supportive',
            focusAreas: ['emotions', 'growth', 'patterns'],
          },
        },
        { signal: controller.signal }
      )

      setReflectionData(response)
      setReflectionState('success')
      setAbortController(null)

      // Save to history if enabled at the time processing started
      if (shouldSaveToHistory) {
        historyStorage.saveEntry(journalEntry, response)
      }
    } catch (error) {
      let errorMessage = getFriendlyErrorMessage(error)

      if (error instanceof AIReflectionError) {
        if (error.isRateLimited()) {
          // If rate-limited, perform a single automatic retry after retryAfter seconds
          const seconds =
            error.retryAfter && error.retryAfter > 0 ? error.retryAfter : 15
          errorMessage = `Too many requests. Retrying in ${seconds} seconds...`

          // Show a basic countdown to improve UX
          setRetryCountdown(seconds)
          const interval = setInterval(() => {
            setRetryCountdown((prev) => {
              if (prev === null) return null
              if (prev <= 1) {
                clearInterval(interval)
                return 0
              }
              return prev - 1
            })
          }, 1000)

          // Wait then retry once
          await new Promise((resolve) => setTimeout(resolve, seconds * 1000))
          setRetryCountdown(null)

          try {
            const retryController = new AbortController()
            setAbortController(retryController)
            const response = await aiClient.processEntry(
              {
                content: journalEntry,
                preferences: {
                  tone: 'supportive',
                  focusAreas: ['emotions', 'growth', 'patterns'],
                },
              },
              { signal: retryController.signal }
            )

            setReflectionData(response)
            setReflectionState('success')
            setAbortController(null)

            // Save to history if enabled at the time processing started
            if (shouldSaveToHistory) {
              historyStorage.saveEntry(journalEntry, response)
            }
            return
          } catch {
            // Fall through to standard error handling
          }
        }
      }

      setReflectionError(errorMessage)
      setReflectionState('error')
      setAbortController(null)
    }
  }

  const handleReflectionRetry = () => {
    handleReflectNow()
  }

  // Clear stale error when user edits input
  React.useEffect(() => {
    if (reflectionState === 'error' && reflectionError) {
      setReflectionError(undefined)
      setReflectionState('idle')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journalEntry])

  const handleClearInput = () => {
    try {
      abortController?.abort()
    } catch {}
    setJournalEntry('')
    setShowValidationErrors(false)
    setReflectionState('idle')
    setReflectionData(undefined)
    setReflectionError(undefined)
    setAbortController(null)
  }

  const handleValidationChange = (isValid: boolean) => {
    setIsValidEntry(isValid)
    if (isValid) {
      setShowValidationErrors(false)
    }
  }

  const handleLoadHistoryEntry = (entry: string) => {
    setJournalEntry(entry)
    setReflectionState('idle')
    setReflectionData(undefined)
    setReflectionError(undefined)
    setShowValidationErrors(false)
  }

  return (
    <div
      className="container mx-auto px-4 py-8 sm:px-6 lg:px-8"
      aria-busy={reflectionState === 'loading'}
    >
      {/* Header */}
      <div className="mb-12 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-foreground font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">
            Reflect
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            A space for your thoughts
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center gap-2">
            <HistoryToggle />
            <ThemeToggleAdvanced />
          </div>
        </motion.div>
      </div>

      {/* Hero Section */}
      <section className="mb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-foreground font-heading mb-6 text-4xl font-bold sm:text-5xl lg:text-6xl">
            Capture Your Thoughts
          </h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-xl sm:text-2xl">
            A simple, private space to journal, reflect, and organize your
            ideas. No sign-ups, no storage, just you and your thoughts.
          </p>
        </motion.div>
      </section>

      {/* Main Journal Entry Area */}
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="mb-6">
            <FirstTimeTooltip
              content="Welcome to Reflect! This is your private space to write and organize thoughts. Everything stays on your device—no accounts or cloud storage needed."
              storageKey="reflect-first-time-tooltip"
            >
              <JournalEntryInput
                value={journalEntry}
                onChange={setJournalEntry}
                onClear={handleClearInput}
                onValidationChange={handleValidationChange}
                showValidationErrors={showValidationErrors}
                placeholder="Share what's on your mind today... What are you grateful for? What's challenging you? What made you smile?"
                className="min-h-[400px] text-lg leading-relaxed"
                size="lg"
                variant="filled"
                minRows={10}
                maxRows={30}
                showClearButton={true}
              />
            </FirstTimeTooltip>
          </div>

          {/* Reflect Now Button */}
          <div className="mb-8 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <Button
                onClick={handleReflectNow}
                disabled={!isValidEntry || reflectionState === 'loading'}
                size="lg"
                className="px-8 py-3 text-base font-semibold"
                data-testid="reflect-now-button"
              >
                {reflectionState === 'loading' ? (
                  <span className="inline-flex items-center gap-2">
                    <LoadingSpinner
                      size="sm"
                      variant="muted"
                      aria-label="Reflecting"
                    />
                    Reflecting...
                  </span>
                ) : (
                  'Reflect Now'
                )}
              </Button>
            </motion.div>
          </div>

          {/* Privacy Message */}
          <div className="text-center">
            <p className="text-muted-foreground text-sm sm:text-base">
              🔒 Your thoughts stay yours. No accounts, no storage.
            </p>
            {reflectionState === 'loading' && (
              <p
                className="text-muted-foreground mt-2 text-xs"
                aria-live="polite"
              >
                {retryCountdown !== null
                  ? `Retry scheduled in ${retryCountdown}s`
                  : 'Processing your reflection...'}
              </p>
            )}
          </div>
        </motion.div>

        {/* History View */}
        <HistoryView onLoadEntry={handleLoadHistoryEntry} />

        {/* Reflection Display */}
        <ReflectionDisplay
          state={reflectionState}
          data={reflectionData}
          error={
            retryCountdown !== null && reflectionState === 'loading'
              ? `Retrying in ${retryCountdown}s...`
              : reflectionError
          }
          onRetry={handleReflectionRetry}
        />
      </div>
    </div>
  )
}
