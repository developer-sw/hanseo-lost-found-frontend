import type { ClaimRequestStatus } from './claimRequest'
import type { FoundItem, FoundItemDetail } from './foundItem'
import type { FoundReportRequest } from './foundReport'
import type { LostReportRequest } from './lostReport'

export interface MyLostReport extends LostReportRequest {
  id: string
  status: 'OPEN' | 'CLOSED'
  buildingName: string
  registeredAt: string
}

export interface MyFoundReport extends Omit<FoundItemDetail, 'claimEligibility'> {
  buildingId: string
  hasClaimRequests: boolean
  handoverId?: string
}

export interface MyClaim {
  id: string
  foundItemId: string
  lostItemId: string | null
  status: ClaimRequestStatus
  requestedAt: string
  item: Pick<FoundItem, 'id' | 'name' | 'category' | 'image'>
  linkedLostItemName?: string
  handoverId?: string
}

export interface MyActivity {
  account: { name: string; studentId: string; department: string }
  lostReports: readonly MyLostReport[]
  foundReports: readonly MyFoundReport[]
  claims: readonly MyClaim[]
}

export type MyActivitySource = 'demo' | 'api'

export type MyActivityResult =
  | { status: 'ready'; source: MyActivitySource; activity: MyActivity }
  | { status: 'unavailable' | 'sign-in-required' | 'forbidden' | 'error' }

export type FoundReportUpdateRequest = Omit<FoundReportRequest, 'photo'> & { photo?: File }

export interface MyActivityAction {
  kind: 'delete-lost' | 'delete-found' | 'cancel-claim'
  id: string
  name: string
}

export type MyActivityMutationResult = {
  status: 'success' | 'unavailable' | 'sign-in-required' | 'forbidden' | 'not-found' | 'conflict'
    | 'has-claim-requests' | 'not-pending' | 'error'
}
