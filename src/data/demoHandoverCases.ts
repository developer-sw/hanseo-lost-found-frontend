export const demoHandoverBuildingId = 'mock-seosan-h08'

export const demoHandoverCases = {
  wallet: {
    handoverId: 'demo-a3-handover-black-wallet',
    foundItemId: 'black-wallet',
    claimId: 'demo-a3-wallet-a',
    requestedAt: '2026-11-19T07:50:00.000Z',
    confirmedAt: '2026-11-19T08:15:00.000Z',
    lostItemId: 'demo-a3-lost-wallet-a',
    claimStatus: 'APPROVED',
    itemStatus: 'AWAITING_PICKUP',
    status: 'WAITING',
    placeSetAt: null,
    completedAt: null,
  },
  tumbler: {
    handoverId: 'demo-a4-handover-tumbler',
    foundItemId: 'tumbler',
    claimId: 'demo-a3-tumbler-a',
    requestedAt: '2026-11-19T04:30:00.000Z',
    confirmedAt: '2026-11-19T04:50:00.000Z',
    lostItemId: null,
    claimStatus: 'COMPLETED',
    itemStatus: 'CLAIMED',
    status: 'DONE',
    placeSetAt: '2026-11-19T05:00:00.000Z',
    completedAt: '2026-11-19T05:20:00.000Z',
  },
} as const
