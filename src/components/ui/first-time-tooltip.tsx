'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from './button'

interface FirstTimeTooltipProps {
  children: React.ReactNode
  content: string
  storageKey: string
}

export function FirstTimeTooltip({
  children,
  content,
  storageKey,
}: FirstTimeTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    try {
      const hasSeenTooltip = localStorage.getItem(storageKey)
      if (!hasSeenTooltip) {
        setIsVisible(true)
      }
    } catch (error) {
      // If localStorage is not available (e.g., private browsing, disabled storage),
      // show the tooltip by default to ensure users don't miss important information
      console.warn(
        'localStorage not available, showing tooltip by default:',
        error
      )
      setIsVisible(true)
    }
  }, [storageKey])

  const handleDismiss = () => {
    try {
      localStorage.setItem(storageKey, 'true')
    } catch (error) {
      // If localStorage is not available, we can't persist the dismissal,
      // but we still hide the tooltip for the current session
      console.warn('Could not save tooltip dismissal to localStorage:', error)
    }

    setIsVisible(false)
  }

  if (!isClient) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      {children}
      <AnimatePresence>
        {isVisible && (
          <div className="absolute top-full right-0 left-0 z-50 mt-4 flex justify-center px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{
                width: '20rem',
                maxWidth: '100%',
                minWidth: '16rem',
              }}
              data-testid="first-time-tooltip"
            >
              <div className="border-border bg-card relative rounded-lg border p-4 shadow-lg">
                {/* Arrow */}
                <div className="border-border bg-card absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 transform border-t border-l"></div>

                {/* Content */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    data-testid="tooltip-dismiss-button"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Dismiss tooltip</span>
                  </Button>

                  <p className="text-foreground pr-4 text-sm">{content}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
