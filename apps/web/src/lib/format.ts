export function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m`
  }
  return `${minutes}:${remaining.toString().padStart(2, '0')}`
}

export function formatDate(value: string, language: string) {
  return new Intl.DateTimeFormat(language === 'th' ? 'th-TH' : 'en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}
