import { useState } from 'react'

/**
 * Custom hook for clipboard operations with feedback
 * @returns An object with the copied state, error state, and the copyToClipboard function
 * @example
 * const { copied, error, copyToClipboard } = useClipboard()
 * copyToClipboard('Hello, world!')
 * console.log(copied)
 * console.log(error)
 */
export function useClipboard() {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Copy text to clipboard
   * @param text - The text to copy
   * @returns A boolean indicating if the text was copied successfully
   * @example
   */
  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      // Reset previous state
      setError(null)

      // Check if clipboard API is available
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not available')
      }

      await navigator.clipboard.writeText(text)
      setCopied(true)

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000)

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to copy'
      setError(errorMessage)
      setCopied(false)

      // Reset error state after 3 seconds
      setTimeout(() => setError(null), 3000)

      return false
    }
  }

  return {
    copied,
    error,
    copyToClipboard,
  }
}
