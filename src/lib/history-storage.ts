import type { ReflectionResponse } from '@/types/ai'

export interface HistoryEntry {
  id: string
  timestamp: number
  journalEntry: string
  reflection?: ReflectionResponse
}

const STORAGE_KEY = 'reflect-history'
const MAX_ENTRIES = 5

// Custom event types for history changes
export const HISTORY_EVENTS = {
  ENABLED_CHANGED: 'reflect-history-enabled-changed',
  ENTRIES_CHANGED: 'reflect-history-entries-changed',
} as const

/**
 * Dispatch a custom event
 * @param eventType - The type of event to dispatch
 * @param data - The data to include in the event
 * @example
 * dispatchHistoryEvent('reflect-history-entries-changed', { entries: [] })
 */
const dispatchHistoryEvent = (
  eventType: string,
  data?: Record<string, unknown>
) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(eventType, { detail: data }))
  }
}

/**
 * Validate a reflection response
 * @param reflection - The reflection response to validate
 * @returns True if the response is valid, false otherwise
 * @example
 * const isValid = validateReflectionResponse(reflection)
 * console.log(isValid)
 */
const validateReflectionResponse = (
  reflection: unknown
): reflection is ReflectionResponse => {
  if (typeof reflection !== 'object' || reflection === null) {
    return false
  }

  const obj = reflection as Record<string, unknown>

  // Validate required string fields
  if (typeof obj.summary !== 'string' || obj.summary.length === 0) {
    return false
  }

  if (typeof obj.pattern !== 'string' || obj.pattern.length === 0) {
    return false
  }

  if (typeof obj.suggestion !== 'string' || obj.suggestion.length === 0) {
    return false
  }

  // Validate metadata object
  if (typeof obj.metadata !== 'object' || obj.metadata === null) {
    return false
  }

  const metadata = obj.metadata as Record<string, unknown>

  if (typeof metadata.model !== 'string' || metadata.model.length === 0) {
    return false
  }

  if (
    typeof metadata.processedAt !== 'string' ||
    metadata.processedAt.length === 0
  ) {
    return false
  }

  if (
    typeof metadata.processingTimeMs !== 'number' ||
    !Number.isFinite(metadata.processingTimeMs) ||
    metadata.processingTimeMs < 0
  ) {
    return false
  }

  // Ensure no unexpected properties in ReflectionResponse
  const allowedKeys = new Set(['summary', 'pattern', 'suggestion', 'metadata'])
  const objKeys = Object.keys(obj)

  for (const key of objKeys) {
    if (!allowedKeys.has(key)) {
      return false
    }
  }

  // Ensure no unexpected properties in metadata
  const allowedMetadataKeys = new Set([
    'model',
    'processedAt',
    'processingTimeMs',
  ])
  const metadataKeys = Object.keys(metadata)

  for (const key of metadataKeys) {
    if (!allowedMetadataKeys.has(key)) {
      return false
    }
  }

  return true
}

/**
 * Validate a history entry
 * @param entry - The history entry to validate
 * @returns True if the entry is valid, false otherwise
 * @example
 * const isValid = validateHistoryEntry(entry)
 * console.log(isValid)
 */
const validateHistoryEntry = (entry: unknown): entry is HistoryEntry => {
  if (typeof entry !== 'object' || entry === null) {
    return false
  }

  const obj = entry as Record<string, unknown>

  // Validate required id field - must be non-empty string
  if (typeof obj.id !== 'string' || obj.id.length === 0) {
    return false
  }

  // Validate timestamp - must be a finite number and reasonable (not negative, not too far in future)
  if (
    typeof obj.timestamp !== 'number' ||
    !Number.isFinite(obj.timestamp) ||
    obj.timestamp < 0
  ) {
    return false
  }

  // Additional timestamp validation - should not be too far in the future
  const now = Date.now()
  const oneYearFromNow = now + 365 * 24 * 60 * 60 * 1000
  if (obj.timestamp > oneYearFromNow) {
    return false
  }

  // Validate journal entry - must be non-empty string when trimmed
  if (
    typeof obj.journalEntry !== 'string' ||
    obj.journalEntry.trim().length === 0
  ) {
    return false
  }

  // Validate optional reflection field with complete ReflectionResponse validation
  if (obj.reflection !== undefined) {
    if (!validateReflectionResponse(obj.reflection)) {
      return false
    }
  }

  // Ensure no unexpected properties (only allow known HistoryEntry fields)
  const allowedKeys = new Set(['id', 'timestamp', 'journalEntry', 'reflection'])
  const objKeys = Object.keys(obj)

  for (const key of objKeys) {
    if (!allowedKeys.has(key)) {
      return false
    }
  }

  return true
}

