import type { HandoverRecord, HandoverRole, HandoverSnapshot } from '../types/handover'

export const HANDOVER_READY_DURATION_MS = 30 * 60 * 1000
export const HANDOVER_POLL_INTERVAL_MS = 5000

export function getHandoverReadyUntil(record: HandoverRecord, role: HandoverRole) {
  return role === 'finder' ? record.finderReadyUntil : record.ownerReadyUntil
}

export function getHandoverReadiness(readyUntil: string | null, nowMs: number) {
  const expiration = readyUntil ? Date.parse(readyUntil) : Number.NaN
  if (!Number.isFinite(expiration)) return { status: 'waiting', remainingSeconds: 0 } as const

  const remainingSeconds = Math.ceil((expiration - nowMs) / 1000)
  return remainingSeconds > 0
    ? { status: 'ready', remainingSeconds } as const
    : { status: 'expired', remainingSeconds: 0 } as const
}

export function getHandoverActions({ handover, role }: HandoverSnapshot, nowMs: number) {
  const ongoing = (role === 'finder' || role === 'owner') && handover.item.status === 'AWAITING_PICKUP'
    && handover.claimStatus === 'APPROVED' && (handover.status === 'WAITING' || handover.status === 'PLACE_SET')

  return {
    ready: ongoing && handover.status === 'WAITING'
      && getHandoverReadiness(getHandoverReadyUntil(handover, role), nowMs).status !== 'ready',
    reset: ongoing && handover.status === 'PLACE_SET',
    complete: ongoing && role === 'owner',
  }
}
