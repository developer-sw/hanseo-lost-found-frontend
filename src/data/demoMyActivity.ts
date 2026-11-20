import airpodsImage from '../assets/item-airpods.webp'
import earbudsCaseImage from '../assets/item-earbud-charging-case.webp'
import walletImage from '../assets/item-wallet.webp'
import tumblerImage from '../assets/item-tumbler.webp'
import wirelessEarbudsImage from '../assets/item-wireless-earbuds.webp'
import type { FoundItemDetail } from '../types/foundItem'
import type { MyActivity, MyClaim, MyFoundReport, MyLostReport } from '../types/myActivity'
import { demoHandoverCases } from './demoHandoverCases'
import { demoMatchReport } from './demoMatches'
import { demoFoundItemDetails } from './foundItems'

export const DEMO_MATCH_LOST_REPORT_ID = 'demo-lost-earbuds'

const openLostReport: MyLostReport = {
  ...demoMatchReport,
  id: DEMO_MATCH_LOST_REPORT_ID,
  buildingId: 'mock-seosan-h11',
  registeredAt: '2026-11-17T05:00:00.000Z',
  description: '검정색 케이스를 씌운 에어팟 프로입니다.',
}

const closedLostReport: MyLostReport = {
  id: 'demo-lost-white-earbuds',
  itemName: '흰색 무선 이어폰',
  categoryId: 'electronics',
  lostAt: '2026-11-17T02:00:00.000Z',
  buildingId: 'mock-seosan-h07',
  buildingName: '연암도서관',
  status: 'CLOSED',
  registeredAt: '2026-11-17T02:30:00.000Z',
}

const ownedDemoItems = new Map([
  ['airpods-pro', { buildingId: 'mock-seosan-h11', hasClaimRequests: false }],
  ['black-wallet', { buildingId: 'mock-seosan-h04', hasClaimRequests: true }],
  ['tumbler', { buildingId: 'mock-seosan-h07', hasClaimRequests: true }],
  ['white-wireless-earbuds', { buildingId: 'mock-seosan-h07', hasClaimRequests: true }],
])

const myFoundReports: readonly MyFoundReport[] = demoFoundItemDetails.flatMap(({ claimEligibility: _eligibility, ...item }) => {
  const ownership = ownedDemoItems.get(item.id)
  if (!ownership) return []

  const handoverId = import.meta.env.DEV && item.id === demoHandoverCases.wallet.foundItemId
    ? demoHandoverCases.wallet.handoverId
    : undefined
  return [{ ...item, ...ownership, handoverId }]
})

// These are other students' public demo items. They support S7 links from the claim examples.
export const demoMyClaimFoundItems: readonly FoundItemDetail[] = [
  {
    id: 'demo-claim-found-card-wallet',
    name: '검정색 카드 지갑',
    category: 'wallets',
    building: '청곡관(학생회관)',
    locationDetail: '1층 입구',
    foundAt: '2026-11-18T03:00:00.000Z',
    registeredAt: '2026-11-18T04:00:00.000Z',
    image: walletImage,
    status: 'CLAIM_REQUESTED',
  },
  {
    id: 'demo-claim-found-white-earbuds',
    name: '흰색 무선 이어폰과 충전 케이스',
    category: 'electronics',
    building: '연암도서관',
    foundAt: '2026-11-17T03:00:00.000Z',
    registeredAt: '2026-11-17T05:00:00.000Z',
    image: wirelessEarbudsImage,
    status: 'AWAITING_PICKUP',
  },
  {
    id: 'demo-claim-found-black-case',
    name: '검정색 무선 이어폰 충전 케이스',
    category: 'electronics',
    building: '이학관',
    foundAt: '2026-11-17T02:00:00.000Z',
    registeredAt: '2026-11-17T03:00:00.000Z',
    image: earbudsCaseImage,
    status: 'STORED',
  },
  {
    id: 'demo-claim-found-airpods',
    name: '흰색 이어폰과 충전 케이스',
    category: 'electronics',
    building: '인문사회관',
    foundAt: '2026-11-17T04:50:00.000Z',
    registeredAt: '2026-11-17T05:00:00.000Z',
    image: airpodsImage,
    status: 'STORED',
  },
  {
    id: 'demo-claim-found-tumbler',
    name: '베이지색 텀블러',
    category: 'other',
    building: '예술관',
    foundAt: '2026-11-16T01:10:00.000Z',
    registeredAt: '2026-11-16T02:00:00.000Z',
    image: tumblerImage,
    status: 'CLAIMED',
  },
]

const demoClaims: readonly Omit<MyClaim, 'item'>[] = [
  {
    id: 'demo-my-claim-pending',
    foundItemId: 'demo-claim-found-card-wallet',
    lostItemId: null,
    status: 'PENDING',
    requestedAt: '2026-11-18T06:00:00.000Z',
  },
  {
    id: 'demo-my-claim-approved',
    foundItemId: 'demo-claim-found-white-earbuds',
    lostItemId: closedLostReport.id,
    linkedLostItemName: closedLostReport.itemName,
    status: 'APPROVED',
    requestedAt: '2026-11-17T07:15:00.000Z',
  },
  {
    id: 'demo-my-claim-rejected',
    foundItemId: 'demo-claim-found-black-case',
    lostItemId: null,
    status: 'REJECTED',
    requestedAt: '2026-11-17T06:30:00.000Z',
  },
  {
    id: 'demo-my-claim-cancelled',
    foundItemId: 'demo-claim-found-airpods',
    lostItemId: openLostReport.id,
    linkedLostItemName: openLostReport.itemName,
    status: 'CANCELLED',
    requestedAt: '2026-11-17T06:05:00.000Z',
  },
  {
    id: 'demo-my-claim-completed',
    foundItemId: 'demo-claim-found-tumbler',
    lostItemId: null,
    status: 'COMPLETED',
    requestedAt: '2026-11-16T04:00:00.000Z',
  },
]

const myClaims: readonly MyClaim[] = demoClaims.flatMap((claim) => {
  if (import.meta.env.DEV) {
    const handover = claim.status === 'APPROVED' ? demoHandoverCases.wallet
      : claim.status === 'COMPLETED' ? demoHandoverCases.tumbler : undefined
    const sharedItem = handover && demoFoundItemDetails.find(({ id }) => id === handover.foundItemId)
    if (handover && sharedItem) {
      const { id, name, category, image } = sharedItem
      return [{
        id: handover.claimId,
        foundItemId: id,
        lostItemId: handover.lostItemId,
        status: handover.claimStatus,
        requestedAt: handover.requestedAt,
        handoverId: handover.handoverId,
        item: { id, name, category, image },
      }]
    }
  }

  const item = demoMyClaimFoundItems.find(({ id }) => id === claim.foundItemId)
  if (!item) return []

  const { id, name, category, image } = item
  return [{ ...claim, item: { id, name, category, image } }]
})

export const demoMyActivity: MyActivity = {
  account: { name: '데모 학생', studentId: 'DEMO-2026', department: '소프트웨어학과' },
  lostReports: [openLostReport, closedLostReport],
  foundReports: myFoundReports,
  claims: myClaims,
}
