import { useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { ADMIN_LOGIN_PATH } from '../app/adminRoutes'
import { AdminClaimGroupCard } from '../components/AdminClaimGroupCard'
import { AdminClaimReviewDialog } from '../components/AdminClaimReviewDialog'
import { AdminClaimStatusBadge } from '../components/AdminClaimStatusBadge'
import { Icon, type IconName } from '../components/Icon'
import { ADMIN_ITEM_STATUSES } from '../data/adminItemStatuses'
import type { AdminClaim, AdminClaimGroup, AdminClaimReviewAction, AdminClaimReviewResult, AdminClaimsResult } from '../types/adminClaims'
import { canReviewAdminClaim } from '../utils/adminClaimReview'
import '../styles/admin-claims.css'

type ClaimsState = AdminClaimsResult | { status: 'loading' }
type ReviewSuccess = Extract<AdminClaimReviewResult, { status: 'approved' | 'rejected' }>
type ReviewFailure = Exclude<AdminClaimReviewResult, ReviewSuccess>

interface ReviewTarget {
  group: AdminClaimGroup
  claim: AdminClaim
  action: AdminClaimReviewAction
}

interface ReviewOutcome {
  group: AdminClaimGroup
  claim: AdminClaim
  result: ReviewSuccess
}

interface AdminClaimsPageProps {
  state: ClaimsState
  focusedId?: string
  demo?: boolean
  demoControl?: ReactNode
  onRetry: () => void
  onReview: (action: AdminClaimReviewAction, groupId: string, claimId: string) => Promise<AdminClaimReviewResult>
  getHandoversHref: (group: AdminClaimGroup, result?: Extract<ReviewSuccess, { status: 'approved' }>) => string
  getItemsHref: () => string
  getClaimsHref: () => string
}

const listNotices: Record<Exclude<ClaimsState['status'], 'ready'>, { title: string; description: string; icon: IconName }> = {
  loading: { title: '수령 신청 목록을 불러오는 중입니다.', description: '잠시만 기다려 주세요.', icon: 'clock' },
  'not-found': { title: '습득물을 찾을 수 없습니다.', description: '전체 신청 목록에서 물품을 다시 확인해 주세요.', icon: 'search' },
  'sign-in-required': { title: '관리자 로그인이 필요합니다.', description: '관리자 계정으로 로그인해 주세요.', icon: 'user' },
  expired: { title: '관리자 인증이 만료되었습니다.', description: '관리자 계정으로 다시 로그인해 주세요.', icon: 'clock' },
  forbidden: { title: '수령 신청을 조회할 권한이 없습니다.', description: '관리자 계정으로 접속해 주세요.', icon: 'shield-check' },
  unavailable: { title: '수령 신청 처리 API가 아직 연결되지 않았습니다.', description: '서버 연동 후 신청과 소유 증빙을 조회할 수 있습니다.', icon: 'info' },
  error: { title: '수령 신청 목록을 불러오지 못했습니다.', description: '잠시 후 다시 시도해 주세요.', icon: 'info' },
}

const reviewMessages = {
  'not-found': '신청 또는 습득물을 찾을 수 없습니다. 최신 신청 목록을 확인해 주세요.',
  'sign-in-required': '관리자 로그인이 필요합니다.',
  expired: '관리자 인증이 만료되었습니다. 다시 로그인해 주세요.',
  forbidden: '수령 신청을 처리할 권한이 없습니다.',
  unavailable: '수령 신청 처리 API가 아직 연결되지 않았습니다.',
  error: '요청 처리 결과를 확인할 수 없습니다. 다시 시도하기 전에 최신 신청 목록을 확인해 주세요.',
  'already-confirmed': '이미 주인이 확정된 습득물입니다. 최신 신청 목록을 확인해 주세요.',
  'already-processed': '이미 처리된 신청입니다. 최신 신청 목록을 확인해 주세요.',
  stale: '다른 관리자가 신청 상태를 변경했습니다. 최신 신청 목록을 확인해 주세요.',
}

function getReviewMessage(result: ReviewFailure) {
  return reviewMessages[result.status === 'conflict' ? result.reason : result.status]
}

function ClaimListNotice({ status, claimsHref, onRetry }: {
  status: Exclude<ClaimsState['status'], 'ready'>
  claimsHref: string
  onRetry: () => void
}) {
  const { title, description, icon } = listNotices[status]
  return (
    <section className="admin-dashboard-notice" aria-labelledby="admin-claims-notice-title">
      <span className="admin-dashboard-notice__icon"><Icon name={icon} size={24} /></span>
      <div role={status === 'loading' ? 'status' : undefined}>
        <h2 id="admin-claims-notice-title">{title}</h2>
        <p>{description}</p>
      </div>
      {status === 'not-found' && <a className="secondary-link" href={claimsHref}>전체 신청 보기</a>}
      {status === 'error' && <button className="secondary-link" type="button" onClick={onRetry}>다시 시도</button>}
      {(status === 'sign-in-required' || status === 'expired') && (
        <a className="primary-link" href={ADMIN_LOGIN_PATH}>관리자 로그인</a>
      )}
      {status === 'forbidden' && <a className="secondary-link" href="/">학생용 메인으로 이동</a>}
    </section>
  )
}

function ClaimReviewPreview({ outcome, demo, handoversHref }: {
  outcome: ReviewOutcome
  demo: boolean
  handoversHref?: string
}) {
  const { result, claim, group } = outcome
  const nextItemStatus = ADMIN_ITEM_STATUSES.find(({ status }) => status === result.itemStatus)

  return (
    <section className="admin-claims-preview" aria-labelledby="admin-claims-preview-title">
      <div className="admin-claims-preview__header">
        <h2 id="admin-claims-preview-title">{demo ? '데모 처리 예상 결과' : '수령 신청 처리 결과'}</h2>
        <p>{group.item.name} · {claim.applicant.name}</p>
        {demo && <p>예시 목록에만 반영되며, 새로고침하면 초기 상태로 돌아갑니다.</p>}
      </div>
      <dl className="admin-claims-preview__changes">
        <div><dt>선택한 신청</dt><dd><AdminClaimStatusBadge status={result.claimStatus} /></dd></div>
        <div><dt>습득물 상태</dt><dd>{nextItemStatus?.label ?? result.itemStatus}</dd></div>
        {result.status === 'approved' && (
          <>
            <div><dt>나머지 대기 신청</dt><dd>{result.rejectedClaimIds.length}건 거절</dd></div>
            <div><dt>전달 진행</dt><dd>대기{demo ? ' 생성 예정' : ''} ({result.handover.status})</dd></div>
            {result.closedLostItemId && <div><dt>연결된 분실 신고</dt><dd>{demo ? '종료 예정' : '종료'}</dd></div>}
          </>
        )}
      </dl>
      {handoversHref && (
        <div className="admin-claims-preview__actions">
          <a className="primary-link" href={handoversHref}>전달 진행 현황 보기 <Icon name="arrow-right" size={16} /></a>
        </div>
      )}
    </section>
  )
}

export function AdminClaimsPage({
  state, focusedId, demo = false, demoControl, onRetry, onReview, getHandoversHref, getItemsHref, getClaimsHref,
}: AdminClaimsPageProps) {
  const [target, setTarget] = useState<ReviewTarget>()
  const [outcome, setOutcome] = useState<ReviewOutcome>()
  const [feedback, setFeedback] = useState('')
  const reviewTrigger = useRef<HTMLButtonElement>(null)
  const resultRegion = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const moveFocusToResult = useRef(false)
  const isFocused = focusedId !== undefined
  const groups = state.status === 'ready' ? state.groups.filter(({ item }) => !isFocused || item.id === focusedId) : []
  const listStatus = isFocused && state.status === 'ready' && groups.length === 0 ? 'not-found' : state.status
  const pendingCount = groups.reduce((count, group) => count + group.claims.filter(({ status }) => status === 'PENDING').length, 0)

  function openReview(event: MouseEvent<HTMLButtonElement>, action: AdminClaimReviewAction, group: AdminClaimGroup, claim: AdminClaim) {
    reviewTrigger.current = event.currentTarget
    moveFocusToResult.current = false
    setTarget({ action, group, claim })
  }

  function closeReview() {
    const trigger = reviewTrigger.current
    const focusResult = moveFocusToResult.current
    reviewTrigger.current = null
    setTarget(undefined)
    requestAnimationFrame(() => {
      if (focusResult && resultRegion.current) {
        resultRegion.current.focus()
      } else if (trigger?.isConnected) {
        trigger.focus({ preventScroll: true })
      } else {
        headingRef.current?.focus()
      }
    })
  }

  async function submitReview() {
    if (!target) return
    const latestGroup = groups.find(({ item }) => item.id === target.group.item.id)
    const latestClaim = latestGroup?.claims.find(({ id }) => id === target.claim.id)

    setFeedback('')
    setOutcome(undefined)
    moveFocusToResult.current = true

    try {
      if (!latestGroup || !latestClaim || !canReviewAdminClaim(latestGroup, latestClaim)) {
        setFeedback(latestGroup ? reviewMessages['already-processed'] : reviewMessages['not-found'])
        onRetry()
        return
      }

      const result = await onReview(target.action, latestGroup.item.id, latestClaim.id)
      if (result.status === 'approved' || result.status === 'rejected') {
        setOutcome({ group: latestGroup, claim: latestClaim, result })
      } else {
        setFeedback(getReviewMessage(result))
      }
    } catch {
      setFeedback(reviewMessages.error)
    }
  }

  return (
    <div className="admin-claims">
      <header className="admin-claims__heading admin-dashboard__heading">
        <div>
          <h1 ref={headingRef} tabIndex={-1}>수령 신청 처리</h1>
          <p>습득물에 접수된 수령 신청과 소유 증빙을 확인하고, 실제 주인을 확정해 주세요.</p>
        </div>
        {isFocused && <a className="secondary-link" href={getItemsHref()}><Icon name="arrow-left" size={16} /> 습득물 관리</a>}
      </header>

      {demoControl}

      {(outcome || feedback) && (
        <div className="admin-claims__result" tabIndex={-1} ref={resultRegion}>
          {feedback && (
            <div className="admin-claims__review-feedback" role="alert">
              <Icon name="info" size={20} />
              <p>{feedback}</p>
            </div>
          )}
          {outcome && (
            <ClaimReviewPreview
              outcome={outcome}
              demo={demo}
              handoversHref={outcome.result.status === 'approved' ? getHandoversHref(outcome.group, outcome.result) : undefined}
            />
          )}
        </div>
      )}

      {listStatus !== 'ready' ? (
        <ClaimListNotice status={listStatus} claimsHref={getClaimsHref()} onRetry={onRetry} />
      ) : (
        <section aria-labelledby="admin-claims-overview-title">
          <div className="admin-claims__overview">
            <h2 id="admin-claims-overview-title">습득물별 신청 현황</h2>
            <p className="admin-dashboard__total">습득물 <strong>{groups.length}건</strong> · 대기 신청 <strong>{pendingCount}건</strong></p>
            {isFocused && <a className="secondary-link" href={getClaimsHref()}>전체 신청 보기</a>}
          </div>
          {groups.length === 0 ? (
            <div className="admin-dashboard-notice" role="status">
              <span className="admin-dashboard-notice__icon"><Icon name="clipboard" size={24} /></span>
              <p>접수된 수령 신청이 없습니다.</p>
            </div>
          ) : (
            <ul className="admin-claims__groups" role="list">
              {groups.map((group) => {
                const itemId = group.item.id
                const hasPreview = outcome?.group.item.id === itemId
                return (
                  <li key={itemId}>
                    <AdminClaimGroupCard
                      group={group}
                      initiallyExpanded={focusedId === itemId || hasPreview}
                      handoversHref={group.item.status === 'AWAITING_PICKUP' && !hasPreview ? getHandoversHref(group) : undefined}
                      onReview={openReview}
                    />
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      )}

      {target && (
        <AdminClaimReviewDialog
          action={target.action}
          itemName={target.group.item.name}
          claim={target.claim}
          otherPendingCount={target.group.claims.filter(({ id, status }) => id !== target.claim.id && status === 'PENDING').length}
          demo={demo}
          onConfirm={submitReview}
          onClose={closeReview}
        />
      )}
    </div>
  )
}
