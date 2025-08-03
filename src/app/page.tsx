'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

import { FirstTimeTooltip } from '@/components/ui/first-time-tooltip'
import { Textarea } from '@/components/ui/textarea'
import { ThemeToggleAdvanced } from '@/components/ui/theme-toggle'

export default function Home() {
  const [journalEntry, setJournalEntry] = useState('')

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
            <h1 className="text-foreground text-3xl font-bold sm:text-4xl lg:text-5xl">
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
            <h2 className="text-foreground mb-6 text-4xl font-bold sm:text-5xl lg:text-6xl">
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
                <Textarea
                  value={journalEntry}
                  onChange={(e) => setJournalEntry(e.target.value)}
                  placeholder="Paste your journal entry here..."
                  className="min-h-[400px] resize-none text-lg leading-relaxed"
                  size="lg"
                  data-testid="journal-entry-textarea"
                />
              </FirstTimeTooltip>
            </div>

            {/* Privacy Message */}
            <div className="text-center">
              <p className="text-muted-foreground text-sm sm:text-base">
                🔒 Your thoughts stay yours. No accounts, no storage.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
