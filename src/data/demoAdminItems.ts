import type { AdminFoundItem, AdminItemDetailResult, AdminItemsResult, AdminItemStatusFilter } from '../types/adminItems'
import type { FoundItemDetail } from '../types/foundItem'
import { summarizeFoundItems } from './demoAdminDashboard'
import { demoFoundItemDetails } from './foundItems'

function toAdminFoundItem(item: FoundItemDetail): AdminFoundItem {
  const { id, name, category, building, locationDetail, foundAt, registeredAt, image, status } = item
  return { id, name, category, building, locationDetail, foundAt, registeredAt, image, status }
}

export function getDemoAdminItems(
  filter: AdminItemStatusFilter,
  { empty = false }: { empty?: boolean } = {},
): Extract<AdminItemsResult, { status: 'ready' }> {
  const records = empty ? [] : demoFoundItemDetails
  const items = records
    .filter(({ status }) => filter === 'all' || status === filter)
    .map(toAdminFoundItem)
    .sort((left, right) => Date.parse(right.registeredAt) - Date.parse(left.registeredAt) || left.id.localeCompare(right.id, 'en'))

  return { status: 'ready', items, summary: summarizeFoundItems(records) }
}

export function getDemoAdminItem(id: string): Extract<AdminItemDetailResult, { status: 'ready' | 'not-found' }> {
  const item = demoFoundItemDetails.find((record) => record.id === id)
  if (!item) return { status: 'not-found' }

  return { status: 'ready', item: { ...toAdminFoundItem(item), description: item.description } }
}
