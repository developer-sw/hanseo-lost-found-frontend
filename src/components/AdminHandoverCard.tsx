import { useId, useState, type MouseEvent } from 'react'
import { ADMIN_ITEM_STATUSES } from '../data/adminItemStatuses'
import { CATEGORY_LABELS } from '../data/categories'
import type { AdminHandover, HandoverStatus } from '../types/adminHandovers'
import type { AdminFoundItem } from '../types/adminItems'
import { AdminClaimStatusBadge } from './AdminClaimStatusBadge'
import { Icon, type IconName } from './Icon'
import { KoreanDateTime } from './KoreanDateTime'

const handoverStatuses: Record<HandoverStatus, { label: string; icon: IconName }> = {
  WAITING: { label: '이동 대기', icon: 'clock' },
  PLACE_SET: { label: '장소 확정', icon: 'map-pin' },
  DONE: { label: '전달 완료', icon: 'circle-check' },
}

export function AdminHandoverBadge({ status }: { status: HandoverStatus }) {
  const { label, icon } = handoverStatuses[status]
  return (
    <span className="admin-handover-badge" data-status={status}>
      <Icon name={icon} size={15} />
      <span className="sr-only">전달 상태 </span>{label}
    </span>
  )
}

export function AdminHandoverPhoto({ item, detail = false }: { item: AdminFoundItem; detail?: boolean }) {
  const [failedImage, setFailedImage] = useState('')
  const image = item.image?.trim()

  return (
    <div className="admin-handover-photo" data-detail={detail}>
      {image && failedImage !== image ? (
        <img src={image} alt={`${item.name} 대표 사진`} loading={detail ? undefined : 'lazy'} onError={() => setFailedImage(image)} />
      ) : (
        <span role="img" aria-label="대표 사진 없음"><Icon name="box" size={detail ? 30 : 24} /></span>
      )}
    </div>
  )
}

export function AdminHandoverItemStatus({ status }: { status: AdminFoundItem['status'] }) {
  const presentation = ADMIN_ITEM_STATUSES.find((entry) => entry.status === status)

  return presentation && (
    <span className="admin-item-detail__status" data-status={status}>
      <Icon name={presentation.icon} size={15} />
      <span className="sr-only">습득물 상태 </span>{presentation.label}
    </span>
  )
}

export function AdminHandoverOwner({ claim }: { claim: AdminHandover['claim'] }) {
  return (
    <>
      <div><dt>확정된 신청자</dt><dd>{claim.applicantName}</dd></div>
      <div><dt>승인 신청 상태</dt><dd><AdminClaimStatusBadge status={claim.status} /></dd></div>
      <div><dt>신청 ID</dt><dd>{claim.id}</dd></div>
      {claim.confirmedAt && <div><dt>주인 확정 일시</dt><dd><KoreanDateTime value={claim.confirmedAt} /></dd></div>}
    </>
  )
}

export function AdminHandoverPlace({ handover }: { handover: AdminHandover }) {
  const { status, buildingName, placeSetAt } = handover
  const waiting = status === 'WAITING'

  return (
    <>
      <div>
        <dt>추천 건물</dt>
        <dd>{waiting ? '아직 전달 장소가 정해지지 않았습니다.' : buildingName?.trim() || '추천 건물 정보를 확인할 수 없습니다.'}</dd>
      </div>
      {!waiting && <div><dt>장소 확정 일시</dt><dd>{placeSetAt ? <KoreanDateTime value={placeSetAt} /> : '일시 정보 없음'}</dd></div>}
    </>
  )
}

export function AdminHandoverReceipt({ handover }: { handover: AdminHandover }) {
  const complete = handover.status === 'DONE'

  return (
    <>
      <div><dt>수령 확인</dt><dd>{complete ? '수령완료' : '수령 확인 전'}</dd></div>
      {complete && (
        <div><dt>수령완료 일시</dt><dd>{handover.completedAt ? <KoreanDateTime value={handover.completedAt} /> : '일시 정보 없음'}</dd></div>
      )}
    </>
  )
}

export function AdminHandoverCard({ handover, onDetail }: {
  handover: AdminHandover
  onDetail: (event: MouseEvent<HTMLButtonElement>, handoverId: string) => void
}) {
  const titleId = useId()
  const { item, claim, handoverId, status, source } = handover

  return (
    <article className="admin-handover-card" aria-labelledby={titleId} data-handover-id={handoverId} data-source={source}>
      <div className="admin-handover-card__item">
        <AdminHandoverPhoto item={item} />
        <div className="admin-handover-card__info">
          <h3 id={titleId}>{item.name}</h3>
          <p className="admin-handover-card__tags">
            <span>{CATEGORY_LABELS[item.category]}</span>
            <AdminHandoverItemStatus status={item.status} />
          </p>
          {source && <span className="admin-handover-card__source">{source === 'preview' ? 'A3 확정 예상 결과' : 'A4 장소 확정 예시'}</span>}
          <dl className="admin-handover-card__facts">
            <div><dt>습득 건물</dt><dd>{item.building}</dd></div>
            <div><dt>습득 일시</dt><dd><KoreanDateTime value={item.foundAt} /></dd></div>
          </dl>
        </div>
      </div>
      <dl className="admin-handover-card__owner"><AdminHandoverOwner claim={claim} /></dl>
      <dl className="admin-handover-card__progress">
        <div><dt>전달 상태</dt><dd><AdminHandoverBadge status={status} /></dd></div>
        <AdminHandoverPlace handover={handover} />
      </dl>
      <div className="admin-handover-card__actions">
        <dl className="admin-handover-card__receipt"><AdminHandoverReceipt handover={handover} /></dl>
        <button className="secondary-link" type="button" aria-haspopup="dialog" aria-label={`${item.name} 전달 상세보기`} onClick={(event) => onDetail(event, handoverId)}>
          상세보기
        </button>
      </div>
    </article>
  )
}
