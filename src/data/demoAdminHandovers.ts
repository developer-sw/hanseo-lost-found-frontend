import type {
  AdminHandover,
  AdminHandoverDetailResult,
  AdminHandoverSummary,
  AdminHandoversQuery,
  AdminHandoversResult,
} from '../types/adminHandovers'
import type { AdminFoundItem } from '../types/adminItems'
import { campusBuildings } from './campusBuildings'
import { getDemoAdminClaims, getDemoClaimHandoverPreview } from './demoAdminClaims'
import { getDemoAdminItem } from './demoAdminItems'
import { demoHandoverBuildingId, demoHandoverCases } from './demoHandoverCases'

interface DemoHandoverOptions {
  empty?: boolean
  missingBuilding?: boolean
  previewClaimId?: string
}

const demoFinderReadyUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString()
const recommendedBuilding = campusBuildings.find(({ id }) => id === demoHandoverBuildingId)

function getSharedHandover(
  foundItemId: string,
  itemStatus: AdminFoundItem['status'],
  claimStatus: AdminHandover['claim']['status'],
) {
  const result = getDemoAdminClaims(foundItemId)
  const group = result.status === 'ready' ? result.groups[0] : undefined
  if (!group || group.item.status !== itemStatus) return undefined

  const claim = group.claims.find(({ status }) => status === claimStatus)
  if (!claim) return undefined

  return {
    item: group.item,
    handoverId: group.handoverId,
    claim: { id: claim.id, applicantName: claim.applicant.name, status: claimStatus },
  }
}

function getDemoRecords(missingBuilding: boolean): AdminHandover[] {
  const records: AdminHandover[] = []
  const walletCase = demoHandoverCases.wallet
  const wallet = getSharedHandover(walletCase.foundItemId, walletCase.itemStatus, walletCase.claimStatus)
  if (wallet?.handoverId) {
    records.push({
      handoverId: wallet.handoverId,
      item: wallet.item,
      claim: { ...wallet.claim, confirmedAt: walletCase.confirmedAt },
      status: walletCase.status,
      finderReadyUntil: demoFinderReadyUntil,
      ownerReadyUntil: null,
    })
  }

  const earbuds = getDemoAdminItem('white-wireless-earbuds')
  if (earbuds.status === 'ready') {
    records.push({
      handoverId: 'demo-a4-handover-place-set',
      item: {
        id: 'demo-a4-place-set-earbuds',
        name: '무선 이어폰 세트',
        category: earbuds.item.category,
        building: earbuds.item.building,
        locationDetail: earbuds.item.locationDetail,
        foundAt: earbuds.item.foundAt,
        registeredAt: earbuds.item.registeredAt,
        image: earbuds.item.image,
        status: 'AWAITING_PICKUP',
      },
      claim: {
        id: 'demo-a4-place-set-claim',
        applicantName: '가상 학생 H',
        status: 'APPROVED',
        confirmedAt: '2026-11-20T00:10:00.000Z',
      },
      status: 'PLACE_SET',
      buildingId: missingBuilding ? undefined : recommendedBuilding?.id,
      buildingName: missingBuilding ? undefined : recommendedBuilding?.name,
      placeSetAt: '2026-11-20T00:36:00.000Z',
      source: 'scenario',
    })
  }

  const tumblerCase = demoHandoverCases.tumbler
  const tumbler = getSharedHandover(tumblerCase.foundItemId, tumblerCase.itemStatus, tumblerCase.claimStatus)
  if (tumbler?.handoverId) {
    records.push({
      handoverId: tumbler.handoverId,
      item: tumbler.item,
      claim: { ...tumbler.claim, confirmedAt: tumblerCase.confirmedAt },
      status: tumblerCase.status,
      buildingId: recommendedBuilding?.id,
      buildingName: recommendedBuilding?.name,
      placeSetAt: tumblerCase.placeSetAt,
      completedAt: tumblerCase.completedAt,
    })
  }

  return records
}

function summarize(records: readonly AdminHandover[]): AdminHandoverSummary {
  return {
    ongoing: records.filter(({ status }) => status !== 'DONE').length,
    placeSet: records.filter(({ status }) => status === 'PLACE_SET').length,
    done: records.filter(({ status }) => status === 'DONE').length,
  }
}

function findHandover(
  records: readonly AdminHandover[],
  { handoverId, foundItemId }: Omit<AdminHandoversQuery, 'filter'>,
  { empty, previewClaimId }: DemoHandoverOptions,
): AdminHandover | undefined {
  if (empty) return undefined

  if (previewClaimId !== undefined) {
    if (!foundItemId) return undefined
    const preview = getDemoClaimHandoverPreview(foundItemId, previewClaimId)
    if (!preview || (handoverId !== undefined && handoverId !== preview.handover.id)) return undefined

    return {
      handoverId: preview.handover.id,
      item: preview.item,
      claim: preview.claim,
      status: preview.handover.status,
      source: 'preview',
    }
  }

  return records.find((handover) => (
    (handoverId === undefined || handover.handoverId === handoverId)
    && (foundItemId === undefined || handover.item.id === foundItemId)
  ))
}

export function getDemoAdminHandovers(
  query: AdminHandoversQuery,
  options: DemoHandoverOptions = {},
): AdminHandoversResult {
  const records = options.empty ? [] : getDemoRecords(Boolean(options.missingBuilding))
  const focused = query.handoverId !== undefined || query.foundItemId !== undefined || options.previewClaimId !== undefined
  const selected = focused ? findHandover(records, query, options) : undefined
  if (focused && !selected) return { status: 'not-found' }

  const items = records.filter(({ status }) => {
    if (query.filter === 'all') return true
    if (query.filter === 'ongoing') return status !== 'DONE'
    return status === query.filter
  })
  if (selected && !items.some(({ handoverId }) => handoverId === selected.handoverId)) items.unshift(selected)

  return { status: 'ready', items, summary: summarize(records), selectedId: selected?.handoverId }
}

export function getDemoAdminHandover(
  handoverId: string,
  options: DemoHandoverOptions & { foundItemId?: string } = {},
): AdminHandoverDetailResult {
  const records = options.empty ? [] : getDemoRecords(Boolean(options.missingBuilding))
  const handover = findHandover(records, { handoverId, foundItemId: options.foundItemId }, options)
  return handover ? { status: 'ready', handover } : { status: 'not-found' }
}
