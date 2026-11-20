import type { ReactNode } from 'react'
import { ADMIN_LOGIN_PATH, ADMIN_SECTIONS, type AdminSection } from '../app/adminRoutes'
import { Icon, type IconName } from '../components/Icon'
import { ADMIN_ITEM_STATUSES } from '../data/adminItemStatuses'
import type { AdminDashboardSummaryResult } from '../types/adminDashboard'
import type { FoundItemStatus } from '../types/foundItem'
import '../styles/admin-dashboard.css'

type DashboardState = AdminDashboardSummaryResult | { status: 'loading' }
type NoticeStatus = Exclude<DashboardState, { status: 'ready' }>['status']

interface AdminDashboardPageProps {
  state: DashboardState
  getHref: (section: AdminSection) => string
  getItemsHref: (filter: FoundItemStatus) => string
  onRetry: () => void
  demoControl?: ReactNode
}

const statusDescriptions: Record<FoundItemStatus, string> = {
  STORED: '습득자가 직접 보관하며 수령 신청을 기다리는 물품입니다.',
  CLAIM_REQUESTED: '신청이 접수되어 소유 증빙을 검토할 물품입니다. 추가 신청이 가능합니다.',
  AWAITING_PICKUP: '주인이 확정되어 직접 전달을 기다리는 물품입니다. 신규 신청은 마감되었습니다.',
  CLAIMED: '분실자가 물품을 받은 뒤 ‘받았어요’로 확인했습니다.',
}

const quickLinks = ADMIN_SECTIONS.filter(({ id }) => id !== 'dashboard')

const notices: Record<NoticeStatus, { title: string; description: string; icon: IconName }> = {
  loading: { title: '습득물 통계를 불러오는 중입니다.', description: '잠시만 기다려 주세요.', icon: 'clock' },
  'sign-in-required': { title: '관리자 로그인이 필요합니다.', description: '관리자 계정으로 로그인해 주세요.', icon: 'user' },
  expired: { title: '로그인 세션이 만료되었습니다.', description: '관리자 계정으로 다시 로그인해 주세요.', icon: 'clock' },
  forbidden: { title: '관리자 권한이 필요합니다.', description: '이 화면은 관리자 계정만 이용할 수 있습니다.', icon: 'shield-check' },
  error: { title: '습득물 통계를 불러오지 못했습니다.', description: '잠시 후 다시 시도해 주세요.', icon: 'info' },
  unavailable: { title: '관리자 API가 아직 연결되지 않았습니다.', description: '서버 연동 후 권한과 습득물 통계를 확인할 수 있습니다.', icon: 'info' },
}

const itemNoticeCopy: Partial<Record<NoticeStatus, { title?: string; description?: string }>> = {
  loading: { title: '습득물 목록을 불러오는 중입니다.' },
  error: { title: '습득물 목록을 불러오지 못했습니다.' },
  unavailable: { description: '서버 연동 후 권한과 습득물 목록을 확인할 수 있습니다.' },
}

const accessCopy: typeof itemNoticeCopy = {
  loading: { title: '관리자 권한을 확인하는 중입니다.' },
  error: { title: '관리자 접속 상태를 확인하지 못했습니다.' },
  unavailable: { description: '서버 연동 후 관리자 권한을 확인할 수 있습니다.' },
}

const countFormat = new Intl.NumberFormat('ko-KR')

export function AdminDashboardNotice({ status, onRetry, resource = 'summary' }: {
  status: NoticeStatus
  onRetry: () => void
  resource?: 'summary' | 'items' | 'access'
}) {
  const { title, description, icon } = notices[status]
  const copy = resource === 'access' ? accessCopy[status] : resource === 'items' ? itemNoticeCopy[status] : undefined

  return (
    <section className="admin-dashboard-notice" aria-labelledby="admin-dashboard-notice-title">
      <span className="admin-dashboard-notice__icon"><Icon name={icon} size={24} /></span>
      <div role={status === 'loading' ? 'status' : undefined}>
        <h2 id="admin-dashboard-notice-title">{copy?.title ?? title}</h2>
        <p>{copy?.description ?? description}</p>
      </div>
      {status === 'error' && <button type="button" className="secondary-link" onClick={onRetry}>다시 시도</button>}
      {(status === 'sign-in-required' || status === 'expired') && (
        <a className="primary-link" href={ADMIN_LOGIN_PATH}>관리자 로그인</a>
      )}
      {status === 'forbidden' && <a className="secondary-link" href="/">학생용 메인으로 이동</a>}
    </section>
  )
}

function StatusSummaryCard({ card, count, href }: { card: typeof ADMIN_ITEM_STATUSES[number]; count: number; href: string }) {
  return (
    <li className="admin-status-card" data-status={card.status}>
      <div className="admin-status-card__heading">
        <span className="admin-status-card__icon"><Icon name={card.icon} size={22} /></span>
        <h3>{card.label}</h3>
      </div>
      <p className="admin-status-card__count">{countFormat.format(count)}<span>건</span></p>
      <p className="admin-status-card__description">{statusDescriptions[card.status]}</p>
      <a className="admin-status-card__link" href={href} aria-label={`${card.label} 목록 보기`}>
        목록 보기 <Icon name="arrow-right" size={16} />
      </a>
    </li>
  )
}

function AdminQuickLinks({ getHref }: Pick<AdminDashboardPageProps, 'getHref'>) {
  return (
    <section className="admin-dashboard__quick" aria-labelledby="admin-quick-title">
      <h2 id="admin-quick-title">관리자 업무 바로가기</h2>
      <ul role="list">
        {quickLinks.map(({ id: section, label, icon, description }) => (
          <li key={section}>
            <a className="admin-quick-link" href={getHref(section)}>
              <span className="admin-quick-link__icon"><Icon name={icon} size={21} /></span>
              <div>
                <h3>{label}</h3>
                <p>{description}</p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function AdminDashboardPage({ state, getHref, getItemsHref, onRetry, demoControl }: AdminDashboardPageProps) {
  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard__heading">
        <h1>관리자 대시보드</h1>
        <p>교내 습득물의 등록 및 수령 처리 현황을 확인하세요.</p>
      </header>
      {demoControl}

      {state.status === 'ready' ? (
        <>
          <section className="admin-dashboard__summary" aria-labelledby="admin-summary-title">
            <div className="admin-dashboard__summary-heading">
              <h2 id="admin-summary-title">습득물 처리 현황</h2>
              <p className="admin-dashboard__total">전체 습득물 <strong>{countFormat.format(state.summary.total)}건</strong></p>
            </div>
            <ul className="admin-dashboard__stats" role="list">
              {ADMIN_ITEM_STATUSES.map((card) => (
                <StatusSummaryCard key={card.status} card={card} count={state.summary.counts[card.status]} href={getItemsHref(card.status)} />
              ))}
            </ul>
            {state.summary.total === 0 && (
              <p className="admin-dashboard__empty" role="status">
                <Icon name="info" size={19} />
                등록된 습득물이 없습니다.
              </p>
            )}
          </section>
          <AdminQuickLinks getHref={getHref} />
        </>
      ) : (
        <AdminDashboardNotice status={state.status} onRetry={onRetry} />
      )}
    </div>
  )
}
