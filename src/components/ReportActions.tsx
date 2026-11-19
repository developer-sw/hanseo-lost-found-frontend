export function ReportActions({ isSubmitting = false }: { isSubmitting?: boolean }) {
  return (
    <div className="report-actions">
      <a className="secondary-link" href="/">취소</a>
      <button className="primary-link" type="submit" disabled={isSubmitting}>
        {isSubmitting ? '입력 내용 확인 중…' : '신고 등록'}
      </button>
    </div>
  )
}
