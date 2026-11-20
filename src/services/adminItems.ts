import type { AdminItemDetailResult, AdminItemsResult, AdminItemStatusFilter } from '../types/adminItems'

export const adminItemsService = {
  async list(_filter: AdminItemStatusFilter): Promise<AdminItemsResult> {
    return { status: 'unavailable' }
  },

  async getById(_id: string): Promise<AdminItemDetailResult> {
    return { status: 'unavailable' }
  },
}
