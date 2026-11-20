import type { HandoverService } from '../types/handover'

export const handoverService: HandoverService = {
  connected: false,

  async getById() {
    return { status: 'unavailable' }
  },

  async listActive() {
    return { status: 'unavailable' }
  },

  async setReady() {
    return { status: 'unavailable' }
  },

  async resetPlace() {
    return { status: 'unavailable' }
  },

  async complete() {
    return { status: 'unavailable' }
  },

  async listBuildings() {
    return { status: 'unavailable' }
  },
}
