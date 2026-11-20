import { useState, type ReactNode } from 'react'
import { getAdminItemAction, getAdminItemsPath, getAdminItemStatusFilter, getAdminItemWorkSection, getAdminPath, type AdminSection } from '../app/adminRoutes'
import { getDemoAdminClaims, getDemoClaimHandoverPreview, reviewDemoAdminClaim } from '../data/demoAdminClaims'
import { getDemoAdminSummary } from '../data/demoAdminDashboard'
import { getDemoAdminItem, getDemoAdminItems } from '../data/demoAdminItems'
import type { AdminClaimReviewAction, AdminClaimReviewResult, AdminClaimsResult } from '../types/adminClaims'
import { AdminClaimsPage } from './AdminClaimsPage'
import { AdminDashboardPage } from './AdminDashboardPage'
import { AdminItemsPage } from './AdminItemsPage'
import { AdminWorkspace } from './AdminPage'

const demoRoot = '/admin/demo'
const scenarioLabels = {
  sample: '예시 통계',
  empty: '빈 데이터',
  loading: '로딩 중',
  error: '조회 오류',
  conflict: '심사 중 상태 충돌',
} as const

type DemoScenario = keyof typeof scenarioLabels

function getScenario(value: string | null, section: AdminSection): DemoScenario {
  if (value === 'conflict' && section === 'claims') return value
  return value === 'empty' || value === 'loading' || value === 'error' ? value : 'sample'
}

async function loadDemoDetail(id: string) {
  return getDemoAdminItem(id)
}

export default function AdminDemoPage({ section, params }: { section: AdminSection; params: URLSearchParams }) {
  const scenario = getScenario(params.get('scenario'), section)
  const filter = getAdminItemStatusFilter(params.get('status'))
  const requestedId = params.get('foundItemId') ?? undefined
  const getHref = (destination: AdminSection) => getAdminPath(destination, demoRoot)
  const pending = scenario === 'loading' || scenario === 'error' ? { status: scenario } as const : undefined
  const source = { empty: scenario === 'empty' }
  const demoControl = (
    <form className="admin-dashboard__demo-control" action={getHref(section)} method="get">
      {section === 'items' && filter !== 'all' && <input type="hidden" name="status" value={filter} />}
      {section === 'claims' && requestedId !== undefined && <input type="hidden" name="foundItemId" value={requestedId} />}
      <label htmlFor="admin-demo-scenario">데모 상태</label>
      <select id="admin-demo-scenario" name="scenario" defaultValue={scenario}>
        {Object.entries(scenarioLabels)
          .filter(([value]) => section === 'claims' || value !== 'conflict')
          .map(([value, label]) => (
            <option key={value} value={value}>{value === 'sample' && section !== 'dashboard' ? '예시 목록' : label}</option>
          ))}
      </select>
      <button className="secondary-link" type="submit">보기</button>
    </form>
  )

  const previewClaimId = params.get('previewClaimId')
  const preview = section === 'handovers' && requestedId && previewClaimId
    ? getDemoClaimHandoverPreview(requestedId, previewClaimId)
    : undefined
  const detail = requestedId && section === 'handovers' ? getDemoAdminItem(requestedId) : undefined
  const selectedItem = preview?.item ?? (detail?.status === 'ready' && getAdminItemWorkSection(detail.item.status) === section ? detail.item : undefined)
  const content = section === 'dashboard' ? (
    <AdminDashboardPage
      state={pending ?? { status: 'ready', summary: getDemoAdminSummary(source) }}
      getHref={getHref}
      getItemsHref={(status) => getAdminItemsPath(status, demoRoot, source.empty ? 'empty' : undefined)}
      onRetry={() => window.location.assign(demoRoot)}
      demoControl={demoControl}
    />
  ) : section === 'items' ? (
    <AdminItemsPage
      state={pending ?? getDemoAdminItems(filter, source)}
      filter={filter}
      getFilterHref={(status) => getAdminItemsPath(status, demoRoot, scenario === 'sample' ? undefined : scenario)}
      getAction={(item) => getAdminItemAction(item, demoRoot)}
      loadDetail={loadDemoDetail}
      onRetry={() => window.location.assign(getAdminItemsPath(filter, demoRoot))}
      demoControl={demoControl}
    />
  ) : section === 'claims' ? (
    <DemoClaimsWorkspace requestedId={requestedId} scenario={scenario} demoControl={demoControl} />
  ) : undefined

  return (
    <AdminWorkspace section={section} base={demoRoot} demo selectedItem={selectedItem} handoverPreview={Boolean(preview)}>
      {content}
    </AdminWorkspace>
  )
}

function DemoClaimsWorkspace({ requestedId, scenario, demoControl }: {
  requestedId?: string
  scenario: DemoScenario
  demoControl: ReactNode
}) {
  const [state, setState] = useState<AdminClaimsResult | { status: 'loading' }>(() => (
    scenario === 'loading' || scenario === 'error' ? { status: scenario }
      : getDemoAdminClaims(requestedId, { empty: scenario === 'empty' })
  ))
  const [simulateConflict, setSimulateConflict] = useState(scenario === 'conflict')

  async function review(action: AdminClaimReviewAction, groupId: string, claimId: string): Promise<AdminClaimReviewResult> {
    if (state.status !== 'ready') return { status: 'error' }
    const group = state.groups.find(({ item }) => item.id === groupId)
    if (!group) return { status: 'not-found' }

    const otherPending = simulateConflict && group.claims.find((claim) => claim.status === 'PENDING' && claim.id !== claimId)
    const next = simulateConflict
      ? reviewDemoAdminClaim(group, otherPending ? otherPending.id : claimId, otherPending ? 'approve' : 'reject')
      : reviewDemoAdminClaim(group, claimId, action)
    setState({ status: 'ready', groups: state.groups.map((current) => current.item.id === groupId ? next.group : current) })
    if (!simulateConflict) return next.result

    setSimulateConflict(false)
    return { status: 'conflict', reason: 'stale' }
  }

  return (
    <AdminClaimsPage
      state={state}
      focusedId={requestedId}
      demo
      demoControl={demoControl}
      onRetry={() => setState(getDemoAdminClaims(requestedId))}
      onReview={review}
      getItemsHref={() => getAdminItemsPath('CLAIM_REQUESTED', demoRoot)}
      getClaimsHref={() => getAdminPath('claims', demoRoot)}
      getHandoversHref={(group, result) => {
        const params = new URLSearchParams({ foundItemId: group.item.id })
        const initial = getDemoAdminItem(group.item.id)
        if (initial.status === 'ready' && initial.item.status === 'CLAIM_REQUESTED') {
          const primary = result?.claimId ?? group.claims.find((claim) => claim.status === 'APPROVED')?.id
          if (primary) params.set('previewClaimId', primary)
        }
        return getAdminPath('handovers', demoRoot, params)
      }}
    />
  )
}
