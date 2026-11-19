interface ReportActionsProps {
  isSubmitting?: boolean
  cancelHref?: string
  submitLabel?: string
}

export function ReportActions({ isSubmitting = false, cancelHref = '/', submitLabel = '신고 등록' }: ReportActionsProps) {
  return (
    <div className="report-actions">
      <a className="secondary-link" href={cancelHref}>취소</a>
      <button className="primary-link" type="submit" disabled={isSubmitting}>
        {isSubmitting ? '입력 내용 확인 중…' : submitLabel}
      </button>
    </div>
  )
}