/**
 * History storage
 * @returns An object with the isEnabled, setEnabled, saveEntry, getEntries, clearHistory, and getEntryCount functions
 * @example
 * const { isEnabled, setEnabled, saveEntry, getEntries, clearHistory, getEntryCount } = historyStorage
 * console.log(isEnabled())
 * setEnabled(true)
 * saveEntry('Hello, world!')
 * const entries = getEntries()
 * console.log(entries)
 * clearHistory()
 * console.log(getEntryCount())
 */
export const historyStorage = {
  isEnabled(): boolean {
    try {
      return localStorage.getItem('reflect-history-enabled') === 'true'
    } catch {
      return false
    }
  },

  /**
   * Enable or disable history storage.
   * @param enabled - Whether to enable or disable history storage.
   */
  setEnabled(enabled: boolean): void {
    try {
      localStorage.setItem('reflect-history-enabled', enabled.toString())
      dispatchHistoryEvent(HISTORY_EVENTS.ENABLED_CHANGED, { enabled })
    } catch {
      // Fail silently if localStorage is not available
    }
  },

  /**
   * Save a new entry to the history.
   * @param journalEntry - The journal entry to save.
   * @param reflection - The reflection to save.
   */
  saveEntry(journalEntry: string, reflection?: ReflectionResponse): void {
    if (!this.isEnabled()) return

    try {
      const entries = this.getEntries()
      const newEntry: HistoryEntry = {
        id:
          crypto.randomUUID() ||
          `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: Date.now(),
        journalEntry,
        reflection,
      }

      // Add new entry to the beginning
      entries.unshift(newEntry)

      // Keep only the last MAX_ENTRIES
      if (entries.length > MAX_ENTRIES) {
        entries.splice(MAX_ENTRIES)
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
      dispatchHistoryEvent(HISTORY_EVENTS.ENTRIES_CHANGED, { entries })
    } catch {
      // Fail silently if localStorage is not available
    }
  },

  /**
   * Get all entries from the history.
   * @returns An array of HistoryEntry objects.
   */
  getEntries(): HistoryEntry[] {
    if (!this.isEnabled()) return []

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return []

      const parsed = JSON.parse(stored)
      if (!Array.isArray(parsed)) {
        // Invalid data format, clear corrupted storage
        localStorage.removeItem(STORAGE_KEY)
        return []
      }

      // Filter out invalid entries and keep only valid ones
      const validEntries = parsed.filter(validateHistoryEntry)

      // If we had to filter out invalid entries, save the cleaned data
      if (validEntries.length !== parsed.length && validEntries.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(validEntries))
      } else if (validEntries.length === 0 && parsed.length > 0) {
        // All entries were invalid, clear storage
        localStorage.removeItem(STORAGE_KEY)
      }

      return validEntries
    } catch {
      // JSON parsing failed or other error, clear corrupted storage
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        // Ignore if we can't clear storage
      }
      return []
    }
  },

  /**
   * Clear all entries from the history.
   */
  clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
      dispatchHistoryEvent(HISTORY_EVENTS.ENTRIES_CHANGED, { entries: [] })
    } catch {
      // Fail silently if localStorage is not available
    }
  },

  /**
   * Get the number of entries in the history.
   * @returns The number of entries in the history.
   */
  getEntryCount(): number {
    return this.getEntries().length
  },
}
