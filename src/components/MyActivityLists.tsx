import type { MyActivityTab } from '../app/myActivityRoutes'
import { CATEGORY_LABELS } from '../data/categories'
import type { MyActivity, MyActivityAction, MyClaim, MyFoundReport, MyLostReport } from '../types/myActivity'
import { Icon, type IconName } from './Icon'
import { KoreanDateTime } from './KoreanDateTime'
import '../styles/my-activity-lists.css'

interface MyActivityListsProps {
  activity: MyActivity
  tab: MyActivityTab
  getLostMatchHref: (report: MyLostReport) => string
  getEditHref: (kind: 'lost' | 'found', id: string) => string
  getDetailHref: (kind: 'found' | 'claims', id: string) => string
  getHandoverHref?: (handoverId: string) => string | undefined
  onAction: (action: MyActivityAction) => void
}

type ActivityStatus = MyLostReport['status'] | MyFoundReport['status'] | MyClaim['status']

const statusDetails: Record<ActivityStatus, { label: string; icon: IconName }> = {
  OPEN: { label: '진행 중', icon: 'clock' },
  CLOSED: { label: '종료', icon: 'circle-check' },
  STORED: { label: '보관중', icon: 'box' },
  CLAIM_REQUESTED: { label: '수령신청', icon: 'clipboard' },
  AWAITING_PICKUP: { label: '수령대기', icon: 'clock' },
  CLAIMED: { label: '수령완료', icon: 'circle-check' },
  PENDING: { label: '대기', icon: 'clock' },
  APPROVED: { label: '주인 확정', icon: 'shield-check' },
  REJECTED: { label: '거절', icon: 'x' },
  CANCELLED: { label: '취소', icon: 'x' },
  COMPLETED: { label: '수령완료', icon: 'circle-check' },
}

const claimGuidance: Record<MyClaim['status'], string> = {
  PENDING: '관리자가 소유 증빙을 확인하고 있습니다.',
  APPROVED: '관리자가 본인을 주인으로 확정했습니다. 습득자와 직접 전달을 진행합니다.',
  REJECTED: '수령 신청이 거절되었습니다. 이 습득물에는 다시 신청할 수 없습니다.',
  CANCELLED: '본인이 취소한 신청입니다. 이 습득물에는 새로 신청할 수 없습니다.',
  COMPLETED: '물품 전달과 수령 확인이 완료되었습니다.',
}

const emptyStates: Record<MyActivityTab, { title: string; href: string; action: string; icon: IconName }> = {
  lost: { title: '등록한 분실 신고가 없습니다.', href: '/report/lost', action: '분실물 신고하기', icon: 'edit' },
  found: { title: '등록한 습득 신고가 없습니다.', href: '/report/found', action: '습득물 등록하기', icon: 'box' },
  claims: { title: '수령 신청 내역이 없습니다.', href: '/found', action: '습득물 찾아보기', icon: 'clipboard' },
}

function StatusBadge({ status }: { status: ActivityStatus }) {
  const { label, icon } = statusDetails[status]

  return (
    <span className="my-list-card__status" data-status={status}>
      <Icon name={icon} size={15} />
      <span className="sr-only">상태 </span>{label}
    </span>
  )
}

function CardHeading({ name, status }: { name: string; status: ActivityStatus }) {
  return (
    <div className="my-list-card__heading">
      <h3>{name}</h3>
      <StatusBadge status={status} />
    </div>
  )
}

function ItemThumbnail({ src, name }: { src: string; name: string }) {
  return src
    ? <img className="my-list-card__photo" src={src} alt={`${name} 사진`} loading="lazy" />
    : <span className="my-list-card__photo" role="img" aria-label="대표 사진 없음"><Icon name="box" size={26} /></span>
}

