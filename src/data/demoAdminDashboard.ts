import type { AdminDashboardSummary } from '../types/adminDashboard'
import type { FoundItemDetail, FoundItemStatus } from '../types/foundItem'
import { demoFoundItemDetails } from './foundItems'

export function summarizeFoundItems(items: readonly Pick<FoundItemDetail, 'status'>[]): AdminDashboardSummary {
  const counts: Record<FoundItemStatus, number> = {
    STORED: 0,
    CLAIM_REQUESTED: 0,
    AWAITING_PICKUP: 0,
    CLAIMED: 0,
  }

  for (const { status } of items) counts[status] += 1

  return { counts, total: items.length }
}

export function getDemoAdminSummary({ empty = false }: { empty?: boolean } = {}): AdminDashboardSummary {
  return summarizeFoundItems(empty ? [] : demoFoundItemDetails)
}
