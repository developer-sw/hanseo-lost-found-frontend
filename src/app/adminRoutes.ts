import type { IconName } from '../components/Icon'
import { ADMIN_ITEM_STATUSES } from '../data/adminItemStatuses'
import type { AdminFoundItem, AdminItemStatusFilter } from '../types/adminItems'
import type { FoundItemStatus } from '../types/foundItem'

export const ADMIN_ROOT = '/admin'
export const ADMIN_LOGIN_PATH = '/account?role=admin'

const adminSections = {
  dashboard: { id: 'dashboard', segment: '', label: '대시보드', icon: 'layers', description: '습득물 상태별 건수를 확인합니다.' },
  items: { id: 'items', segment: '/items', label: '습득물 관리', icon: 'box', description: '등록된 습득물의 목록과 상세 정보를 상태별로 확인합니다.' },
  claims: { id: 'claims', segment: '/claims', label: '수령 신청 처리', icon: 'clipboard', description: '습득물별 소유 증빙을 비교하고 주인 확정과 신청 거절을 처리합니다.' },
  handovers: { id: 'handovers', segment: '/handovers', label: '전달 진행 현황', icon: 'map-pin', description: '수령대기 물품의 추천 건물과 수령완료 여부를 조회합니다.' },
} as const satisfies Record<string, { id: string; segment: string; label: string; icon: IconName; description: string }>

export type AdminSection = keyof typeof adminSections
export const ADMIN_SECTIONS = Object.values(adminSections)

export function getAdminSectionDetails(section: AdminSection) {
  return adminSections[section]
}

export function getAdminPath(section: AdminSection, base = ADMIN_ROOT, params?: URLSearchParams) {
  const path = `${base}${adminSections[section].segment}`
  return params?.size ? `${path}?${params}` : path
}

export function getAdminHandoverPath(foundItemId: string, handoverId?: string) {
  const params = new URLSearchParams({ foundItemId })
  if (handoverId) params.set('handoverId', handoverId)
  return getAdminPath('handovers', ADMIN_ROOT, params)
}

export function getAdminSection(pathname: string, base = ADMIN_ROOT): AdminSection | undefined {
  const path = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  return ADMIN_SECTIONS.find(({ segment }) => path === `${base}${segment}`)?.id
}

export function getAdminItemStatusFilter(value: string | null): AdminItemStatusFilter {
  return ADMIN_ITEM_STATUSES.find(({ status }) => status === value)?.status ?? 'all'
}

export function getAdminItemsPath(filter: AdminItemStatusFilter, base = ADMIN_ROOT, scenario?: string) {
  const params = new URLSearchParams()
  if (filter !== 'all') params.set('status', filter)
  if (scenario) params.set('scenario', scenario)
  return getAdminPath('items', base, params)
}

export function getAdminItemWorkSection(status: FoundItemStatus) {
  if (status === 'CLAIM_REQUESTED') return 'claims'
  if (status === 'AWAITING_PICKUP') return 'handovers'
}

export function getAdminItemAction(item: AdminFoundItem, base = ADMIN_ROOT) {
  const section = getAdminItemWorkSection(item.status)
  if (!section) return undefined

  const params = new URLSearchParams({ foundItemId: item.id, status: item.status })
  return {
    href: getAdminPath(section, base, params),
    label: section === 'claims' ? '신청 검토하기' : '전달 현황 보기',
  }
}