export function MyActivityLists({
  activity, tab, getLostMatchHref, getEditHref, getDetailHref, getHandoverHref, onAction,
}: MyActivityListsProps) {
  const emptyState = emptyStates[tab]
  const count = tab === 'lost' ? activity.lostReports.length : tab === 'found' ? activity.foundReports.length : activity.claims.length

  if (!count) {
    return (
      <div className="my-list-empty">
        <span className="my-list-empty__icon"><Icon name={emptyState.icon} size={28} /></span>
        <h3>{emptyState.title}</h3>
        <a className="secondary-link" href={emptyState.href}>{emptyState.action}</a>
      </div>
    )
  }

  if (tab === 'lost') {
    return (
      <ul className="my-list">
        {activity.lostReports.map((report) => (
          <li key={report.id}>
            <article className="my-list-card">
              <div className="my-list-card__content">
                <CardHeading name={report.itemName} status={report.status} />
                <dl className="my-list-card__fields">
                  <div><dt>카테고리</dt><dd>{CATEGORY_LABELS[report.categoryId]}</dd></div>
                  <div><dt>분실 일시</dt><dd><KoreanDateTime value={report.lostAt} /></dd></div>
                  <div><dt>분실 건물</dt><dd>{report.buildingName}{report.locationDetail && ` · ${report.locationDetail}`}</dd></div>
                  <div><dt>등록일</dt><dd><KoreanDateTime value={report.registeredAt} /></dd></div>
                </dl>
              </div>
              <div className="my-list-card__footer">
                {report.status === 'CLOSED' && (
                  <div className="my-list-card__notices">
                    <p className="my-list-card__notice">종료된 신고에서는 새 습득물 후보를 조회할 수 없습니다.</p>
                  </div>
                )}
                <div className="my-list-card__actions">
                  {report.status === 'OPEN' && (
                    <a className="primary-link" href={getLostMatchHref(report)}>후보 다시 조회</a>
                  )}
                  <a className="secondary-link" href={getEditHref('lost', report.id)}>수정</a>
                  <button
                    className="secondary-link my-list-card__danger"
                    type="button"
                    onClick={() => onAction({ kind: 'delete-lost', id: report.id, name: report.itemName })}
                  >삭제</button>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    )
  }

  if (tab === 'found') {
    return (
      <ul className="my-list">
        {activity.foundReports.map((item) => {
          const isAwaitingPickup = item.status === 'AWAITING_PICKUP'
          const handoverHref = isAwaitingPickup && item.handoverId ? getHandoverHref?.(item.handoverId) : undefined

          return (
            <li key={item.id}>
              <article className="my-list-card">
                <div className="my-list-card__main">
                  <ItemThumbnail src={item.image} name={item.name} />
                  <div className="my-list-card__content">
                    <CardHeading name={item.name} status={item.status} />
                    <dl className="my-list-card__fields">
                      <div><dt>카테고리</dt><dd>{CATEGORY_LABELS[item.category]}</dd></div>
                      <div><dt>습득 일시</dt><dd><KoreanDateTime value={item.foundAt} /></dd></div>
                      <div><dt>습득 건물</dt><dd>{item.building}{item.locationDetail && ` · ${item.locationDetail}`}</dd></div>
                      <div><dt>등록일</dt><dd><KoreanDateTime value={item.registeredAt} /></dd></div>
                    </dl>
                  </div>
                </div>
                <div className="my-list-card__footer">
                  {(isAwaitingPickup || item.hasClaimRequests) && (
                    <div className="my-list-card__notices">
                      {isAwaitingPickup && (
                        <p className="my-list-card__notice my-list-card__notice--handover">
                          주인이 확정되었습니다. 보관 중인 물품을 분실자에게 직접 전달합니다.
                          {!handoverHref && ' 전달 진행 화면은 준비 중입니다.'}
                        </p>
                      )}
                      {item.hasClaimRequests && <p className="my-list-card__notice">수령 신청이 있는 습득 신고는 삭제할 수 없습니다.</p>}
                    </div>
                  )}
                  <div className="my-list-card__actions">
                    {handoverHref && <a className="primary-link" href={handoverHref}>전달 진행 보기</a>}
                    <a className="secondary-link" href={getDetailHref('found', item.id)}>상세보기</a>
                    <a className="secondary-link" href={getEditHref('found', item.id)}>수정</a>
                    <button
                      className="secondary-link my-list-card__danger"
                      type="button"
                      disabled={item.hasClaimRequests}
                      onClick={() => onAction({ kind: 'delete-found', id: item.id, name: item.name })}
                    >삭제</button>
                  </div>
                </div>
              </article>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <ul className="my-list">
      {activity.claims.map((claim) => {
        const { item } = claim
        const isApproved = claim.status === 'APPROVED'
        const isCompleted = claim.status === 'COMPLETED'
        const handoverHref = (isApproved || isCompleted) && claim.handoverId ? getHandoverHref?.(claim.handoverId) : undefined

        return (
          <li key={claim.id}>
            <article className="my-list-card">
              <div className="my-list-card__main">
                <ItemThumbnail src={item.image} name={item.name} />
                <div className="my-list-card__content">
                  <CardHeading name={item.name} status={claim.status} />
                  <dl className="my-list-card__fields">
                    <div><dt>신청일</dt><dd><KoreanDateTime value={claim.requestedAt} /></dd></div>
                    {claim.lostItemId && (
                      <div><dt>연결된 분실 신고</dt><dd>{claim.linkedLostItemName ?? '연결된 신고 있음'}</dd></div>
                    )}
                  </dl>
                </div>
              </div>
              <div className="my-list-card__footer">
                <div className="my-list-card__notices">
                  <p className={isApproved ? 'my-list-card__notice my-list-card__notice--handover' : 'my-list-card__notice'}>
                    {claimGuidance[claim.status]}{isApproved && !handoverHref && ' 전달 진행 화면은 준비 중입니다.'}
                  </p>
                </div>
                <div className="my-list-card__actions">
                  {handoverHref && <a className="primary-link" href={handoverHref}>{isCompleted ? '완료 내역 보기' : '전달 진행 보기'}</a>}
                  <a className="secondary-link" href={getDetailHref('claims', claim.foundItemId)}>상세보기</a>
                  {claim.status === 'PENDING' && (
                    <button
                      className="secondary-link my-list-card__danger"
                      type="button"
                      onClick={() => onAction({ kind: 'cancel-claim', id: claim.id, name: item.name })}
                    >신청 취소</button>
                  )}
                </div>
              </div>
            </article>
          </li>
        )
      })}
    </ul>
  )
}
