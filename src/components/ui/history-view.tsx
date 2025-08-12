'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useState, useEffect } from 'react'

import {
  historyStorage,
  HISTORY_EVENTS,
  type HistoryEntry,
} from '@/lib/history-storage'

import { Button } from './button'
import { Card } from './card'
import { Dialog } from './dialog'

interface HistoryViewProps {
  onLoadEntry?: (entry: string) => void
}

/**
 * HistoryView component
 * @param onLoadEntry - Callback function to load an entry
 */
export function HistoryView({ onLoadEntry }: HistoryViewProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isHistoryEnabled, setIsHistoryEnabled] = useState(false)

  const loadEntries = () => {
    setEntries(historyStorage.getEntries())
    setIsHistoryEnabled(historyStorage.isEnabled())
  }

  useEffect(() => {
    setIsClient(true)
    loadEntries()

    // Listen for history storage events instead of polling
    const handleEnabledChange = () => {
      setIsHistoryEnabled(historyStorage.isEnabled())
    }
    const handleEntriesChange = () => {
      setEntries(historyStorage.getEntries())
    }

    window.addEventListener(HISTORY_EVENTS.ENABLED_CHANGED, handleEnabledChange)
    window.addEventListener(HISTORY_EVENTS.ENTRIES_CHANGED, handleEntriesChange)

    return () => {
      window.removeEventListener(
        HISTORY_EVENTS.ENABLED_CHANGED,
        handleEnabledChange
      )
      window.removeEventListener(
        HISTORY_EVENTS.ENTRIES_CHANGED,
        handleEntriesChange
      )
    }
  }, [])

  const handleLoadEntry = (entry: HistoryEntry) => {
    if (onLoadEntry) {
      onLoadEntry(entry.journalEntry)
      setIsExpanded(false)
    }
  }

  const handleClearHistory = () => {
    historyStorage.clearHistory()
    setEntries([])
    setShowClearDialog(false)
    setIsExpanded(false)
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!isClient || !isHistoryEnabled || entries.length === 0) {
    return null
  }

  return (
    <>
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="text-muted-foreground h-4 w-4" />
            <span className="text-muted-foreground text-sm">
              {entries.length} saved{' '}
              {entries.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {entries.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClearDialog(true)}
                className="text-destructive hover:text-destructive"
                data-testid="clear-history-button"
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              data-testid="toggle-history-view"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              <span className="ml-1">History</span>
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4">
                {entries.map((entry) => (
                  <Card
                    key={entry.id}
                    className="hover:bg-muted/50 cursor-pointer p-4 transition-colors"
                    onClick={() => handleLoadEntry(entry)}
                    data-testid="history-entry"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-muted-foreground text-xs">
                            {formatDate(entry.timestamp)}
                          </span>
                        </div>
                        <p className="text-foreground mb-2 line-clamp-2 text-sm">
                          {entry.journalEntry}
                        </p>
                        {entry.reflection && (
                          <p className="text-muted-foreground line-clamp-1 text-xs">
                            💭 {entry.reflection.summary}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Dialog
        isOpen={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        title="Clear History"
        description="Are you sure you want to delete all saved entries? This action cannot be undone."
        size="default"
      >
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setShowClearDialog(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleClearHistory}
            data-testid="confirm-clear-history"
          >
            Clear All
          </Button>
        </div>
      </Dialog>
    </>
  )
}
