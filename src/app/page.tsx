'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { FirstTimeTooltip } from '@/components/ui/first-time-tooltip'
import { JournalEntryInput } from '@/components/ui/journal-entry-input'
import { ReflectionDisplay } from '@/components/ui/reflection-display'
import { ThemeToggleAdvanced } from '@/components/ui/theme-toggle'
import { aiClient, AIReflectionError } from '@/lib/ai-client'
import type { ReflectionResponse } from '@/types/ai'

export default function Home() {
  const [journalEntry, setJournalEntry] = useState('')
  const [isValidEntry, setIsValidEntry] = useState(false)
  const [showValidationErrors, setShowValidationErrors] = useState(false)

  // Reflection state management
  const [reflectionState, setReflectionState] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [reflectionData, setReflectionData] = useState<
    ReflectionResponse | undefined
  >()
  const [reflectionError, setReflectionError] = useState<string | undefined>()

  const handleReflectNow = async () => {
    if (!isValidEntry) {
      setShowValidationErrors(true)
      return
    }

    try {
      setReflectionState('loading')
      setReflectionError(undefined)

      const response = await aiClient.processEntry({
        content: journalEntry,
        preferences: {
          tone: 'supportive',
          focusAreas: ['emotions', 'growth', 'patterns'],
        },
      })

      setReflectionData(response)
      setReflectionState('success')
    } catch (error) {
      let errorMessage = 'Unable to generate reflection at this time'

      if (error instanceof AIReflectionError) {
        if (error.isRateLimited()) {
          errorMessage = `Too many requests. Please try again ${error.retryAfter ? `in ${error.retryAfter} seconds` : 'later'}.`
        } else if (error.isContentPolicyViolation()) {
          errorMessage =
            'Your entry cannot be processed due to content policy restrictions. Please try a different approach.'
        } else {
          errorMessage = error.message
        }
      }

      setReflectionError(errorMessage)
      setReflectionState('error')
    }
  }

  const handleReflectionRetry = () => {
    handleReflectNow()
  }

  const handleClearInput = () => {
    setJournalEntry('')
    setShowValidationErrors(false)
    // Reset reflection state when clearing input
    setReflectionState('idle')
    setReflectionData(undefined)
    setReflectionError(undefined)
  }

  const handleValidationChange = (isValid: boolean) => {
    setIsValidEntry(isValid)
    // Hide errors when entry becomes valid
    if (isValid) {
      setShowValidationErrors(false)
    }
  }

  return (
    <main className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
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
            <ThemeToggleAdvanced />
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
                  {reflectionState === 'loading'
                    ? 'Reflecting...'
                    : 'Reflect Now'}
                </Button>
              </motion.div>
            </div>

            {/* Privacy Message */}
            <div className="text-center">
              <p className="text-muted-foreground text-sm sm:text-base">
                🔒 Your thoughts stay yours. No accounts, no storage.
              </p>
            </div>
          </motion.div>

          {/* Reflection Display */}
          <ReflectionDisplay
            state={reflectionState}
            data={reflectionData}
            error={reflectionError}
            onRetry={handleReflectionRetry}
          />
        </div>
      </div>
    </main>
  )
}
