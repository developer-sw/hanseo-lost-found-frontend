import type { AdminDashboardSummary, AdminDashboardSummaryResult } from './adminDashboard'
import type { FoundItemDetail, FoundItemStatus } from './foundItem'

export type AdminItemStatusFilter = 'all' | FoundItemStatus

export type AdminFoundItem = Pick<
  FoundItemDetail,
  'id' | 'name' | 'category' | 'building' | 'locationDetail' | 'foundAt' | 'registeredAt' | 'image' | 'status'
>

export interface AdminFoundItemDetail extends AdminFoundItem {
  description?: string
}

type AdminItemsFailure = Exclude<AdminDashboardSummaryResult, { status: 'ready' }>

export type AdminItemsResult =
  | { status: 'ready'; items: readonly AdminFoundItem[]; summary: AdminDashboardSummary }
  | AdminItemsFailure

export type AdminItemDetailResult =
  | { status: 'ready'; item: AdminFoundItemDetail }
  | { status: 'not-found' }
  | AdminItemsFailure
