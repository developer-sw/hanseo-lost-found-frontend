import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { CATEGORY_LABELS } from '../data/categories'
import type { AdminHandover, AdminHandoverDetailResult, HandoverStatus } from '../types/adminHandovers'
import { AdminHandoverBadge, AdminHandoverItemStatus, AdminHandoverOwner, AdminHandoverPhoto, AdminHandoverPlace, AdminHandoverReceipt } from './AdminHandoverCard'
import { AdminHandoverNotice } from './AdminHandoverNotice'
import { Icon } from './Icon'
import { KoreanDateTime } from './KoreanDateTime'

type DetailState = AdminHandoverDetailResult | { status: 'loading' }
type StepState = 'complete' | 'current' | 'upcoming'

const steps = ['주인 확정', '이동 대기', '장소 확정', '수령완료'] as const
const stepStates: Record<HandoverStatus, readonly StepState[]> = {
  WAITING: ['complete', 'current', 'upcoming', 'upcoming'],
  PLACE_SET: ['complete', 'complete', 'complete', 'upcoming'],
  DONE: ['complete', 'complete', 'complete', 'complete'],
}
const stepLabels: Record<StepState, string> = { complete: '완료', current: '진행 중', upcoming: '미완료' }

function AdminHandoverTimeline({ status }: { status: HandoverStatus }) {
  return (
    <ol className="admin-handover-timeline" aria-label="전달 단계" role="list">
      {steps.map((label, index) => {
        const state = stepStates[status][index]
        return (
          <li key={label} data-state={state} aria-current={state === 'current' ? 'step' : undefined}>
            <span className="admin-handover-timeline__marker" aria-hidden="true">
              {state === 'complete' ? <Icon name="circle-check" size={18} /> : index + 1}
            </span>
            <strong>{label}</strong>
            <span className="admin-handover-timeline__state">{stepLabels[state]}</span>
          </li>
        )
      })}
    </ol>
  )
}

function readinessEnd(value: string | null | undefined) {
  if (value === null) return 0
  const end = value === undefined ? NaN : Date.parse(value)
  return Number.isFinite(end) ? end : undefined
}

function AdminHandoverReadiness({ handover }: { handover: AdminHandover }) {
  const finderUntil = readinessEnd(handover.finderReadyUntil)
  const ownerUntil = readinessEnd(handover.ownerReadyUntil)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (finderUntil === undefined && ownerUntil === undefined) return
    let timer: number | undefined

    function update() {
      const current = Date.now()
      setNow(current)
      const nextEnd = Math.min(...[finderUntil ?? 0, ownerUntil ?? 0].filter((end) => end > current))
      if (Number.isFinite(nextEnd)) timer = window.setTimeout(update, Math.min(nextEnd - current, 2_147_483_647))
    }

    update()
    return () => window.clearTimeout(timer)
  }, [finderUntil, ownerUntil])

  if (finderUntil === undefined && ownerUntil === undefined) return null

  return (
    <section className="admin-handover-detail__section" aria-label="이동 가능 여부">
      <h3>이동 가능 여부</h3>
      <dl className="admin-handover-detail__facts">
        {finderUntil !== undefined && <div><dt>습득자</dt><dd>{finderUntil > now ? '이동 가능' : '대기 중'}</dd></div>}
        {ownerUntil !== undefined && <div><dt>확정된 주인</dt><dd>{ownerUntil > now ? '이동 가능' : '대기 중'}</dd></div>}
      </dl>
    </section>
  )
}

