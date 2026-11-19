import type { LostReportRequest } from '../types/lostReport'

export type CreateLostReportResult =
  | { status: 'unavailable' }
  | { status: 'created'; reportId: string }

export const lostReportService = {
  async create(_request: LostReportRequest): Promise<CreateLostReportResult> {
    return { status: 'unavailable' }
  },
}
