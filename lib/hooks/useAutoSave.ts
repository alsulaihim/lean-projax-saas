import { useEffect, useRef, useState, useCallback } from 'react'
import { useDebounce } from './useDebounce'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface UseAutoSaveOptions<T> {
  onSave: (data: T) => Promise<void>
  delay?: number // milliseconds
  enabled?: boolean
}

interface UseAutoSaveReturn {
  saveStatus: SaveStatus
  lastSaved: Date | null
  triggerSave: () => void
  error: Error | null
}

export function useAutoSave<T>(
  data: T,
  options: UseAutoSaveOptions<T>
): UseAutoSaveReturn {
  const { onSave, delay = 30000, enabled = true } = options // Default 30 seconds
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const isMountedRef = useRef(true)
  const lastDataRef = useRef(data)

  // Debounced data that triggers save
  const debouncedData = useDebounce(data, delay)

  // Manual save trigger
  const triggerSave = useCallback(async () => {
    if (!enabled) return

    try {
      setSaveStatus('saving')
      setError(null)
      await onSave(lastDataRef.current)

      if (isMountedRef.current) {
        setSaveStatus('saved')
        setLastSaved(new Date())

        // Reset to idle after 2 seconds
        setTimeout(() => {
          if (isMountedRef.current && saveStatus === 'saved') {
            setSaveStatus('idle')
          }
        }, 2000)
      }
    } catch (err) {
      if (isMountedRef.current) {
        setSaveStatus('error')
        setError(err as Error)
        console.error('Auto-save failed:', err)
      }
    }
  }, [enabled, onSave, saveStatus])

  // Auto-save effect
  useEffect(() => {
    if (!enabled) return

    // Only save if data has actually changed
    const hasChanged = JSON.stringify(debouncedData) !== JSON.stringify(lastDataRef.current)

    if (hasChanged && debouncedData !== undefined) {
      lastDataRef.current = debouncedData
      triggerSave()
    }
  }, [debouncedData, enabled, triggerSave])

  // Cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // Warn on page unload if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === 'saving' ||
          (JSON.stringify(data) !== JSON.stringify(lastDataRef.current))) {
        const message = 'You have unsaved changes. Are you sure you want to leave?'
        e.preventDefault()
        e.returnValue = message
        return message
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [data, saveStatus])

  return {
    saveStatus,
    lastSaved,
    triggerSave,
    error
  }
}