import { SaveStatus } from '@/lib/hooks/useAutoSave'
import { Check, Loader2, AlertCircle, Cloud } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AutoSaveIndicatorProps {
  status: SaveStatus
  lastSaved?: Date | null
  className?: string
}

export function AutoSaveIndicator({
  status,
  lastSaved,
  className
}: AutoSaveIndicatorProps) {
  const formatLastSaved = (date: Date | null | undefined) => {
    if (!date) return ''
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    return date.toLocaleDateString()
  }

  return (
    <div className={cn(
      'flex items-center gap-2 text-sm transition-all duration-300',
      className
    )}>
      {status === 'idle' && lastSaved && (
        <>
          <Cloud className="h-4 w-4 text-gray-400" />
          <span className="text-gray-500">
            Saved {formatLastSaved(lastSaved)}
          </span>
        </>
      )}

      {status === 'saving' && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span className="text-blue-600 font-medium">Saving...</span>
        </>
      )}

      {status === 'saved' && (
        <>
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-green-600 font-medium">All changes saved</span>
        </>
      )}

      {status === 'error' && (
        <>
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-red-600 font-medium">Save failed - retrying...</span>
        </>
      )}
    </div>
  )
}