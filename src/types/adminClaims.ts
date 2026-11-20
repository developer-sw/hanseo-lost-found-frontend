import type { AdminDashboardSummaryResult } from './adminDashboard'
import type { AdminFoundItem } from './adminItems'
import type { ClaimRequestStatus } from './claimRequest'

export interface AdminClaim {
  id: string
  applicant: { name: string; accountId: string }
  requestedAt: string
  status: ClaimRequestStatus
  ownershipProof: string
  linkedLostItemId: string | null
}

export interface AdminClaimGroup {
  item: AdminFoundItem
  claims: readonly AdminClaim[]
  handoverId?: string
}

export interface AdminClaimsQuery {
  foundItemId?: string
  claimStatus?: ClaimRequestStatus
}

type AdminClaimFailure = Exclude<AdminDashboardSummaryResult, { status: 'ready' }> | { status: 'not-found' }

export type AdminClaimsResult =
  | { status: 'ready'; groups: readonly AdminClaimGroup[] }
  | AdminClaimFailure

export type AdminClaimReviewAction = 'approve' | 'reject'

type AdminClaimReviewFailure =
  | AdminClaimFailure
  | { status: 'conflict'; reason: 'already-confirmed' | 'already-processed' | 'stale' }

interface AdminClaimApproval {
  status: 'approved'
  claimId: string
  claimStatus: 'APPROVED'
  itemStatus: 'AWAITING_PICKUP'
  rejectedClaimIds: readonly string[]
  handover: { id: string; status: 'WAITING' }
  closedLostItemId: string | null
}

export type AdminClaimApprovalResult = AdminClaimApproval | AdminClaimReviewFailure

export type AdminClaimRejectionResult =
  | { status: 'rejected'; claimId: string; claimStatus: 'REJECTED'; itemStatus: 'CLAIM_REQUESTED' | 'STORED' }
  | AdminClaimReviewFailure

export type AdminClaimReviewResult = AdminClaimApprovalResult | AdminClaimRejectionResult
