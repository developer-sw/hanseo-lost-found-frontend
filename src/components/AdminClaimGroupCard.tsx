import { useId, useState, type MouseEvent } from 'react'
import { ADMIN_ITEM_STATUSES } from '../data/adminItemStatuses'
import { CATEGORY_LABELS } from '../data/categories'
import type { AdminClaim, AdminClaimGroup, AdminClaimReviewAction } from '../types/adminClaims'
import type { AdminFoundItem } from '../types/adminItems'
import { canReviewAdminClaim, hasConfirmedAdminClaim } from '../utils/adminClaimReview'
import { AdminClaimStatusBadge } from './AdminClaimStatusBadge'
import { Icon } from './Icon'
import { KoreanDateTime } from './KoreanDateTime'

interface AdminClaimGroupCardProps {
  group: AdminClaimGroup
  initiallyExpanded: boolean
  handoversHref?: string
  onReview: (event: MouseEvent<HTMLButtonElement>, action: AdminClaimReviewAction, group: AdminClaimGroup, claim: AdminClaim) => void
}

function ItemPhoto({ item }: { item: AdminFoundItem }) {
  const [failedImage, setFailedImage] = useState('')

  return item.image && item.image !== failedImage
    ? <img className="admin-claims-group__photo" src={item.image} alt={`${item.name} 대표 사진`} loading="lazy" onError={() => setFailedImage(item.image)} />
    : <span className="admin-claims-group__photo" role="img" aria-label="대표 사진 없음"><Icon name="box" size={24} /></span>
}

export function AdminClaimGroupCard({ group, initiallyExpanded, handoversHref, onReview }: AdminClaimGroupCardProps) {
  const headingId = useId()
  const contentId = useId()
  const [expanded, setExpanded] = useState(initiallyExpanded)
  const [selectedClaimId, setSelectedClaimId] = useState<string>()
  const { item, claims } = group
  const itemStatus = ADMIN_ITEM_STATUSES.find(({ status }) => status === item.status)
  const pendingCount = claims.filter(({ status }) => status === 'PENDING').length
  const isCompleted = item.status === 'CLAIMED' || claims.some(({ status }) => status === 'COMPLETED')

  return (
    <article className="admin-claims-group" aria-labelledby={headingId}>
      <div className="admin-claims-group__header">
        <ItemPhoto item={item} />
        <div className="admin-claims-group__identity">
          <h3 id={headingId}>{item.name}</h3>
          <div className="admin-claims-group__tags">
            <span>{CATEGORY_LABELS[item.category]}</span>
            {itemStatus && (
              <span className="admin-claims-group__status" data-status={item.status}>
                <Icon name={itemStatus.icon} size={15} />
                <span className="sr-only">습득물 상태 </span>{itemStatus.label}
              </span>
            )}
          </div>
        </div>
        <dl className="admin-claims-group__meta">
          <div><dt>습득 건물</dt><dd>{item.building}</dd></div>
          <div><dt>습득 일시</dt><dd><KoreanDateTime value={item.foundAt} /></dd></div>
        </dl>
        <div className="admin-claims-group__controls">
          <p className="admin-claims-group__count">신청 <strong>{claims.length}건</strong><span aria-hidden="true"> · </span> 대기 <strong>{pendingCount}건</strong></p>
          <button
            className="secondary-link admin-claims-group__toggle"
            type="button"
            aria-expanded={expanded}
            aria-controls={contentId}
            aria-label={`${item.name} ${expanded ? '신청 목록 접기' : '신청 목록 보기'}`}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? '신청 목록 접기' : '신청 목록 보기'} <Icon name="chevron-down" size={17} />
          </button>
        </div>
      </div>
      <div className="admin-claims-group__content" id={contentId} hidden={!expanded}>
        {expanded && (
          <>
            {isCompleted ? (
              <p className="admin-claims-group__state"><Icon name="circle-check" size={18} /> 수령이 완료된 습득물입니다.</p>
            ) : hasConfirmedAdminClaim(group) ? (
              <div className="admin-claims-group__state">
                <p><Icon name="shield-check" size={18} /> 이미 주인이 확정된 습득물입니다.</p>
                {handoversHref && <a className="secondary-link" href={handoversHref}>전달 진행 현황 보기 <Icon name="arrow-right" size={16} /></a>}
              </div>
            ) : (
              claims.length > 0 && pendingCount === 0
                ? <p className="admin-claims-group__state"><Icon name="info" size={18} /> 검토 대기 중인 신청이 없습니다.</p>
                : null
            )}
            {claims.length === 0 ? (
              <p className="admin-claims-group__empty">이 습득물에 접수된 수령 신청이 없습니다.</p>
            ) : (
              <ul className="admin-claims-group__applicants" role="list">
                {claims.map((claim) => {
                  const reviewable = canReviewAdminClaim(group, claim)
                  const selected = reviewable && selectedClaimId === claim.id

                  return (
                    <li className="admin-claim-card" key={claim.id} data-selected={selected}>
                      <div className="admin-claim-card__header">
                        <div className="admin-claim-card__identity">
                          <h4>{claim.applicant.name}</h4>
                          <p>{claim.applicant.accountId}</p>
                        </div>
                        <AdminClaimStatusBadge status={claim.status} />
                      </div>
                      <dl className="admin-claim-card__facts">
                        <div><dt>신청 일시</dt><dd><KoreanDateTime value={claim.requestedAt} /></dd></div>
                        <div><dt>분실 신고</dt><dd>{claim.linkedLostItemId ? '연결됨' : '연결 없음'}</dd></div>
                      </dl>
                      <div className="admin-claim-card__evidence">
                        <h5>소유 증빙</h5>
                        <p>{claim.ownershipProof}</p>
                      </div>
                      {reviewable && (
                        <div className="admin-claim-card__actions">
                          <button
                            className="secondary-link"
                            type="button"
                            aria-label={`${claim.applicant.name} 신청 검토`}
                            aria-pressed={selected}
                            onClick={() => setSelectedClaimId(selected ? undefined : claim.id)}
                          >
                            신청 검토
                          </button>
                          {selected && (
                            <>
                              <button className="primary-link" aria-haspopup="dialog" type="button" onClick={(event) => onReview(event, 'approve', group, claim)}>
                                주인 확정
                              </button>
                              <button className="secondary-link admin-claim-card__reject" aria-haspopup="dialog" type="button" onClick={(event) => onReview(event, 'reject', group, claim)}>
                                신청 거절
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </>
        )}
      </div>
    </article>
  )
}
