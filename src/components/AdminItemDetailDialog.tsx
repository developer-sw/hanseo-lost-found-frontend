import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { ADMIN_ITEM_STATUSES } from '../data/adminItemStatuses'
import { CATEGORY_LABELS } from '../data/categories'
import type { AdminFoundItem, AdminFoundItemDetail, AdminItemDetailResult } from '../types/adminItems'
import { Icon } from './Icon'
import { KoreanDateTime } from './KoreanDateTime'
import '../styles/admin-item-detail.css'

interface AdminItemDetailDialogProps {
  itemId: string
  loadDetail: (id: string) => Promise<AdminItemDetailResult>
  getAction?: (item: AdminFoundItem) => { href: string; label: string } | undefined
  onClose: () => void
}

type DetailNoticeStatus = 'loading' | Exclude<AdminItemDetailResult['status'], 'ready'>

const detailMessages: Record<DetailNoticeStatus, { title: string; description: string }> = {
  loading: { title: '습득물 정보를 불러오는 중입니다.', description: '잠시만 기다려 주세요.' },
  'not-found': { title: '습득물을 찾을 수 없습니다.', description: '목록으로 돌아가 현재 등록된 물품을 확인해 주세요.' },
  'sign-in-required': { title: '관리자 로그인이 필요합니다.', description: '관리자 계정으로 로그인한 뒤 다시 열어 주세요.' },
  expired: { title: '관리자 인증이 만료되었습니다.', description: '다시 로그인한 뒤 조회해 주세요.' },
  forbidden: { title: '습득물 관리 정보를 조회할 권한이 없습니다.', description: '조회 권한이 있는 관리자 계정을 사용해 주세요.' },
  unavailable: { title: '습득물 상세 조회 API가 연결되지 않았습니다.', description: '서버 연동 후 실제 물품 정보를 확인할 수 있습니다.' },
  error: { title: '습득물 정보를 불러오지 못했습니다.', description: '잠시 후 다시 시도해 주세요.' },
}

function AdminItemDetail({ item }: { item: AdminFoundItemDetail }) {
  const [failedImage, setFailedImage] = useState<string>()
  const status = ADMIN_ITEM_STATUSES.find((entry) => entry.status === item.status)
  const image = item.image?.trim()

  return (
    <div className="admin-item-detail__item">
      <div className="admin-item-detail__photo">
        {image && failedImage !== image ? (
          <img src={image} alt={`${item.name} 대표 사진`} onError={() => setFailedImage(image)} />
        ) : (
          <div className="admin-item-detail__photo-empty">
            <Icon name="box" size={34} />
            <p>{image ? '사진을 불러오지 못했습니다.' : '등록된 사진이 없습니다.'}</p>
          </div>
        )}
      </div>

      <div className="admin-item-detail__information">
        <span className="admin-item-detail__category">{CATEGORY_LABELS[item.category]}</span>
        <h3>{item.name}</h3>
        {status && (
          <span className="admin-item-detail__status" data-status={item.status}>
            <Icon name={status.icon} size={16} />
            <span className="sr-only">현재 상태 </span>{status.label}
          </span>
        )}

        <dl className="admin-item-detail__facts">
          <div><dt>습득 건물</dt><dd>{item.building}</dd></div>
          {item.locationDetail && <div><dt>세부 위치</dt><dd>{item.locationDetail}</dd></div>}
          <div><dt>습득 일시</dt><dd><KoreanDateTime value={item.foundAt} /></dd></div>
          <div><dt>등록일</dt><dd><KoreanDateTime value={item.registeredAt} /></dd></div>
        </dl>

        {item.description && (
          <div className="admin-item-detail__description">
            <h4>물품 설명</h4>
            <p>{item.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function AdminItemDetailDialog({ itemId, loadDetail, getAction, onClose }: AdminItemDetailDialogProps) {
  const headingId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const headerCloseRef = useRef<HTMLButtonElement>(null)
  const [result, setResult] = useState<{ itemId: string; detail: AdminItemDetailResult } | null>(null)
  const [attempt, setAttempt] = useState(0)
  const detail = result?.itemId === itemId ? result.detail : { status: 'loading' } as const

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
    headerCloseRef.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const itemDetail = await loadDetail(itemId)
        if (active) setResult({ itemId, detail: itemDetail })
      } catch {
        if (active) setResult({ itemId, detail: { status: 'error' } })
      }
    }

    void load()
    return () => { active = false }
  }, [itemId, loadDetail, attempt])

  function closeDialog() {
    dialogRef.current?.close()
  }

  function keepTabFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return

    const controls = event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]')
    const first = controls[0]
    const last = controls[controls.length - 1]
    const current = event.shiftKey ? first : last
    const next = event.shiftKey ? last : first

    if (next && event.target === current) {
      event.preventDefault()
      next.focus()
    }
  }

  function retry() {
    headerCloseRef.current?.focus({ preventScroll: true })
    setResult(null)
    setAttempt((current) => current + 1)
  }

  const action = detail.status === 'ready' ? getAction?.(detail.item) : undefined
  const notice = detail.status === 'ready' ? undefined : detailMessages[detail.status]

  return (
    <dialog className="admin-item-detail" ref={dialogRef} aria-modal="true" aria-labelledby={headingId} onClose={onClose} onKeyDown={keepTabFocus}>
      <header className="admin-item-detail__header">
        <h2 id={headingId}>습득물 상세 정보</h2>
        <button type="button" className="admin-item-detail__close" ref={headerCloseRef} aria-label="습득물 상세 닫기" onClick={closeDialog}>
          <Icon name="x" size={22} />
        </button>
      </header>

      <div className="admin-item-detail__body" aria-busy={detail.status === 'loading'}>
        {detail.status === 'ready' && <AdminItemDetail key={detail.item.id} item={detail.item} />}
        {notice && (
          <div className="admin-item-detail__notice" role="status">
            <Icon name={detail.status === 'loading' ? 'clock' : 'info'} size={28} />
            <h3>{notice.title}</h3>
            <p>{notice.description}</p>
            {detail.status === 'error' && <button type="button" className="secondary-link" onClick={retry}>다시 시도</button>}
          </div>
        )}
      </div>

      <footer className="admin-item-detail__actions">
        <button type="button" className="secondary-link" onClick={closeDialog}>닫기</button>
        {action && <a className="primary-link" href={action.href}>{action.label}</a>}
      </footer>
    </dialog>
  )
}
