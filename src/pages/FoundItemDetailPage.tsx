import { useEffect, useRef, useState } from 'react'
import { getFoundItemNavigation } from '../app/foundItemRoutes'
import { ClaimRequestDialog } from '../components/ClaimRequestDialog'
import { FoundItemPhoto } from '../components/FoundItemPhoto'
import { Icon, type IconName } from '../components/Icon'
import { KoreanDateTime } from '../components/KoreanDateTime'
import { CATEGORY_LABELS } from '../data/categories'
import { foundItemService } from '../services/foundItems'
import type { FoundItemDetailResult, FoundItemStatus } from '../types/foundItem'
import '../styles/found-item-detail.css'

type DetailNavigation = ReturnType<typeof getFoundItemNavigation>
type ReadyDetail = Extract<FoundItemDetailResult, { status: 'ready' }>
type DetailView = FoundItemDetailResult | { status: 'loading' | 'invalid-url' }

const statuses: Record<FoundItemStatus, { label: string; icon: IconName; custody: string; unavailable?: string }> = {
  STORED: {
    label: '보관중', icon: 'box',
    custody: '해당 물품은 습득자가 보관 중이며, 관리자 확인 후 주인이 확정되면 직접 전달이 진행됩니다.',
  },
  CLAIM_REQUESTED: {
    label: '수령신청', icon: 'clipboard',
    custody: '습득자가 물품을 보관 중입니다. 다른 학생이 이미 신청했더라도 주인이 확정되기 전까지 추가 신청할 수 있습니다.',
  },
  AWAITING_PICKUP: {
    label: '수령대기', icon: 'clock',
    custody: '주인이 확정되어 습득자와 수령자가 직접 전달을 진행합니다.',
    unavailable: '주인이 확정되어 신규 수령 신청이 마감되었습니다.',
  },
  CLAIMED: {
    label: '수령완료', icon: 'circle-check',
    custody: '물품 전달과 수령 확인이 완료되었습니다.',
    unavailable: '수령이 완료된 물품은 신청할 수 없습니다.',
  },
}

const eligibilityMessages = {
  'sign-in-required': '로그인한 학생만 수령을 신청할 수 있습니다.',
  'own-item': '본인이 등록한 습득물에는 수령을 신청할 수 없습니다.',
  'already-requested': '이미 이 습득물에 수령을 신청했습니다.',
  rejected: '이전에 거절된 습득물에는 다시 신청할 수 없습니다.',
  cancelled: '신청을 취소한 뒤에는 같은 물품에 다시 신청할 수 없습니다.',
}

function getClaimUnavailable(detail: ReadyDetail) {
  const { status, claimEligibility } = detail.item
  if (statuses[status].unavailable) return statuses[status].unavailable
  if (detail.source !== 'api' || !claimEligibility || claimEligibility.status === 'allowed') return
  return eligibilityMessages[claimEligibility.status]
}

function StatusBadge({ status }: { status: FoundItemStatus }) {
  return (
    <span className="found-detail__status" data-status={status}>
      <Icon name={statuses[status].icon} size={16} />
      <span className="sr-only">상태 </span>{statuses[status].label}
    </span>
  )
}

