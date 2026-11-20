import type { AdminClaim, AdminClaimGroup } from '../types/adminClaims'

export function hasConfirmedAdminClaim({ item, claims }: AdminClaimGroup) {
  return item.status === 'AWAITING_PICKUP' || item.status === 'CLAIMED'
    || claims.some(({ status }) => status === 'APPROVED' || status === 'COMPLETED')
}

export function canReviewAdminClaim(group: AdminClaimGroup, claim: AdminClaim) {
  return group.item.status === 'CLAIM_REQUESTED' && claim.status === 'PENDING' && !hasConfirmedAdminClaim(group)
}
