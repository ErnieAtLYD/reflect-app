'use client'

import { Database, DatabaseZap } from 'lucide-react'
import { useEffect, useState } from 'react'

import { useAnalytics } from '@/hooks/useAnalytics'
import { historyStorage } from '@/lib/history-storage'

import { Button } from './button'
import { FirstTimeTooltip } from './first-time-tooltip'

interface HistoryToggleProps {
  className?: string
}

export function HistoryToggle({ className }: HistoryToggleProps) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const { trackEvent } = useAnalytics()

  useEffect(() => {
    setIsClient(true)
    setIsEnabled(historyStorage.isEnabled())
  }, [])

  const handleToggle = () => {
    const newState = !isEnabled
    setIsEnabled(newState)
    historyStorage.setEnabled(newState)

    // Track history toggle usage
    trackEvent('history_toggled')
  }

  if (!isClient) {
    return null
  }

  return (
    <FirstTimeTooltip
      content="Click to save your journal entries and reflections locally in your browser. This lets you access your previous entries anytime—everything stays private on your device."
      storageKey="history-toggle-first-time-tooltip"
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        className={className}
        data-testid="history-toggle"
        title={`${
          isEnabled
            ? 'History storage is enabled - Your journal entries and AI reflections are being saved locally in your browser for easy access'
            : 'History storage is disabled - Click to enable saving your journal entries and reflections locally in your browser'
        }`}
      >
        {isEnabled ? (
          <Database className="h-4 w-4" />
        ) : (
          <DatabaseZap className="h-4 w-4" />
        )}
        <span className="sr-only">
          {isEnabled ? 'Disable history storage' : 'Enable history storage'}
        </span>
      </Button>
    </FirstTimeTooltip>
  )
}
