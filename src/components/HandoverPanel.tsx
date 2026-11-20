import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { CATEGORY_LABELS } from '../data/categories'
import type { HandoverAction, HandoverRecord, HandoverSnapshot } from '../types/handover'
import { getHandoverActions, getHandoverReadiness } from '../utils/handover'
import { Hanbi } from './Hanbi'
import { HandoverConfirmDialog } from './HandoverConfirmDialog'
import { HandoverTimeline } from './HandoverTimeline'
import { Icon } from './Icon'
import { KoreanDateTime } from './KoreanDateTime'
import '../styles/handover.css'

interface HandoverPanelProps {
  snapshot: HandoverSnapshot
  clockOffsetMs: number
  backHref: string
  canMutate: boolean
  busy: boolean
  actionError?: string
  demo?: boolean
  buildings?: readonly { id: string; name: string }[]
  controls?: (serverTime: number) => ReactNode
  onReady: (buildingId?: string) => Promise<boolean>
  onReset: () => Promise<boolean>
  onComplete: () => Promise<boolean>
  onExpandedChange?: (expanded: boolean) => void
}

const statusLabels = { WAITING: '이동 대기', PLACE_SET: '장소 확정', DONE: '전달 완료' }
const roleLabels = { finder: '습득자', owner: '확정된 주인' }

