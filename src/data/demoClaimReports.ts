import type { OpenLostReportSummary } from '../types/claimRequest'
import { demoMatchReport } from './demoMatches'

export const demoClaimReportOptions: readonly { key: string; report: OpenLostReportSummary }[] = [
  { key: 'sample-earbuds', report: demoMatchReport },
  {
    key: 'sample-card-wallet',
    report: {
      itemName: '검정색 카드 지갑',
      categoryId: 'wallets',
      lostAt: '2026-11-17T02:00:00.000Z',
      buildingName: '청곡관(학생회관)',
      status: 'OPEN',
    },
  },
]
