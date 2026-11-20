import { useRef, useState, type ReactNode } from 'react'
import { AdminItemDetailDialog } from '../components/AdminItemDetailDialog'
import { Icon } from '../components/Icon'
import { KoreanDateTime } from '../components/KoreanDateTime'
import { ADMIN_ITEM_STATUSES } from '../data/adminItemStatuses'
import { CATEGORY_LABELS } from '../data/categories'
import type { AdminFoundItem, AdminItemDetailResult, AdminItemsResult, AdminItemStatusFilter } from '../types/adminItems'
import { AdminDashboardNotice } from './AdminDashboardPage'
import '../styles/admin-items.css'

interface AdminItemsPageProps {
  state: AdminItemsResult | { status: 'loading' }
  filter: AdminItemStatusFilter
  getFilterHref: (filter: AdminItemStatusFilter) => string
  getAction: (item: AdminFoundItem) => { href: string; label: string } | undefined
  loadDetail: (id: string) => Promise<AdminItemDetailResult>
  onRetry: () => void
  demoControl?: ReactNode
}

const countFormat = new Intl.NumberFormat('ko-KR')
const filters = [{ status: 'all', label: '전체' }, ...ADMIN_ITEM_STATUSES] as const
const columns = [
  { className: 'identity', label: '습득물' },
  { className: 'location', label: '습득 장소' },
  { className: 'found-at', label: '습득 일시' },
  { className: 'registered-at', label: '등록일' },
  { className: 'status', label: '상태' },
  { className: 'actions', label: '관리' },
]

function AdminItemThumbnail({ item }: { item: AdminFoundItem }) {
  const [failedImage, setFailedImage] = useState('')

  return item.image && item.image !== failedImage
    ? <img className="admin-items-table__photo" src={item.image} alt={`${item.name} 사진`} loading="lazy" onError={() => setFailedImage(item.image)} />
    : <span className="admin-items-table__photo admin-items-table__photo--empty" role="img" aria-label="대표 사진 없음"><Icon name="box" size={24} /></span>
}

export function AdminItemsPage({ state, filter, getFilterHref, getAction, loadDetail, onRetry, demoControl }: AdminItemsPageProps) {
  const [selectedId, setSelectedId] = useState<string>()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const readyState = state.status === 'ready' ? state : undefined

  function closeDetail() {
    setSelectedId(undefined)
    triggerRef.current?.focus()
    triggerRef.current = null
  }

  return (
    <div className="admin-items">
      <header className="admin-items__heading admin-dashboard__heading">
        <div>
          <h1>습득물 관리</h1>
          <p>교내에 등록된 습득물을 조회하고 처리 상태를 확인하세요.</p>
        </div>
        {readyState && <p className="admin-dashboard__total" role="status">조회 결과 <strong>{countFormat.format(readyState.items.length)}건</strong></p>}
      </header>

      {demoControl}

      <nav className="admin-items__filters" aria-label="습득물 상태 필터">
        <ul role="list">
          {filters.map(({ status, label }) => {
            const count = status === 'all' ? readyState?.summary.total : readyState?.summary.counts[status]

            return (
              <li key={status}>
                <a href={getFilterHref(status)} aria-current={filter === status ? 'page' : undefined}>
                  <span>{label}</span>
                  {count !== undefined && <span className="admin-items__filter-count">{countFormat.format(count)}<span className="sr-only">건</span></span>}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>

      {state.status !== 'ready' ? (
        <AdminDashboardNotice status={state.status} onRetry={onRetry} resource="items" />
      ) : state.items.length === 0 ? (
        <div className="admin-items__empty" role="status">
          <span className="admin-items__empty-icon"><Icon name="box" size={24} /></span>
          <p>{filter === 'all' ? '등록된 습득물이 없습니다.' : '해당 상태의 습득물이 없습니다.'}</p>
        </div>
      ) : (
        <table className="admin-items-table" role="table" aria-label="관리자 습득물 목록">
          <colgroup>
            {columns.map(({ className }) => <col key={className} className={`admin-items-table__col--${className}`} />)}
          </colgroup>
          <thead role="rowgroup">
            <tr role="row">
              {columns.map(({ className, label }) => <th key={className} scope="col" role="columnheader">{label}</th>)}
            </tr>
          </thead>
          <tbody role="rowgroup">
            {state.items.map((item) => {
              const status = ADMIN_ITEM_STATUSES.find(({ status }) => status === item.status)
              const action = getAction(item)

              return (
                <tr key={item.id} role="row">
                  <th className="admin-items-table__identity" scope="row" role="rowheader">
                    <div className="admin-items-table__item">
                      <AdminItemThumbnail item={item} />
                      <div>
                        <strong>{item.name}</strong>
                        <p>{CATEGORY_LABELS[item.category]}</p>
                      </div>
                    </div>
                  </th>
                  <td className="admin-items-table__location" role="cell">
                    <span className="admin-items-table__mobile-label" aria-hidden="true">습득 장소</span>
                    <p>{item.building}</p>
                    {item.locationDetail && <p className="admin-items-table__location-detail">{item.locationDetail}</p>}
                  </td>
                  <td className="admin-items-table__found-at" role="cell">
                    <span className="admin-items-table__mobile-label" aria-hidden="true">습득 일시</span>
                    <KoreanDateTime value={item.foundAt} />
                  </td>
                  <td className="admin-items-table__registered-at" role="cell">
                    <span className="admin-items-table__mobile-label" aria-hidden="true">등록일</span>
                    <KoreanDateTime value={item.registeredAt} />
                  </td>
                  <td className="admin-items-table__status" role="cell">
                    <span className="admin-items-table__badge" data-status={item.status}>
                      <Icon name={status?.icon ?? 'info'} size={15} />
                      {status?.label ?? item.status}
                    </span>
                  </td>
                  <td className="admin-items-table__actions" role="cell">
                    <div className="admin-items-table__actions-inner">
                      <button
                        className="secondary-link"
                        type="button"
                        aria-haspopup="dialog"
                        onClick={(event) => {
                          triggerRef.current = event.currentTarget
                          setSelectedId(item.id)
                        }}
                      >상세보기</button>
                      {action && <a href={action.href} className="primary-link">{action.label}</a>}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {selectedId && (
        <AdminItemDetailDialog itemId={selectedId} loadDetail={loadDetail} getAction={getAction} onClose={closeDetail} />
      )}
    </div>
  )
}
