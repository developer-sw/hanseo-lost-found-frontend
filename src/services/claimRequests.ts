import type { ClaimRequest, CreateClaimRequestResult, ListLinkableLostReportsResult } from '../types/claimRequest'

export const claimRequestService = {
  async create(_request: ClaimRequest): Promise<CreateClaimRequestResult> {
    return { status: 'unavailable' }
  },

  async listLinkableLostReports(): Promise<ListLinkableLostReportsResult> {
    return { status: 'unavailable' }
  },
}
