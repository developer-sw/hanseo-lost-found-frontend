import type { FoundCategory } from './foundItem'

export interface LostReportFields {
  itemName: string
  categoryId: string
  lostAt: string
  buildingId: string
  locationDetail: string
  description: string
}

export interface LostReportRequest {
  itemName: string
  categoryId: FoundCategory
  lostAt: string
  buildingId: string
  locationDetail?: string
  description?: string
}
