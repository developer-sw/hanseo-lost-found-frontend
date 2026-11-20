import type { HandoverStatus } from './adminHandovers'
import type { FoundItemDetail } from './foundItem'

export type { HandoverStatus }

export type HandoverRole = 'finder' | 'owner'

export interface HandoverBuilding {
  id: string
  name: string
}

export interface HandoverRecord {
  handoverId: string
  item: Pick<FoundItemDetail, 'id' | 'name' | 'category' | 'building' | 'image'> & { status: 'AWAITING_PICKUP' | 'CLAIMED' }
  claimId: string
  claimStatus: 'APPROVED' | 'COMPLETED'
  status: HandoverStatus
  finderReadyUntil: string | null
  ownerReadyUntil: string | null
  building: HandoverBuilding | null
  placeSetAt: string | null
  completedAt: string | null
}

export interface HandoverSnapshot {
  handover: HandoverRecord
  role: HandoverRole
  serverNow: string
}

export type HandoverFailure = {
  status: 'unavailable' | 'sign-in-required' | 'expired' | 'forbidden' | 'not-found' | 'conflict' | 'network-error' | 'error'
}

export type HandoverResult = { status: 'ready'; snapshot: HandoverSnapshot } | HandoverFailure
export type HandoverViewState = HandoverResult | { status: 'loading' }
export type HandoverAction = 'ready' | 'reset' | 'complete'

export type HandoverReadyInput =
  | { type: 'gps'; latitude: number; longitude: number }
  | { type: 'building'; buildingId: string }

export type HandoverLocationFailure = {
  status: 'unsupported' | 'insecure-context' | 'permission-denied' | 'timeout' | 'position-unavailable' | 'aborted'
}

export type HandoverActionError = HandoverFailure | HandoverLocationFailure
export type HandoverLocationResult = { status: 'ready'; input: Extract<HandoverReadyInput, { type: 'gps' }> } | HandoverLocationFailure

export interface HandoverService {
  readonly connected: boolean
  getById(handoverId: string, signal?: AbortSignal): Promise<HandoverResult>
  listActive(signal?: AbortSignal): Promise<{ status: 'ready'; ids: readonly string[] } | HandoverFailure>
  setReady(handoverId: string, input: HandoverReadyInput, signal?: AbortSignal): Promise<HandoverResult>
  resetPlace(handoverId: string, signal?: AbortSignal): Promise<HandoverResult>
  complete(handoverId: string, signal?: AbortSignal): Promise<HandoverResult>
  listBuildings(signal?: AbortSignal): Promise<{
    status: 'ready'
    buildings: readonly (HandoverBuilding & { demoSelectable: boolean })[]
  } | HandoverFailure>
}
