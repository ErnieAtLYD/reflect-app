import type { ReflectionResponse } from '@/types/ai'

export interface HistoryEntry {
  id: string
  timestamp: number
  journalEntry: string
  reflection?: ReflectionResponse
}

const STORAGE_KEY = 'reflect-history'
const MAX_ENTRIES = 5

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

      const entries = JSON.parse(stored) as HistoryEntry[]
      return Array.isArray(entries) ? entries : []
    } catch {
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
