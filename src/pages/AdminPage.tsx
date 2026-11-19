import { useEffect, useState, type ReactNode } from 'react'
import { ADMIN_ROOT, getAdminPath, getAdminSectionDetails, type AdminSection } from '../app/adminRoutes'
import { AdminLayout } from '../components/AdminLayout'
import { Header } from '../components/Header'
import { Icon } from '../components/Icon'
import { adminDashboardService } from '../services/adminDashboard'
import type { AdminDashboardAccessResult, AdminDashboardSummaryResult } from '../types/adminDashboard'
import { AdminDashboardNotice, AdminDashboardPage } from './AdminDashboardPage'

type DashboardState = AdminDashboardSummaryResult | { status: 'loading' }
type AccessState = AdminDashboardAccessResult | { status: 'loading' }

export function AdminWorkspace({ section, state, onRetry, base = ADMIN_ROOT, demo = false, accountName, demoControl }: {
  section: AdminSection
  state: DashboardState
  onRetry: () => void
  base?: string
  demo?: boolean
  accountName?: string
  demoControl?: ReactNode
}) {
  const { label, description } = getAdminSectionDetails(section)
  const getHref = (destination: AdminSection) => getAdminPath(destination, base)

  return (
    <AdminLayout activeSection={section} getHref={getHref} demo={demo} accountName={accountName}>
      {section === 'dashboard' ? (
        <AdminDashboardPage state={state} getHref={getHref} onRetry={onRetry} demoControl={demoControl} />
      ) : (
        <div className="admin-dashboard">
          <header className="admin-dashboard__heading">
            <h1>{label}</h1>
            <p>{description}</p>
          </header>
          <section className="page-panel" aria-labelledby="admin-upcoming-title">
            <h2 id="admin-upcoming-title">{label} 화면은 준비 중입니다.</h2>
            <p>{section === 'handovers' ? '주인 확정 후에는 두 학생이 직접 전달을 진행하고, 분실자가 수령을 확인합니다.' : '업무 화면이 준비되면 이 메뉴에서 이용할 수 있습니다.'}</p>
            <div className="page-actions">
              <a className="secondary-link" href={getHref('dashboard')}><Icon name="arrow-left" size={18} /> 대시보드로 돌아가기</a>
            </div>
          </section>
        </div>
      )}
    </AdminLayout>
  )
}

export function AdminPage({ section }: { section: AdminSection }) {
  const [access, setAccess] = useState<AccessState>({ status: 'loading' })
  const [summary, setSummary] = useState<DashboardState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true

    async function load() {
      let result: AdminDashboardAccessResult
      try {
        result = await adminDashboardService.getAccess()
      } catch {
        if (active) setAccess({ status: 'error' })
        return
      }

      if (!active) return
      if (result.status !== 'authenticated') {
        setAccess(result)
        return
      }
      if (result.user.role !== 'admin') {
        setAccess({ status: 'forbidden' })
        return
      }

      setAccess(result)
      if (section !== 'dashboard') return

      try {
        const dashboard = await adminDashboardService.getSummary()
        if (!active) return
        if (dashboard.status === 'sign-in-required' || dashboard.status === 'expired' || dashboard.status === 'forbidden') {
          setAccess(dashboard)
        } else {
          setSummary(dashboard)
        }
      } catch {
        if (active) setSummary({ status: 'error' })
      }
    }

    void load()
    return () => { active = false }
  }, [section, attempt])

  function retry() {
    setAccess({ status: 'loading' })
    setSummary({ status: 'loading' })
    setAttempt((value) => value + 1)
  }

  if (access.status === 'authenticated' && access.user.role === 'admin') {
    return <AdminWorkspace section={section} state={summary} onRetry={retry} accountName={access.user.name} />
  }

  const status = access.status === 'authenticated' ? 'forbidden' : access.status
  return (
    <>
      <a className="skip-link" href="#main-content">본문으로 바로 이동</a>
      <Header pathname={getAdminPath(section)} search="" />
      <main className="site-container inner-page" id="main-content">
        <h1>관리자 페이지</h1>
        <AdminDashboardNotice status={status} onRetry={retry} />
      </main>
    </>
  )
}
