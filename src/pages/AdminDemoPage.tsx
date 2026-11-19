import { type AdminSection } from '../app/adminRoutes'
import { getDemoAdminSummary } from '../data/demoAdminDashboard'
import type { AdminDashboardSummaryResult } from '../types/adminDashboard'
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

export default function AdminDemoPage({ section, params }: { section: AdminSection; params: URLSearchParams }) {
  const scenario = getScenario(params.get('scenario'))
  const state: AdminDashboardSummaryResult | { status: 'loading' } = scenario === 'sample' || scenario === 'empty'
    ? { status: 'ready', summary: getDemoAdminSummary({ empty: scenario === 'empty' }) }
    : { status: scenario }

  return (
    <AdminWorkspace
      section={section}
      base={demoRoot}
      demo
      state={state}
      onRetry={() => window.location.assign(demoRoot)}
      demoControl={(
        <form className="admin-dashboard__demo-control" action={demoRoot} method="get">
          <label htmlFor="admin-demo-scenario">데모 상태</label>
          <select id="admin-demo-scenario" name="scenario" defaultValue={scenario}>
            {Object.entries(scenarioLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <button className="secondary-link" type="submit">보기</button>
        </form>
      )}
    />
  )
}