function useHandoverClock(handover: HandoverRecord, clockOffsetMs: number, expanded: boolean) {
  const [clientNow, setClientNow] = useState(() => Date.now())
  const { status, finderReadyUntil, ownerReadyUntil } = handover

  useEffect(() => {
    if (!expanded || status === 'DONE') return

    let timer: number | undefined
    const deadlines = [Date.parse(finderReadyUntil ?? ''), Date.parse(ownerReadyUntil ?? '')]

    function tick() {
      window.clearTimeout(timer)
      const now = Date.now()
      setClientNow(now)
      if (document.hidden) return

      const delays = deadlines.map((deadline) => deadline - now - clockOffsetMs).filter((delay) => delay > 0)
      if (delays.length) timer = window.setTimeout(tick, Math.min(1000, ...delays))
    }

    tick()
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [expanded, status, finderReadyUntil, ownerReadyUntil, clockOffsetMs])

  return clientNow + clockOffsetMs
}

function HandoverItemPhoto({ item }: { item: HandoverRecord['item'] }) {
  const [failedSource, setFailedSource] = useState('')
  const source = item.image.trim()

  return (
    <div className="handover-panel__photo">
      {source && source !== failedSource
        ? <img src={source} alt={`${item.name} 대표 사진`} onError={() => setFailedSource(source)} />
        : <span role="img" aria-label="대표 사진 없음"><Icon name="box" size={30} /></span>}
    </div>
  )
}

function ReadinessCard({ role, mine, readyUntil, now }: {
  role: HandoverSnapshot['role']
  mine: boolean
  readyUntil: string | null
  now: number
}) {
  const { status, remainingSeconds } = getHandoverReadiness(readyUntil, now)
  const available = status === 'ready'
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60

  return (
    <div className="handover-party" data-available={available}>
      <h3 className="handover-party__heading">{mine ? '내 상태' : '상대방 상태'} <span className="handover-party__label">{roleLabels[role]}</span></h3>
      <p className="handover-party__status" role="status"><Icon name={available ? 'circle-check' : 'clock'} size={19} />{available ? '이동 가능' : '대기 중'}</p>
      {available && mine && <p className="handover-party__timer" role="timer" aria-label="이동 가능 남은 시간">{minutes}분 {seconds}초 남음</p>}
      {status === 'expired' && <p>이동 가능 시간이 만료되었습니다.</p>}
      {status === 'waiting' && <p>아직 이동 가능 상태가 아닙니다.</p>}
    </div>
  )
}

function HandoverPlace({ handover }: { handover: HandoverRecord }) {
  const { building, placeSetAt } = handover

  return (
    <section className="handover-panel__place" aria-label="추천 전달 장소">
      <h2>{building ? '만날 장소가 정해졌어요!' : '전달 장소'}</h2>
      {building ? (
        <>
          <p className="handover-panel__place-name"><Icon name="map-pin-house" size={27} /><strong>{building.name}</strong></p>
          <p>두 분 모두 {building.name}에서 만나 물품을 전달해 주세요.</p>
        </>
      ) : <p>추천 건물 정보가 아직 없습니다. 잠시 후 다시 확인해 주세요.</p>}
      {placeSetAt && <p className="handover-panel__note">장소 확정 <KoreanDateTime value={placeSetAt} /></p>}
    </section>
  )
}

function HandoverCompletion({ handover, demo }: { handover: HandoverRecord; demo: boolean }) {
  const { building, completedAt } = handover

  return (
    <section className="handover-panel__complete" aria-label="수령완료 정보">
      <div>
        <h2>물품 수령이 완료되었습니다!</h2>
        {demo && <p className="handover-panel__note">시연 화면의 수령완료 결과입니다.</p>}
        <dl>
          <div><dt>물품</dt><dd>{handover.item.name}</dd></div>
          <div><dt>전달 장소</dt><dd>{building?.name ?? '장소 정보 없음'}</dd></div>
          <div><dt>수령완료 일시</dt><dd>{completedAt ? <KoreanDateTime value={completedAt} /> : '일시 정보 없음'}</dd></div>
        </dl>
      </div>
      <Hanbi className="handover-panel__mascot" alt="" compact />
    </section>
  )
}

export function HandoverPanel({
  snapshot, clockOffsetMs, backHref, canMutate, busy, actionError, demo = false, buildings, controls,
  onReady, onReset, onComplete, onExpandedChange,
}: HandoverPanelProps) {
  const titleId = useId()
  const contentId = useId()
  const heading = useRef<HTMLHeadingElement>(null)
  const readyTrigger = useRef<HTMLButtonElement>(null)
  const dialogTrigger = useRef<HTMLButtonElement | null>(null)
  const [expanded, setExpanded] = useState(true)
  const [confirmation, setConfirmation] = useState<HandoverAction>()
  const { handover, role } = snapshot
  const { item, status, finderReadyUntil, ownerReadyUntil } = handover
  const now = useHandoverClock(handover, clockOffsetMs, expanded)
  const actions = getHandoverActions(snapshot, now)
  const isOwner = role === 'owner'
  const isDone = status === 'DONE'
  const isWaiting = status === 'WAITING'
  const myReadyUntil = isOwner ? ownerReadyUntil : finderReadyUntil
  const partnerReadyUntil = isOwner ? finderReadyUntil : ownerReadyUntil
  const bothAvailable = [myReadyUntil, partnerReadyUntil].every((deadline) => getHandoverReadiness(deadline, now).status === 'ready')

  function openConfirmation(action: HandoverAction, trigger: HTMLButtonElement | null) {
    dialogTrigger.current = trigger
    setConfirmation(action)
  }

  function closeConfirmation() {
    setConfirmation(undefined)
    const trigger = dialogTrigger.current
    dialogTrigger.current = null
    requestAnimationFrame(() => {
      if (trigger?.isConnected && !trigger.disabled) trigger.focus({ preventScroll: true })
      else heading.current?.focus({ preventScroll: true })
    })
  }

  function submitReadiness(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!actions.ready || !canMutate || busy) return
    if (!demo) {
      openConfirmation('ready', readyTrigger.current)
      return
    }

    const buildingId = new FormData(event.currentTarget).get('buildingId')
    if (typeof buildingId === 'string' && buildings?.some(({ id }) => id === buildingId)) void onReady(buildingId)
  }

  return (
    <section className="handover-panel" aria-labelledby={titleId} data-status={status}>
      <header className="handover-panel__heading">
        <div>
          <h1 id={titleId} ref={heading} tabIndex={-1}>전달 진행</h1>
          <p className="handover-panel__note">{roleLabels[role]} 화면</p>
        </div>
        <span className="handover-panel__badge" data-status={status}><span className="sr-only">전달 상태 </span>{statusLabels[status]}</span>
        <button
          className="secondary-link handover-panel__toggle"
          type="button"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={() => {
            setExpanded(!expanded)
            onExpandedChange?.(!expanded)
          }}
        >{expanded ? '접기' : '펼치기'} <Icon name="chevron-down" size={16} /></button>
      </header>

      {controls && <div className="handover-panel__controls">{controls(now)}</div>}

      <div className="handover-panel__content" id={contentId} hidden={!expanded}>
        <div className="handover-panel__item">
          <HandoverItemPhoto item={item} />
          <div className="handover-panel__item-content">
            <h2>{item.name}</h2>
            <div className="handover-panel__badges">
              <span>{CATEGORY_LABELS[item.category]}</span>
              <span className="handover-panel__badge" data-status={item.status}><span className="sr-only">습득물 상태 </span>{item.status === 'CLAIMED' ? '수령완료' : '수령대기'}</span>
            </div>
            <p><Icon name="map-pin" size={17} /><span><span className="sr-only">습득 건물 </span>{item.building}</span></p>
          </div>
        </div>

        <section className="handover-panel__progress" aria-label="전달 진행 단계">
          <HandoverTimeline status={status} hasPlace={Boolean(handover.building || handover.placeSetAt)} />
        </section>

        {status === 'PLACE_SET' && <HandoverPlace handover={handover} />}
        {!isDone && (
          <section className="handover-panel__parties" aria-label="이동 가능 상태">
            <h2 className="sr-only">이동 가능 상태</h2>
            <ReadinessCard mine role={role} readyUntil={myReadyUntil} now={now} />
            <ReadinessCard mine={false} role={isOwner ? 'finder' : 'owner'} readyUntil={partnerReadyUntil} now={now} />
          </section>
        )}
        {isDone && <HandoverCompletion handover={handover} demo={demo} />}

        {actionError && !confirmation && <p className="handover-panel__issue" role="alert">{actionError}</p>}
        {!canMutate && !isDone && <p className="handover-panel__note">최신 전달 상태를 확인한 뒤 진행할 수 있습니다.</p>}
        {isWaiting && bothAvailable && <p className="handover-panel__note" role="status">두 사람 모두 이동할 수 있습니다. 추천 장소를 기다리고 있어요.</p>}

        {!isDone && (
          <div className="handover-panel__actions">
            {isWaiting && (
              <form key={role} className="handover-panel__ready" onSubmit={submitReadiness}>
                {demo && (
                  <label className="handover-panel__picker">
                    현재 위치 (시연용)
                    <select name="buildingId" defaultValue="" required disabled={!canMutate || busy || !actions.ready}>
                      <option value="">건물 선택</option>
                      {buildings?.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
                    </select>
                  </label>
                )}
                <button type="submit" className="primary-link" ref={readyTrigger} aria-haspopup={demo ? undefined : 'dialog'} disabled={!canMutate || busy || !actions.ready}>
                  <Icon name="map-pin" size={19} /> 지금 이동 가능
                </button>
              </form>
            )}
            {actions.reset && (
              <button type="button" className="secondary-link" aria-haspopup="dialog" disabled={!canMutate || busy} onClick={(event) => openConfirmation('reset', event.currentTarget)}>다시 정하기</button>
            )}
            {actions.complete && (
              <button type="button" className={isWaiting ? 'secondary-link' : 'primary-link'} aria-haspopup="dialog" disabled={!canMutate || busy} onClick={(event) => openConfirmation('complete', event.currentTarget)}>받았어요</button>
            )}
          </div>
        )}
        <a className={isDone ? 'primary-link' : 'back-link'} href={backHref}><Icon name="arrow-left" size={17} /> 마이페이지로 돌아가기</a>
      </div>

      {confirmation && (
        <HandoverConfirmDialog
          key={confirmation}
          action={confirmation}
          demo={demo}
          busy={busy}
          allowed={canMutate && actions[confirmation]}
          error={actionError}
          onConfirm={confirmation === 'ready' ? () => onReady() : confirmation === 'reset' ? onReset : onComplete}
          onClose={closeConfirmation}
        />
      )}
    </section>
  )
}
