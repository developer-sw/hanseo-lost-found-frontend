import { demoFoundItemDetails } from '../data/foundItems'
import type { FoundItemDetailResult } from '../types/foundItem'

export const foundItemService = {
  async getById(id: string): Promise<FoundItemDetailResult> {
    const item = demoFoundItemDetails.find((detail) => detail.id === id)

    return item ? { status: 'ready', item, source: 'demo' } : { status: 'not-found' }
  },
}
