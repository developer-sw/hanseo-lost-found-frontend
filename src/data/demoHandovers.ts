import type { HandoverBuilding, HandoverRecord, HandoverResult, HandoverRole } from '../types/handover'
import { getHandoverActions, getHandoverReadiness, getHandoverReadyUntil, HANDOVER_READY_DURATION_MS } from '../utils/handover'
import { campusBuildings } from './campusBuildings'

export const demoHandoverBuildings = campusBuildings.filter(({ id }) => id !== 'mock-seosan-other')

export type DemoHandoverAction = { type: 'ready'; buildingId: string } | { type: 'reset' } | { type: 'complete' }

export function createDemoHandoverSession(initial: HandoverRecord, { recommendedBuilding, now = Date.now }: {
  recommendedBuilding: HandoverBuilding
  now?: () => number
}) {
  let handover = initial
  let elapsedMs = 0

  function currentTime() {
    return now() + elapsedMs
  }

  function read(role: HandoverRole): HandoverResult {
    if (role !== 'finder' && role !== 'owner') return { status: 'forbidden' }
    return { status: 'ready', snapshot: { handover, role, serverNow: new Date(currentTime()).toISOString() } }
  }

  function apply(role: HandoverRole, action: DemoHandoverAction): HandoverResult {
    const result = read(role)
    if (result.status !== 'ready') return result
    if (action.type === 'complete' && role !== 'owner') return { status: 'forbidden' }

    const nowMs = currentTime()
    if (!getHandoverActions(result.snapshot, nowMs)[action.type]) return { status: 'conflict' }

    switch (action.type) {
      case 'ready': {
        if (!demoHandoverBuildings.some(({ id }) => id === action.buildingId)) return { status: 'not-found' }
        const deadline = new Date(nowMs + HANDOVER_READY_DURATION_MS).toISOString()
        handover = role === 'finder'
          ? { ...handover, finderReadyUntil: deadline }
          : { ...handover, ownerReadyUntil: deadline }
        const bothReady = getHandoverReadiness(handover.finderReadyUntil, nowMs).status === 'ready'
          && getHandoverReadiness(handover.ownerReadyUntil, nowMs).status === 'ready'
        // The shared fixture supplies the assumed server result for this demo.
        if (bothReady) handover = { ...handover, status: 'PLACE_SET', building: recommendedBuilding, placeSetAt: new Date(nowMs).toISOString() }
        break
      }
      case 'reset':
        handover = { ...handover, status: 'WAITING', building: null, placeSetAt: null, finderReadyUntil: null, ownerReadyUntil: null }
        break
      case 'complete':
        handover = {
          ...handover,
          status: 'DONE',
          item: { ...handover.item, status: 'CLAIMED' },
          claimStatus: 'COMPLETED',
          completedAt: new Date(nowMs).toISOString(),
          finderReadyUntil: null,
          ownerReadyUntil: null,
        }
        break
    }

    return read(role)
  }

  function expireReadiness(role: HandoverRole): HandoverResult {
    const result = read(role)
    if (result.status !== 'ready') return result
    const deadline = getHandoverReadyUntil(handover, role)
    const nowMs = currentTime()
    if (handover.status !== 'WAITING' || getHandoverReadiness(deadline, nowMs).status !== 'ready' || !deadline) {
      return { status: 'conflict' }
    }

    elapsedMs += Date.parse(deadline) - nowMs
    return read(role)
  }

  return { read, apply, expireReadiness }
}
