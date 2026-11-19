import type { MatchReportSummary } from './match'

export type ClaimRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'

export interface ClaimRequest {
  foundItemId: string
  lostItemId: string | null
  ownershipProof: string
}

export type CreateClaimRequestResult =
  | { status: 'created'; claimRequestId: string; claimStatus: 'PENDING' }
  | { status: 'unavailable' | 'sign-in-required' | 'forbidden' | 'not-found' | 'conflict' | 'error' }

export interface OpenLostReportSummary extends Omit<MatchReportSummary, 'status'> {
  status: 'OPEN'
}

export interface LinkableLostReport extends OpenLostReportSummary {
  lostItemId: string
}

export type ListLinkableLostReportsResult =
  | { status: 'ready'; reports: readonly LinkableLostReport[] }
  | { status: 'unavailable' | 'sign-in-required' | 'forbidden' | 'error' }
