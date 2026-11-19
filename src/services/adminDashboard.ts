import type { AdminDashboardAccessResult, AdminDashboardSummaryResult } from '../types/adminDashboard'

export const adminDashboardService = {
  async getAccess(): Promise<AdminDashboardAccessResult> {
    return { status: 'sign-in-required' }
  },

  async getSummary(): Promise<AdminDashboardSummaryResult> {
    return { status: 'unavailable' }
  },
}
