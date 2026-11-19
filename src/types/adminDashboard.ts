import type { AuthUser } from './auth'
import type { FoundItemStatus } from './foundItem'

export interface AdminDashboardSummary {
  counts: Readonly<Record<FoundItemStatus, number>>
  total: number
}

type AdminDashboardFailure = {
  status: 'sign-in-required' | 'expired' | 'forbidden' | 'error' | 'unavailable'
}

export type AdminDashboardAccessResult =
  | { status: 'authenticated'; user: AuthUser }
  | AdminDashboardFailure

export type AdminDashboardSummaryResult =
  | { status: 'ready'; summary: AdminDashboardSummary }
  | AdminDashboardFailure
