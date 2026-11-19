import type { FoundCategory } from './foundItem'

export interface FoundReportFields {
  itemName: string
  categoryId: string
  foundAt: string
  buildingId: string
  locationDetail: string
  description: string
  photo: File | null
}

export interface FoundReportRequest {
  itemName: string
  categoryId: FoundCategory
  foundAt: string
  buildingId: string
  locationDetail?: string
  description?: string
  photo: File
}
