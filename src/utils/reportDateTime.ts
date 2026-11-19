const koreaOffsetMs = 9 * 60 * 60 * 1000
const dateTimeInputPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/

export function formatKoreanDateTimeInput(date: Date) {
  return new Date(date.getTime() + koreaOffsetMs).toISOString().slice(0, 16)
}

export function parseKoreanDateTimeInput(value: string) {
  if (!dateTimeInputPattern.test(value) || value.startsWith('0000')) return undefined

  const timestamp = Date.parse(`${value}:00Z`) - koreaOffsetMs
  if (!Number.isFinite(timestamp) || formatKoreanDateTimeInput(new Date(timestamp)) !== value) return undefined

  return timestamp
}
