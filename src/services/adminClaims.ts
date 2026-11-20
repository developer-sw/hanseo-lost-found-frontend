import type {
  AdminClaimApprovalResult,
  AdminClaimRejectionResult,
  AdminClaimsQuery,
  AdminClaimsResult,
} from '../types/adminClaims'

export const adminClaimsService = {
  async list(_query: AdminClaimsQuery): Promise<AdminClaimsResult> {
    return { status: 'unavailable' }
  },

  // One server request will confirm the owner and apply all linked status changes atomically.
  async approve(_claimId: string): Promise<AdminClaimApprovalResult> {
    return { status: 'unavailable' }
  },

  async reject(_claimId: string): Promise<AdminClaimRejectionResult> {
    return { status: 'unavailable' }
  },
}
