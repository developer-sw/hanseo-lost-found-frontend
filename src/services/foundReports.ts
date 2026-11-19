import type { FoundReportRequest } from '../types/foundReport'

export type CreateFoundReportResult =
  | { status: 'unavailable' }
  | { status: 'created'; foundItemId: string }

export const foundReportService = {
  async create(_request: FoundReportRequest): Promise<CreateFoundReportResult> {
    return { status: 'unavailable' }
  },
}
