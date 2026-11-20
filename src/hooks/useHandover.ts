import { useEffect, useMemo, useRef, useState } from 'react'
import { requestHandoverLocation } from '../services/handoverLocation'
import { handoverService } from '../services/handovers'
import type {
  HandoverAction,
  HandoverActionError,
  HandoverLocationFailure,
  HandoverReadyInput,
  HandoverResult,
  HandoverService,
  HandoverSnapshot,
  HandoverViewState,
} from '../types/handover'
import { getHandoverActions, HANDOVER_POLL_INTERVAL_MS } from '../utils/handover'

interface HandoverScope {
  handoverId: string
  service: HandoverService
  enabled: boolean
}

interface HandoverView {
  scope: HandoverScope
  state: HandoverViewState
  clockOffsetMs: number
}

interface HandoverOperation {
  scope: HandoverScope
  busy: HandoverAction | null
  error: HandoverActionError | null
}

interface HandoverController {
  scope: HandoverScope
  refresh(): void
  mutate(action: HandoverAction, input?: HandoverReadyInput): Promise<boolean>
}

function validateResult(handoverId: string, result: HandoverResult): HandoverResult {
  if (result.status !== 'ready') return result
  const { handover, role } = result.snapshot
  if (handover.handoverId !== handoverId) return { status: 'not-found' }
  if (role !== 'finder' && role !== 'owner') return { status: 'forbidden' }
  const validRecord = handover.status === 'DONE'
    ? handover.item.status === 'CLAIMED' && handover.claimStatus === 'COMPLETED'
    : (handover.status === 'WAITING' || handover.status === 'PLACE_SET')
      && handover.item.status === 'AWAITING_PICKUP' && handover.claimStatus === 'APPROVED'
  if (!validRecord) return { status: 'not-found' }
  return result
}

function preventsViewing(status: HandoverActionError['status']): status is 'sign-in-required' | 'expired' | 'forbidden' | 'not-found' {
  return status === 'sign-in-required' || status === 'expired' || status === 'forbidden' || status === 'not-found'
}

