import type { ReflectionResponse } from '@/types/ai'

export interface HistoryEntry {
  id: string
  timestamp: number
  journalEntry: string
  reflection?: ReflectionResponse
}

const STORAGE_KEY = 'reflect-history'
const MAX_ENTRIES = 5

const validateHistoryEntry = (entry: unknown): entry is HistoryEntry => {
  if (typeof entry !== 'object' || entry === null) {
    return false
  }

  const obj = entry as Record<string, unknown>

  // Validate required fields
  if (typeof obj.id !== 'string' || obj.id.length === 0) {
    return false
  }

  if (typeof obj.timestamp !== 'number' || !Number.isFinite(obj.timestamp)) {
    return false
  }

  if (typeof obj.journalEntry !== 'string') {
    return false
  }

  // Validate optional reflection field
  if (obj.reflection !== undefined) {
    if (typeof obj.reflection !== 'object' || obj.reflection === null) {
      return false
    }

    const reflection = obj.reflection as Record<string, unknown>
    // Basic validation for reflection structure - should have at least summary
    if (typeof reflection.summary !== 'string') {
      return false
    }
  }

  return true
}

export const historyStorage = {
  isEnabled(): boolean {
    try {
      return localStorage.getItem('reflect-history-enabled') === 'true'
    } catch {
      return false
    }
  },

  setEnabled(enabled: boolean): void {
    try {
      localStorage.setItem('reflect-history-enabled', enabled.toString())
    } catch {
      // Fail silently if localStorage is not available
    }
  },

  saveEntry(journalEntry: string, reflection?: ReflectionResponse): void {
    if (!this.isEnabled()) return

    try {
      const entries = this.getEntries()
      const newEntry: HistoryEntry = {
        id: Date.now().toString(),
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
    } catch {
      // Fail silently if localStorage is not available
    }
  },

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

  clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Fail silently if localStorage is not available
    }
  },

  getEntryCount(): number {
    return this.getEntries().length
  },
}
