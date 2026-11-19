import { useId } from 'react'
import { getFoundItemPath } from '../app/foundItemRoutes'
import { CATEGORY_LABELS } from '../data/categories'
import type { MatchDemoScenario } from '../data/demoMatches'
import type { MatchCandidate } from '../types/match'
import { Icon } from './Icon'
import { KoreanDateTime } from './KoreanDateTime'

interface MatchCandidateCardProps {
  candidate: MatchCandidate
  rank: number
  reportId?: string
  demoScenario?: MatchDemoScenario
}

export function MatchCandidateCard({ candidate, rank, reportId, demoScenario }: MatchCandidateCardProps) {
  const headingId = useId()
  const { name, category, image, building, locationDetail, foundAt, score, reasons } = candidate
  const visibleReasons = reasons?.filter((reason) => reason.trim().length > 0) ?? []
  const detailHref = demoScenario
    ? getFoundItemPath(candidate.id, { source: 'match-demo', scenario: demoScenario })
    : getFoundItemPath(candidate.id, reportId ? { source: 'match', lostReportId: reportId } : undefined)

  return (
    <article className="match-candidate" aria-labelledby={headingId}>
      <div className="match-candidate__media">
        <img className="match-candidate__photo" src={image} alt={`${name} 습득물 사진`} loading="lazy" />
        <span className="match-candidate__rank">{rank}위</span>
      </div>

      <div className="match-candidate__body">
        <div className="match-candidate__heading">
          <div>
            <p className="match-candidate__category">{CATEGORY_LABELS[category]}</p>
            <h3 id={headingId}>{name}</h3>
          </div>
          <p className="match-score"><span>{demoScenario ? '예시 매칭 점수' : '매칭 점수'}</span>{' '}<strong>{score}점</strong></p>
        </div>

        <dl className="match-candidate__meta">
          <div>
            <dt><Icon name="map-pin" size={16} />습득 장소</dt>
            <dd>{locationDetail ? `${building} ${locationDetail}` : building}</dd>
          </div>
          <div>
            <dt><Icon name="clock" size={16} />습득 일시</dt>
            <dd><KoreanDateTime value={foundAt} /></dd>
          </div>
        </dl>

        {visibleReasons.length > 0 && (
          <div className="match-candidate__reasons">
            <p>매칭 근거</p>
            <ul>
              {visibleReasons.map((reason, index) => <li key={`${reason}-${index}`}>{reason}</li>)}
            </ul>
          </div>
        )}
      </div>

      <div className="match-candidate__actions">
        <a className="primary-link" href={detailHref} aria-describedby={headingId}>
          상세보기 <Icon name="arrow-right" size={16} />
        </a>
        <button className="secondary-link match-candidate__claim" type="button" disabled>
          수령 신청 <span>준비 중</span>
        </button>
      </div>
    </article>
  )
}