/** Provides a single read/write stream for a server-backed participant panel. */
export function useHandover(handoverId: string, service: HandoverService = handoverService, enabled = true) {
  const scope = useMemo(() => ({ handoverId, service, enabled }), [handoverId, service, enabled])
  const [view, setView] = useState<HandoverView>()
  const [operation, setOperation] = useState<HandoverOperation>()
  const controller = useRef<HandoverController | null>(null)

  useEffect(() => {
    const { handoverId, service, enabled } = scope
    if (!enabled || !service.connected) return

    const lifetime = new AbortController()
    const { signal } = lifetime
    let latest: HandoverSnapshot | undefined
    let clockOffsetMs = 0
    let pendingRead: Promise<void> | undefined
    let activeAction: HandoverAction | null = null
    let revalidateWhenIdle = false
    let pollTimer: number | undefined

    function cancelTimer() {
      if (pollTimer !== undefined) window.clearTimeout(pollTimer)
      pollTimer = undefined
    }

    function publish(result: HandoverResult) {
      const checked = validateResult(handoverId, result)
      latest = checked.status === 'ready' ? checked.snapshot : undefined
      const serverNowMs = latest ? Date.parse(latest.serverNow) : Number.NaN
      clockOffsetMs = Number.isFinite(serverNowMs) ? serverNowMs - Date.now() : 0
      setView({ scope, state: checked, clockOffsetMs })
      return checked
    }

    function schedule() {
      cancelTimer()
      if (signal.aborted || document.hidden || activeAction || !latest || latest.handover.status === 'DONE') return
      pollTimer = window.setTimeout(() => { void reload() }, HANDOVER_POLL_INTERVAL_MS)
    }

    function finishCycle() {
      if (signal.aborted || document.hidden || pendingRead || activeAction) return
      if (revalidateWhenIdle) {
        revalidateWhenIdle = false
        if (latest?.handover.status !== 'DONE') {
          void reload()
          return
        }
      }
      schedule()
    }

    function reload() {
      cancelTimer()
      if (signal.aborted || document.hidden || activeAction) return
      if (pendingRead) return pendingRead

      pendingRead = Promise.resolve().then(() => signal.aborted ? undefined : service.getById(handoverId, signal)).then(
        (result) => { if (!signal.aborted && result) publish(result) },
        () => { if (!signal.aborted) publish({ status: 'network-error' }) },
      ).finally(() => {
        pendingRead = undefined
        finishCycle()
      })
      return pendingRead
    }

    async function request(action: HandoverAction, input?: HandoverReadyInput): Promise<HandoverResult | HandoverLocationFailure> {
      if (action === 'reset') return service.resetPlace(handoverId, signal)
      if (action === 'complete') return service.complete(handoverId, signal)
      if (input) return service.setReady(handoverId, input, signal)

      const location = await requestHandoverLocation(signal)
      if (location.status !== 'ready') return location
      if (signal.aborted) return { status: 'aborted' }
      return service.setReady(handoverId, location.input, signal)
    }

    async function mutate(action: HandoverAction, input?: HandoverReadyInput) {
      if (signal.aborted || document.hidden || activeAction || !latest) return false
      activeAction = action
      cancelTimer()
      setOperation({ scope, busy: action, error: null })

      try {
        await pendingRead
        if (signal.aborted || document.hidden) return false
        if (!latest || !getHandoverActions(latest, Date.now() + clockOffsetMs)[action]) {
          setOperation({ scope, busy: action, error: { status: 'conflict' } })
          return false
        }

        const result = await request(action, input)
        if (signal.aborted) return false
        if (result.status === 'ready') return publish(result).status === 'ready'
        if (preventsViewing(result.status)) {
          // A revoked or missing record must disappear as soon as the server rejects access.
          publish({ status: result.status })
        }
        if (result.status === 'conflict') revalidateWhenIdle = true
        setOperation({ scope, busy: action, error: result })
        return false
      } catch {
        if (!signal.aborted) setOperation({ scope, busy: action, error: { status: 'network-error' } })
        return false
      } finally {
        activeAction = null
        if (!signal.aborted) {
          setOperation((previous) => previous?.scope === scope ? { ...previous, busy: null } : previous)
          finishCycle()
        }
      }
    }

    function handleVisibility() {
      if (document.hidden) cancelTimer()
      else if (latest?.handover.status !== 'DONE') {
        revalidateWhenIdle = true
        finishCycle()
      }
    }

    controller.current = {
      scope,
      refresh() {
        if (activeAction) return
        setOperation(undefined)
        void reload()
      },
      mutate,
    }
    document.addEventListener('visibilitychange', handleVisibility)
    void reload()

    return () => {
      lifetime.abort()
      cancelTimer()
      document.removeEventListener('visibilitychange', handleVisibility)
      controller.current = null
    }
  }, [scope])

  const current = view?.scope.handoverId === handoverId && view.scope.service === service ? view : undefined
  const currentOperation = operation?.scope === scope ? operation : undefined
  const state: HandoverViewState = service.connected ? current?.state ?? { status: 'loading' } : { status: 'unavailable' }
  const canMutate = enabled && service.connected && current?.scope === scope && current.state.status === 'ready'

  function mutate(action: HandoverAction, input?: HandoverReadyInput) {
    const active = controller.current
    return canMutate && active?.scope === scope ? active.mutate(action, input) : Promise.resolve(false)
  }

  return {
    state,
    canMutate,
    busy: enabled ? currentOperation?.busy ?? null : null,
    actionError: enabled ? currentOperation?.error ?? null : null,
    clockOffsetMs: current?.clockOffsetMs ?? 0,
    refresh: () => { if (enabled && controller.current?.scope === scope) controller.current.refresh() },
    setReady: (input?: HandoverReadyInput) => mutate('ready', input),
    resetPlace: () => mutate('reset'),
    complete: () => mutate('complete'),
  }
}
