import type { AdminClaim, AdminClaimGroup, AdminClaimReviewAction, AdminClaimReviewResult, AdminClaimsResult } from '../types/adminClaims'
import { canReviewAdminClaim, hasConfirmedAdminClaim } from '../utils/adminClaimReview'
import { getDemoAdminItems } from './demoAdminItems'
import { demoHandoverCases } from './demoHandoverCases'

const demoClaimsByItem: Readonly<Record<string, readonly AdminClaim[] | undefined>> = {
  'white-wireless-earbuds': [
    {
      id: 'demo-a3-earbuds-a',
      applicant: { name: '가상 학생 A', accountId: 'DEMO-A3-A' },
      requestedAt: '2026-11-19T02:15:00.000Z',
      status: 'PENDING',
      ownershipProof: '충전 케이스 뚜껑 안쪽 왼쪽에 짧은 흠집이 두 줄 있습니다. 1층 열람실 창가 자리에서 이어폰을 사용한 뒤 자리를 나왔습니다.',
      linkedLostItemId: 'demo-a3-lost-earbuds-a',
    },
    {
      id: 'demo-a3-earbuds-b',
      applicant: { name: '가상 학생 B', accountId: 'DEMO-A3-B' },
      requestedAt: '2026-11-19T03:10:00.000Z',
      status: 'PENDING',
      ownershipProof: '케이스 안쪽 오른쪽 이어버드 슬롯 뒤에 작은 별 모양 스티커를 붙였습니다. 분실한 날 1층에서 공부했습니다.',
      linkedLostItemId: null,
    },
    {
      id: 'demo-a3-earbuds-c',
      applicant: { name: '가상 학생 C', accountId: 'DEMO-A3-C' },
      requestedAt: '2026-11-19T05:15:00.000Z',
      status: 'PENDING',
      ownershipProof: '왼쪽 이어버드 손잡이 안쪽에 회색 점 표시가 있습니다. 정오 무렵 열람실 입구 쪽에서 가방을 정리하다 놓고 왔습니다.',
      linkedLostItemId: null,
    },
  ],
  [demoHandoverCases.wallet.foundItemId]: [
    {
      id: demoHandoverCases.wallet.claimId,
      applicant: { name: '가상 학생 D', accountId: 'DEMO-A3-D' },
      requestedAt: demoHandoverCases.wallet.requestedAt,
      status: demoHandoverCases.wallet.claimStatus,
      ownershipProof: '지갑 안쪽 접히는 부분에 흰 실로 꿰맨 자국이 세 곳 있습니다.',
      linkedLostItemId: demoHandoverCases.wallet.lostItemId,
    },
  ],
  [demoHandoverCases.tumbler.foundItemId]: [
    {
      id: demoHandoverCases.tumbler.claimId,
      applicant: { name: '가상 학생 E', accountId: 'DEMO-A3-E' },
      requestedAt: demoHandoverCases.tumbler.requestedAt,
      status: demoHandoverCases.tumbler.claimStatus,
      ownershipProof: '바닥 안쪽 가장자리에 반달 모양으로 옅게 벗겨진 부분이 있습니다.',
      linkedLostItemId: demoHandoverCases.tumbler.lostItemId,
    },
  ],
  'black-bluetooth-earbud-case': [
    {
      id: 'demo-a3-case-a',
      applicant: { name: '가상 학생 F', accountId: 'DEMO-A3-F' },
      requestedAt: '2026-11-18T23:00:00.000Z',
      status: 'REJECTED',
      ownershipProof: '충전 단자 옆에 파란 표시가 있고 뚜껑 안쪽에 사각형 스티커가 붙어 있다고 기억합니다.',
      linkedLostItemId: null,
    },
    {
      id: 'demo-a3-case-b',
      applicant: { name: '가상 학생 G', accountId: 'DEMO-A3-G' },
      requestedAt: '2026-11-18T23:30:00.000Z',
      status: 'CANCELLED',
      ownershipProof: '케이스 뒷면에 작은 둥근 자국이 있습니다. 정문 근처에서 버스를 기다린 뒤 케이스가 없어진 것을 알았습니다.',
      linkedLostItemId: null,
    },
  ],
}