function DetailContent({ detail, navigation }: {
  detail: ReadyDetail
  navigation: DetailNavigation
}) {
  const { item, source } = detail
  const [claimOpen, setClaimOpen] = useState(false)
  const claimTrigger = useRef<HTMLButtonElement>(null)
  const unavailable = getClaimUnavailable(detail)

  function closeClaim() {
    setClaimOpen(false)
    claimTrigger.current?.focus()
  }

  return (
    <article className="found-detail__card" aria-labelledby="found-detail-item-name">
      <FoundItemPhoto src={item.image} name={item.name} />

      <div className="found-detail__content">
        <div className="found-detail__item-heading">
          <span className="found-detail__category">{CATEGORY_LABELS[item.category]}</span>
          <div className="found-detail__mobile-status"><StatusBadge status={item.status} /></div>
          <h2 id="found-detail-item-name">{item.name}</h2>
        </div>

        <dl className="found-detail__facts">
          <div>
            <dt><Icon name="map-pin" size={19} />습득 장소</dt>
            <dd>{item.building}{item.locationDetail && <span className="found-detail__location">{item.locationDetail}</span>}</dd>
          </div>
          <div>
            <dt><Icon name="clock" size={19} />습득 일시</dt>
            <dd><KoreanDateTime value={item.foundAt} /></dd>
          </div>
        </dl>

        {item.description && (
          <section className="found-detail__description" aria-labelledby="found-detail-description">
            <h3 id="found-detail-description">물품 설명</h3>
            <p>{item.description}</p>
          </section>
        )}

        <aside className="found-detail__custody" aria-labelledby="found-detail-custody">
          <Icon name="shield-check" size={22} />
          <div>
            <h3 id="found-detail-custody">보관 및 전달 안내</h3>
            <p>{statuses[item.status].custody}</p>
          </div>
        </aside>

        <div className="found-detail__claim">
          <button
            ref={claimTrigger}
            type="button"
            className="primary-link"
            aria-haspopup="dialog"
            aria-describedby={unavailable ? 'found-detail-claim-blocked' : undefined}
            disabled={Boolean(unavailable)}
            onClick={() => setClaimOpen(true)}
          >
            <Icon name="clipboard" size={19} />수령 신청하기
          </button>
          {unavailable && <p id="found-detail-claim-blocked">{unavailable}</p>}
        </div>

        {claimOpen && !unavailable && (
          <ClaimRequestDialog
            item={item}
            source={source}
            context={navigation.claimContext}
            statusBadge={<StatusBadge status={item.status} />}
            onClose={closeClaim}
            onCreated={() => window.location.assign('/my?tab=claims')}
          />
        )}
      </div>
    </article>
  )
}

type NoticeStatus = Exclude<DetailView['status'], 'ready'>

const detailNotices: Record<NoticeStatus, { title: string; description: string; icon: IconName }> = {
  loading: { title: '습득물 정보를 불러오는 중이에요.', description: '잠시만 기다려 주세요.', icon: 'clock' },
  'invalid-url': { title: '습득물 주소를 확인해 주세요.', description: '습득물 목록에서 보고 싶은 물품을 선택해 주세요.', icon: 'search' },
  'not-found': { title: '습득물을 찾을 수 없어요.', description: '습득물 목록에서 다른 물품을 확인해 보세요.', icon: 'search' },
  error: { title: '습득물 정보를 불러오지 못했어요.', description: '잠시 후 다시 시도해 주세요.', icon: 'info' },
  unavailable: { title: '습득물 조회 API가 아직 연결되지 않았어요.', description: '습득물 목록에서 예시 물품을 확인할 수 있어요.', icon: 'info' },
}

function DetailNotice({ status, onRetry }: { status: NoticeStatus; onRetry: () => void }) {
  const { title, description, icon } = detailNotices[status]

  return (
    <section className="found-detail__notice" aria-labelledby="found-detail-notice-title" role={status === 'loading' ? 'status' : undefined}>
      <div className="found-detail__notice-icon"><Icon name={icon} size={26} /></div>
      <h2 id="found-detail-notice-title">{title}</h2>
      <p>{description}</p>
      {status === 'error' && <button type="button" className="secondary-link" onClick={onRetry}>다시 시도</button>}
    </section>
  )
}

export function FoundItemDetailPage({ itemId, params }: {
  itemId?: string
  params: URLSearchParams
}) {
  const [detail, setDetail] = useState<DetailView>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const navigation = getFoundItemNavigation(params)

  useEffect(() => {
    if (!itemId) return
    let active = true

    foundItemService.getById(itemId).then(
      (result) => { if (active) setDetail(result) },
      () => { if (active) setDetail({ status: 'error' }) },
    )

    return () => { active = false }
  }, [itemId, attempt])

  function retry() {
    setDetail({ status: 'loading' })
    setAttempt((current) => current + 1)
  }

  const view = itemId ? detail : { status: 'invalid-url' } as const

  return (
    <main className="site-container inner-page found-detail" id="main-content" aria-busy={view.status === 'loading'}>
      <header className="found-detail__header">
        <a className="back-link" href={navigation.backHref}>
          <Icon name="arrow-left" size={18} />{navigation.backLabel}
        </a>
        <div className="found-detail__page-heading">
          <h1>습득물 상세</h1>
          {view.status === 'ready' && <div className="found-detail__desktop-status"><StatusBadge status={view.item.status} /></div>}
        </div>
      </header>

      {view.status === 'ready' ? (
        <>
          {view.source === 'demo' && (
            <p className="found-detail__demo"><Icon name="info" size={17} />데모 모드 · 예시 습득물 정보입니다.</p>
          )}
          <DetailContent detail={view} navigation={navigation} />
        </>
      ) : <DetailNotice status={view.status} onRetry={retry} />}
    </main>
  )
}
