import type { MatchRequestResult } from '../types/match'

export const matchService = {
  async getByReportId(_reportId: string): Promise<MatchRequestResult> {
    // Map the authenticated API's 403 to forbidden and 404 to not-found when connected.
    return { status: 'unavailable' }
  },
}