function getDemoHandoverId(foundItemId: string) {
  return `demo-a3-handover-${foundItemId}`
}

export function getDemoAdminClaims(foundItemId?: string, { empty = false }: { empty?: boolean } = {}): AdminClaimsResult {
  const items = getDemoAdminItems('all').items.filter(({ id }) => foundItemId === undefined || id === foundItemId)
  if (foundItemId !== undefined && !items.length) return { status: 'not-found' }

  const groups = items.flatMap((item) => {
    const claims = empty ? [] : demoClaimsByItem[item.id] ?? []
    if (!claims.length && foundItemId === undefined) return []

    const shared = Object.values(demoHandoverCases).find(({ foundItemId, claimId }) => (
      foundItemId === item.id && claims.some((claim) => claim.id === claimId)
    ))
    const handoverId = shared?.handoverId ?? (claims.some(({ status }) => status === 'APPROVED') ? getDemoHandoverId(item.id) : undefined)
    return [{ item, claims, handoverId }]
  })
  groups.sort((left, right) => Number(right.item.status === 'CLAIM_REQUESTED') - Number(left.item.status === 'CLAIM_REQUESTED'))
  return { status: 'ready', groups }
}

export function reviewDemoAdminClaim(
  group: AdminClaimGroup,
  claimId: string,
  action: AdminClaimReviewAction,
): { group: AdminClaimGroup; result: AdminClaimReviewResult } {
  const claim = group.claims.find(({ id }) => id === claimId)
  if (!claim) return { group, result: { status: 'not-found' } }
  if (hasConfirmedAdminClaim(group)) return { group, result: { status: 'conflict', reason: 'already-confirmed' } }
  if (claim.status !== 'PENDING') return { group, result: { status: 'conflict', reason: 'already-processed' } }
  if (!canReviewAdminClaim(group, claim)) return { group, result: { status: 'conflict', reason: 'stale' } }

  if (action === 'reject') {
    const claims = group.claims.map<AdminClaim>((entry) => entry.id === claimId ? { ...entry, status: 'REJECTED' } : entry)
    const itemStatus = claims.some(({ status }) => status === 'PENDING') ? 'CLAIM_REQUESTED' : 'STORED'
    return {
      group: { ...group, item: { ...group.item, status: itemStatus }, claims },
      result: { status: 'rejected', claimId, claimStatus: 'REJECTED', itemStatus },
    }
  }

  const rejectedClaimIds = group.claims.filter(({ id, status }) => id !== claimId && status === 'PENDING').map(({ id }) => id)
  const claims = group.claims.map<AdminClaim>((entry) => {
    if (entry.status !== 'PENDING') return entry
    return { ...entry, status: entry.id === claimId ? 'APPROVED' : 'REJECTED' }
  })
  const itemStatus = 'AWAITING_PICKUP'
  const handoverId = getDemoHandoverId(group.item.id)
  return {
    group: { ...group, item: { ...group.item, status: itemStatus }, claims, handoverId },
    result: {
      status: 'approved',
      claimId,
      claimStatus: 'APPROVED',
      itemStatus,
      rejectedClaimIds,
      handover: { id: handoverId, status: 'WAITING' },
      closedLostItemId: claim.linkedLostItemId,
    },
  }
}

export function getDemoClaimHandoverPreview(foundItemId: string, claimId: string) {
  const claims = getDemoAdminClaims(foundItemId)
  const group = claims.status === 'ready' ? claims.groups[0] : undefined
  if (!group) return undefined

  const preview = reviewDemoAdminClaim(group, claimId, 'approve')
  if (preview.result.status !== 'approved') return undefined
  const claim = preview.group.claims.find(({ id }) => id === claimId)
  if (!claim) return undefined

  return {
    item: preview.group.item,
    handover: preview.result.handover,
    claim: { id: claim.id, applicantName: claim.applicant.name, status: preview.result.claimStatus },
  }
}
