import { useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { AdminHandoverCard } from '../components/AdminHandoverCard'
import { AdminHandoverDetailDialog } from '../components/AdminHandoverDetailDialog'
import { AdminHandoverNotice } from '../components/AdminHandoverNotice'
import { Icon, type IconName } from '../components/Icon'
import type { AdminHandoverDetailResult, AdminHandoverFilter, AdminHandoversResult } from '../types/adminHandovers'
import '../styles/admin-handovers.css'

interface AdminHandoversPageProps {
  state: AdminHandoversResult | { status: 'loading' }
  filter: AdminHandoverFilter
  getFilterHref: (filter: AdminHandoverFilter) => string
  loadDetail: (id: string) => Promise<AdminHandoverDetailResult>
  onRefresh: () => void
  demoControl?: ReactNode
}

const stats = [
  { key: 'ongoing', label: '전달 진행 중', icon: 'clock' },
  { key: 'placeSet', label: '장소 확정', icon: 'map-pin' },
  { key: 'done', label: '수령완료', icon: 'circle-check' },
] as const satisfies readonly { key: string; label: string; icon: IconName }[]

const filters = [
  { value: 'all', label: '전체' },
  { value: 'ongoing', label: '전달 진행 중' },
  { value: 'WAITING', label: '이동 대기' },
  { value: 'PLACE_SET', label: '장소 확정' },
  { value: 'DONE', label: '수령완료' },
] as const satisfies readonly { value: AdminHandoverFilter; label: string }[]

const numberFormat = new Intl.NumberFormat('ko-KR')

export function AdminHandoversPage({ state, filter, getFilterHref, loadDetail, onRefresh, demoControl }: AdminHandoversPageProps) {
  const [selection, setSelection] = useState<string | null>()
  const trigger = useRef<HTMLButtonElement>(null)
  const listHeading = useRef<HTMLHeadingElement>(null)
  const ready = state.status === 'ready' ? state : undefined
  const selectedId = selection === undefined ? ready?.selectedId : selection
  const hasPreview = ready?.items.some(({ source }) => source === 'preview')

  function openDetail(event: MouseEvent<HTMLButtonElement>, handoverId: string) {
    trigger.current = event.currentTarget
    setSelection(handoverId)
  }

  function closeDetail() {
    const previousFocus = trigger.current
    trigger.current = null
    setSelection(null)
    if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
    else listHeading.current?.focus({ preventScroll: true })
  }

  return (
    <div className="admin-handovers">
      <header className="admin-handovers__heading admin-dashboard__heading">
        <div>
          <h1>전달 진행 현황</h1>
          <p>주인이 확정된 습득물의 전달 상태와 수령 완료 여부를 확인하세요.</p>
        </div>
        <button className="secondary-link" type="button" onClick={onRefresh} disabled={state.status === 'loading'}>새로고침</button>
      </header>

      <p className="admin-handovers__read-only">
        <Icon name="info" size={19} />
        <span>관리자는 진행 상황을 조회합니다. 전달은 두 학생이 직접 진행하며, 주인으로 확정된 학생이 수령을 확인합니다.</span>
      </p>
      {demoControl}

      {ready && (
        <section className="admin-handovers__summary" aria-labelledby="admin-handover-summary-title">
          <h2 id="admin-handover-summary-title">전달 현황 요약</h2>
          <ul className="admin-handovers__stats" role="list">
            {stats.map(({ key, label, icon }) => (
              <li className="admin-handover-stat" data-stat={key} key={key}>
                <span className="admin-handover-stat__icon"><Icon name={icon} size={22} /></span>
                <span className="admin-handover-stat__label">{label}</span>
                <strong className="admin-handover-stat__count">{numberFormat.format(ready.summary[key])}<span>건</span></strong>
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasPreview && (
        <p className="admin-handovers__preview">
          <Icon name="info" size={19} />
          <span>A3 주인 확정 예상 결과를 함께 표시합니다. 위 요약은 A4 기본 데모 목록의 집계입니다.</span>
        </p>
      )}

      <nav className="admin-handovers__filters admin-items__filters" aria-label="전달 상태 필터">
        <ul role="list">
          {filters.map(({ value, label }) => (
            <li key={value}><a href={getFilterHref(value)} aria-current={filter === value ? 'page' : undefined}>{label}</a></li>
          ))}
        </ul>
      </nav>

      {state.status !== 'ready' ? (
        <AdminHandoverNotice status={state.status} allHref={getFilterHref('all')} onRetry={onRefresh} />
      ) : (
        <section aria-labelledby="admin-handover-list-title">
          <div className="admin-handovers__overview">
            <h2 ref={listHeading} tabIndex={-1} id="admin-handover-list-title">전달 목록</h2>
            <p className="admin-dashboard__total" role="status">조회 결과 <strong>{numberFormat.format(state.items.length)}건</strong></p>
          </div>
          {state.items.length === 0 ? (
            <div className="admin-dashboard-notice" role="status">
              <span className="admin-dashboard-notice__icon"><Icon name="box" size={24} /></span>
              <p>{filter === 'all' || (state.summary.ongoing === 0 && state.summary.done === 0) ? '조회할 전달 건이 없습니다.' : '해당 상태의 전달 건이 없습니다.'}</p>
            </div>
          ) : (
            <ul className="admin-handovers__list" role="list">
              {state.items.map((handover) => <li key={handover.handoverId}><AdminHandoverCard handover={handover} onDetail={openDetail} /></li>)}
            </ul>
          )}
        </section>
      )}

      {ready && selectedId && <AdminHandoverDetailDialog key={selectedId} handoverId={selectedId} loadDetail={loadDetail} onClose={closeDetail} />}
    </div>
  )
}
