import type { AdminDashboardSummaryResult } from './adminDashboard'
import type { AdminFoundItem } from './adminItems'

export type HandoverStatus = 'WAITING' | 'PLACE_SET' | 'DONE'
export type AdminHandoverFilter = 'all' | 'ongoing' | HandoverStatus

export interface AdminHandover {
  handoverId: string
  item: AdminFoundItem
  claim: {
    id: string
    applicantName: string
    status: 'APPROVED' | 'COMPLETED'
    confirmedAt?: string
  }
  status: HandoverStatus
  buildingId?: string
  buildingName?: string
  placeSetAt?: string
  completedAt?: string
  finderReadyUntil?: string | null
  ownerReadyUntil?: string | null
  source?: 'preview' | 'scenario'
}

export interface AdminHandoversQuery {
  filter: AdminHandoverFilter
  foundItemId?: string
  handoverId?: string
}

export interface AdminHandoverSummary {
  ongoing: number
  placeSet: number
  done: number
}

type AdminHandoverFailure = Exclude<AdminDashboardSummaryResult, { status: 'ready' }> | { status: 'not-found' }

export type AdminHandoversResult =
  | { status: 'ready'; items: readonly AdminHandover[]; summary: AdminHandoverSummary; selectedId?: string }
  | AdminHandoverFailure

export type AdminHandoverDetailResult =
  | { status: 'ready'; handover: AdminHandover }
  | AdminHandoverFailure
