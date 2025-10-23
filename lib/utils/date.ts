export function formatDistanceToNow(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 1) {
    return 'just now'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30)
    return `${months} month${months === 1 ? '' : 's'} ago`
  } else {
    const years = Math.floor(diffInDays / 365)
    return `${years} year${years === 1 ? '' : 's'} ago`
  }
}
