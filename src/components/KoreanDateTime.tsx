const koreanDateTime = new Intl.DateTimeFormat('ko-KR', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Seoul',
})

export function KoreanDateTime({ value }: { value: string }) {
  const date = new Date(value)

  if (!Number.isFinite(date.getTime())) return <span>일시 정보 없음</span>

  return <time dateTime={value}>{koreanDateTime.format(date)}</time>
}
