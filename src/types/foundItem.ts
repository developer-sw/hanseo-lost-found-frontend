export type FoundCategory = 'electronics' | 'wallets' | 'bags' | 'clothing' | 'other'

export interface FoundItem {
  id: string
  name: string
  category: FoundCategory
  building: string
  locationDetail?: string
  foundAt: string
  registeredAt: string
  image: string
}

export type FoundItemStatus = 'STORED' | 'CLAIM_REQUESTED' | 'AWAITING_PICKUP' | 'CLAIMED'

export type FoundItemClaimEligibility = {
  status: 'allowed' | 'sign-in-required' | 'own-item' | 'already-requested' | 'rejected' | 'cancelled'
}

export interface FoundItemDetail extends FoundItem {
  status: FoundItemStatus
  description?: string
  claimEligibility?: FoundItemClaimEligibility
}

export type FoundItemDetailResult =
  | { status: 'ready'; item: FoundItemDetail; source: 'demo' | 'api' }
  | { status: 'not-found' | 'unavailable' | 'error' }
