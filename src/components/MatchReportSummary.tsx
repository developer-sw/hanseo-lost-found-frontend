import { useId } from 'react'
import { CATEGORY_LABELS } from '../data/categories'
import type { MatchReportSummary as MatchReport } from '../types/match'
import { KoreanDateTime } from './KoreanDateTime'

export function MatchReportSummary({ report }: { report: MatchReport }) {
  const headingId = useId()

  return (
    <section className="match-summary" aria-labelledby={headingId}>
      <div className="match-summary__heading">
        <h2 id={headingId}>분실 신고 요약</h2>
        <span className="match-summary__status" data-status={report.status}>
          {report.status === 'OPEN' ? '신고 진행 중' : '신고 종료'}
        </span>
      </div>

      <dl className="match-summary__details">
        <div>
          <dt>물품명</dt>
          <dd>{report.itemName}</dd>
        </div>
        <div>
          <dt>카테고리</dt>
          <dd>{CATEGORY_LABELS[report.categoryId]}</dd>
        </div>
        <div>
          <dt>분실 일시</dt>
          <dd><KoreanDateTime value={report.lostAt} /></dd>
        </div>
        <div>
          <dt>분실 건물</dt>
          <dd>{report.buildingName}</dd>
        </div>
        {report.locationDetail && (
          <div>
            <dt>세부 위치</dt>
            <dd>{report.locationDetail}</dd>
          </div>
        )}
      </dl>
    </section>
  )
}
