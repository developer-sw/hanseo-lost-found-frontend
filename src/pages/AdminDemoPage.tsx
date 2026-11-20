import { getAdminItemAction, getAdminItemsPath, getAdminItemStatusFilter, getAdminItemWorkSection, getAdminPath, type AdminSection } from '../app/adminRoutes'
import { getDemoAdminSummary } from '../data/demoAdminDashboard'
import { getDemoAdminItem, getDemoAdminItems } from '../data/demoAdminItems'
import { AdminDashboardPage } from './AdminDashboardPage'
import { AdminItemsPage } from './AdminItemsPage'
import { AdminWorkspace } from './AdminPage'

const demoRoot = '/admin/demo'
const scenarioLabels = {
  sample: '예시 통계',
  empty: '빈 데이터',
  loading: '로딩 중',
  error: '조회 오류',
} as const

type DemoScenario = keyof typeof scenarioLabels

function getScenario(value: string | null): DemoScenario {
  return value === 'empty' || value === 'loading' || value === 'error' ? value : 'sample'
}

async function loadDemoDetail(id: string) {
  return getDemoAdminItem(id)
}

export default function AdminDemoPage({ section, params }: { section: AdminSection; params: URLSearchParams }) {
  const scenario = getScenario(params.get('scenario'))
  const filter = getAdminItemStatusFilter(params.get('status'))
  const getHref = (destination: AdminSection) => getAdminPath(destination, demoRoot)
  const pending = scenario === 'loading' || scenario === 'error' ? { status: scenario } as const : undefined
  const source = { empty: scenario === 'empty' }
  const demoControl = (
    <form className="admin-dashboard__demo-control" action={getHref(section)} method="get">
      {section === 'items' && filter !== 'all' && <input type="hidden" name="status" value={filter} />}
      <label htmlFor="admin-demo-scenario">데모 상태</label>
      <select id="admin-demo-scenario" name="scenario" defaultValue={scenario}>
        {Object.entries(scenarioLabels).map(([value, label]) => (
          <option key={value} value={value}>{section === 'items' && value === 'sample' ? '예시 목록' : label}</option>
        ))}
      </select>
      <button className="secondary-link" type="submit">보기</button>
    </form>
  )

  const requestedId = params.get('foundItemId')
  const detail = requestedId && (section === 'claims' || section === 'handovers') ? getDemoAdminItem(requestedId) : undefined
  const selectedItem = detail?.status === 'ready' && getAdminItemWorkSection(detail.item.status) === section ? detail.item : undefined
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
  ) : undefined

  return (
    <AdminWorkspace section={section} base={demoRoot} demo selectedItem={selectedItem}>
      {content}
    </AdminWorkspace>
  )
}
