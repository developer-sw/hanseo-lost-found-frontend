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
