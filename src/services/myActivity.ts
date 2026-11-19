import { demoMyActivity } from '../data/demoMyActivity'
import type { LostReportRequest } from '../types/lostReport'
import type { FoundReportUpdateRequest, MyActivityMutationResult, MyActivityResult, MyActivitySource } from '../types/myActivity'

export const myActivityService = {
  async getActivity({ mode = 'demo', empty = false }: { mode?: MyActivitySource; empty?: boolean } = {}): Promise<MyActivityResult> {
    if (mode === 'api') return { status: 'sign-in-required' }

    const activity = empty ? { ...demoMyActivity, lostReports: [], foundReports: [], claims: [] } : demoMyActivity
    return { status: 'ready', source: 'demo', activity }
  },

  async updateLost(_id: string, _request: LostReportRequest): Promise<MyActivityMutationResult> {
    return { status: 'unavailable' }
  },

  async updateFound(_id: string, _request: FoundReportUpdateRequest): Promise<MyActivityMutationResult> {
    return { status: 'unavailable' }
  },

  async deleteLost(_id: string): Promise<MyActivityMutationResult> {
    return { status: 'unavailable' }
  },

  async deleteFound(_id: string): Promise<MyActivityMutationResult> {
    return { status: 'unavailable' }
  },

  async cancelClaim(_id: string): Promise<MyActivityMutationResult> {
    return { status: 'unavailable' }
  },
}
