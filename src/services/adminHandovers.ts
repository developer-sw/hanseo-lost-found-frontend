import type { AdminHandoverDetailResult, AdminHandoversQuery, AdminHandoversResult } from '../types/adminHandovers'

export const adminHandoversService = {
  async list(_query: AdminHandoversQuery): Promise<AdminHandoversResult> {
    return { status: 'unavailable' }
  },

  async getById(_handoverId: string): Promise<AdminHandoverDetailResult> {
    return { status: 'unavailable' }
  },
}
