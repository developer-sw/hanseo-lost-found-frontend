import type { IconName } from '../components/Icon'

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

export function getAdminPath(section: AdminSection, base = ADMIN_ROOT) {
  return `${base}${adminSections[section].segment}`
}

export function getAdminSection(pathname: string, base = ADMIN_ROOT): AdminSection | undefined {
  const path = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
  return ADMIN_SECTIONS.find(({ segment }) => path === `${base}${segment}`)?.id
}
