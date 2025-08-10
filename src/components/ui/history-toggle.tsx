'use client'

import { Database, DatabaseZap } from 'lucide-react'
import { useEffect, useState } from 'react'

import { historyStorage } from '@/lib/history-storage'

import { Button } from './button'

interface HistoryToggleProps {
  className?: string
}

export function HistoryToggle({ className }: HistoryToggleProps) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setIsEnabled(historyStorage.isEnabled())
  }, [])

  const handleToggle = () => {
    const newState = !isEnabled
    setIsEnabled(newState)
    historyStorage.setEnabled(newState)
  }

  if (!isClient) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className={className}
      data-testid="history-toggle"
      title={`History storage: ${isEnabled ? 'enabled' : 'disabled'}`}
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
  )
}
