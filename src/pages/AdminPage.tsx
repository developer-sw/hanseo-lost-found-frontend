import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { ADMIN_ROOT, getAdminHandoversQuery, getAdminItemAction, getAdminItemsPath, getAdminItemStatusFilter, getAdminPath, type AdminSection } from '../app/adminRoutes'
import { AdminLayout } from '../components/AdminLayout'
import { Header } from '../components/Header'
import { adminDashboardService } from '../services/adminDashboard'
import { adminItemsService } from '../services/adminItems'
import type { AdminDashboardAccessResult, AdminDashboardSummaryResult } from '../types/adminDashboard'
import type { AdminItemsResult } from '../types/adminItems'
import { AdminClaimsWorkspace } from './AdminClaimsWorkspace'
import { AdminDashboardNotice, AdminDashboardPage } from './AdminDashboardPage'
import { AdminHandoversWorkspace } from './AdminHandoversWorkspace'
import { AdminItemsPage } from './AdminItemsPage'

type DashboardState = AdminDashboardSummaryResult | { status: 'loading' }
type ItemsState = AdminItemsResult | { status: 'loading' }
type AccessState = AdminDashboardAccessResult | { status: 'loading' }

function getAccessFailure(status: string) {
  if (status === 'sign-in-required' || status === 'expired' || status === 'forbidden') return status
}

export function AdminWorkspace({ section, base = ADMIN_ROOT, demo = false, accountName, children }: {
  section: AdminSection
  base?: string
  demo?: boolean
  accountName?: string
  children: ReactNode
}) {
  const getHref = (destination: AdminSection) => getAdminPath(destination, base)

  return (
    <AdminLayout activeSection={section} getHref={getHref} demo={demo} accountName={accountName}>
      {children}
    </AdminLayout>
  )
}

export function AdminPage({ section, params }: { section: AdminSection; params: URLSearchParams }) {
  const filter = getAdminItemStatusFilter(params.get('status'))
  const [access, setAccess] = useState<AccessState>({ status: 'loading' })
  const [summary, setSummary] = useState<DashboardState>({ status: 'loading' })
  const [items, setItems] = useState<ItemsState>({ status: 'loading' })
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
      if (section !== 'dashboard' && section !== 'items') return

      try {
        if (section === 'items') {
          const response = await adminItemsService.list(filter)
          if (!active) return
          const failure = getAccessFailure(response.status)
          if (failure) setAccess({ status: failure })
          else setItems(response)
        } else {
          const response = await adminDashboardService.getSummary()
          if (!active) return
          const failure = getAccessFailure(response.status)
          if (failure) setAccess({ status: failure })
          else setSummary(response)
        }
      } catch {
        if (!active) return
        if (section === 'items') setItems({ status: 'error' })
        else setSummary({ status: 'error' })
      }
    }

    void load()
    return () => { active = false }
  }, [section, filter, attempt])

  const loadDetail = useCallback(async (id: string) => {
    const response = await adminItemsService.getById(id)
    const failure = getAccessFailure(response.status)
    if (failure) setAccess({ status: failure })
    return response
  }, [])

  const handleAccessFailure = useCallback((status: string) => {
    const failure = getAccessFailure(status)
    if (!failure) return false
    setAccess({ status: failure })
    return true
  }, [])

  function retry() {
    setAccess({ status: 'loading' })
    setSummary({ status: 'loading' })
    setItems({ status: 'loading' })
    setAttempt((value) => value + 1)
  }

  if (access.status === 'authenticated' && access.user.role === 'admin') {
    const content = section === 'dashboard' ? (
      <AdminDashboardPage state={summary} getHref={getAdminPath} getItemsHref={getAdminItemsPath} onRetry={retry} />
    ) : section === 'items' ? (
      <AdminItemsPage
        state={items}
        filter={filter}
        getFilterHref={getAdminItemsPath}
        getAction={getAdminItemAction}
        loadDetail={loadDetail}
        onRetry={retry}
      />
    ) : section === 'claims' ? (
      <AdminClaimsWorkspace foundItemId={params.get('foundItemId') ?? undefined} onAccessFailure={handleAccessFailure} />
    ) : (
      <AdminHandoversWorkspace query={getAdminHandoversQuery(params)} onAccessFailure={handleAccessFailure} />
    )
    return <AdminWorkspace section={section} accountName={access.user.name}>{content}</AdminWorkspace>
  }

  const status = access.status === 'authenticated' ? 'forbidden' : access.status
  return (
    <>
      <a className="skip-link" href="#main-content">본문으로 바로 이동</a>
      <Header pathname={getAdminPath(section)} search="" />
      <main className="site-container inner-page" id="main-content">
        <h1>관리자 페이지</h1>
        <AdminDashboardNotice status={status} onRetry={retry} resource={section === 'dashboard' ? 'summary' : section === 'items' ? 'items' : 'access'} />
      </main>
    </>
  )
}
