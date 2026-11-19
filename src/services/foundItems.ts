import { demoFoundItemDetails } from '../data/foundItems'
import { demoMyClaimFoundItems } from '../data/demoMyActivity'
import type { FoundItemDetailResult } from '../types/foundItem'

export const foundItemService = {
  async getById(id: string): Promise<FoundItemDetailResult> {
    const item = demoFoundItemDetails.find((detail) => detail.id === id)
      ?? demoMyClaimFoundItems.find((detail) => detail.id === id)

    return item ? { status: 'ready', item, source: 'demo' } : { status: 'not-found' }
  },
}