function AdminHandoverDetail({ handover }: { handover: AdminHandover }) {
  const { item, claim, status, source } = handover

  return (
    <div className="admin-handover-detail">
      {source && (
        <p className="admin-handovers__preview">
          <Icon name="info" size={18} />
          {source === 'preview' ? 'A3 주인 확정 시뮬레이션의 예상 전달 정보입니다.' : 'A4 장소 확정 상태를 보여 주는 별도 데모 예시입니다.'}
        </p>
      )}
      <section className="admin-handover-detail__item" aria-label="습득물 정보">
        <AdminHandoverPhoto item={item} detail />
        <div>
          <h3>{item.name}</h3>
          <p className="admin-handover-card__tags">
            <span>{CATEGORY_LABELS[item.category]}</span>
            <AdminHandoverItemStatus status={item.status} />
          </p>
          <dl className="admin-handover-detail__facts">
            <div><dt>습득 건물</dt><dd>{item.building}</dd></div>
            {item.locationDetail && <div><dt>세부 위치</dt><dd>{item.locationDetail}</dd></div>}
            <div><dt>습득 일시</dt><dd><KoreanDateTime value={item.foundAt} /></dd></div>
          </dl>
        </div>
      </section>
      <section className="admin-handover-detail__journey" aria-label="전달 진행 단계">
        <div className="admin-handover-detail__heading">
          <h3>전달 진행 단계</h3>
          <AdminHandoverBadge status={status} />
        </div>
        <AdminHandoverTimeline status={status} />
      </section>
      <div className="admin-handover-dialog__sections">
        <section className="admin-handover-detail__section" aria-label="주인 확정 정보">
          <h3>주인 확정 정보</h3>
          <dl className="admin-handover-detail__facts"><AdminHandoverOwner claim={claim} /></dl>
        </section>
        <section className="admin-handover-detail__section" aria-label="전달 장소">
          <h3>전달 장소</h3>
          <dl className="admin-handover-detail__facts"><AdminHandoverPlace handover={handover} /></dl>
        </section>
        <section className="admin-handover-detail__section" aria-label="수령 확인">
          <h3>수령 확인</h3>
          <dl className="admin-handover-detail__facts"><AdminHandoverReceipt handover={handover} /></dl>
          {status === 'DONE' && <p className="admin-handover-detail__receipt-note">수령이 완료된 물품입니다.</p>}
        </section>
        {status !== 'DONE' && <AdminHandoverReadiness handover={handover} />}
      </div>
    </div>
  )
}

export function AdminHandoverDetailDialog({ handoverId, loadDetail, onClose }: {
  handoverId: string
  loadDetail: (id: string) => Promise<AdminHandoverDetailResult>
  onClose: () => void
}) {
  const headingId = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  const headerClose = useRef<HTMLButtonElement>(null)
  const footerClose = useRef<HTMLButtonElement>(null)
  const [detail, setDetail] = useState<DetailState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (dialog.current && !dialog.current.open) dialog.current.showModal()
    headerClose.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const response = await loadDetail(handoverId)
        if (active) setDetail(response.status === 'ready' && response.handover.handoverId !== handoverId ? { status: 'not-found' } : response)
      } catch {
        if (active) setDetail({ status: 'error' })
      }
    }

    void load()
    return () => { active = false }
  }, [handoverId, loadDetail, attempt])

  function closeDialog() {
    dialog.current?.close()
    onClose()
  }

  function handleKeys(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === 'Escape') event.stopPropagation()
    if (event.key !== 'Tab') return

    const edge = event.shiftKey ? headerClose : footerClose
    const opposite = event.shiftKey ? footerClose : headerClose
    if (event.target !== edge.current) return

    event.preventDefault()
    opposite.current?.focus()
  }

  function retry() {
    headerClose.current?.focus({ preventScroll: true })
    setDetail({ status: 'loading' })
    setAttempt((value) => value + 1)
  }

  return (
    <dialog
      className="admin-handover-dialog"
      ref={dialog}
      aria-modal="true"
      aria-labelledby={headingId}
      onKeyDown={handleKeys}
      onCancel={(event) => {
        event.preventDefault()
        closeDialog()
      }}
    >
      <header className="admin-handover-dialog__header">
        <h2 id={headingId}>전달 진행 상세 정보</h2>
        <button type="button" className="admin-handover-dialog__close" ref={headerClose} aria-label="전달 진행 상세 닫기" onClick={closeDialog}>
          <Icon name="x" size={22} />
        </button>
      </header>
      <div className="admin-handover-dialog__body" aria-busy={detail.status === 'loading'}>
        {detail.status === 'ready'
          ? <AdminHandoverDetail handover={detail.handover} />
          : <AdminHandoverNotice status={detail.status} onRetry={retry} detail />}
      </div>
      <footer className="admin-handover-dialog__actions">
        <button type="button" className="secondary-link" ref={footerClose} onClick={closeDialog}>닫기</button>
      </footer>
    </dialog>
  )
}
