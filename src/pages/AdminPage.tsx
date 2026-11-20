import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { ADMIN_ROOT, getAdminItemAction, getAdminItemsPath, getAdminItemStatusFilter, getAdminPath, getAdminSectionDetails, type AdminSection } from '../app/adminRoutes'
import { AdminLayout } from '../components/AdminLayout'
import { Header } from '../components/Header'
import { Icon } from '../components/Icon'
import { ADMIN_ITEM_STATUSES } from '../data/adminItemStatuses'
import { adminDashboardService } from '../services/adminDashboard'
import { adminItemsService } from '../services/adminItems'
import type { AdminDashboardAccessResult, AdminDashboardSummaryResult } from '../types/adminDashboard'
import type { AdminFoundItem, AdminItemsResult } from '../types/adminItems'
import { AdminDashboardNotice, AdminDashboardPage } from './AdminDashboardPage'
import { AdminItemsPage } from './AdminItemsPage'

type DashboardState = AdminDashboardSummaryResult | { status: 'loading' }
type ItemsState = AdminItemsResult | { status: 'loading' }
type AccessState = AdminDashboardAccessResult | { status: 'loading' }

function getAccessFailure(status: string) {
  if (status === 'sign-in-required' || status === 'expired' || status === 'forbidden') return status
}

export function AdminWorkspace({ section, base = ADMIN_ROOT, demo = false, accountName, selectedItem, children }: {
  section: AdminSection
  base?: string
  demo?: boolean
  accountName?: string
  selectedItem?: AdminFoundItem
  children?: ReactNode
}) {
  const { label, description } = getAdminSectionDetails(section)
  const getHref = (destination: AdminSection) => getAdminPath(destination, base)
  const itemStatusLabel = selectedItem && ADMIN_ITEM_STATUSES.find(({ status }) => status === selectedItem.status)?.label

  return (
    <AdminLayout activeSection={section} getHref={getHref} demo={demo} accountName={accountName}>
      {children ?? (
        <div className="admin-dashboard">
          <header className="admin-dashboard__heading">
            <h1>{label}</h1>
            <p>{description}</p>
          </header>
          <section className="page-panel" aria-labelledby="admin-upcoming-title">
            <h2 id="admin-upcoming-title">{label} 화면은 준비 중입니다.</h2>
            {selectedItem && <p><strong>선택한 습득물</strong> {selectedItem.name} · {itemStatusLabel}</p>}
            <p>{section === 'handovers' ? '주인 확정 후에는 두 학생이 직접 전달을 진행하고, 분실자가 수령을 확인합니다.' : '업무 화면이 준비되면 이 메뉴에서 이용할 수 있습니다.'}</p>
            <div className="page-actions">
              {selectedItem ? (
                <a className="secondary-link" href={getAdminItemsPath(selectedItem.status, base)}><Icon name="arrow-left" size={18} /> 습득물 관리로 돌아가기</a>
              ) : (
                <a className="secondary-link" href={getHref('dashboard')}><Icon name="arrow-left" size={18} /> 대시보드로 돌아가기</a>
              )}
            </div>
          </section>
        </div>
      )}
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
    ) : undefined
    return <AdminWorkspace section={section} accountName={access.user.name}>{content}</AdminWorkspace>
  }

  const status = access.status === 'authenticated' ? 'forbidden' : access.status
  return (
    <>
      <a className="skip-link" href="#main-content">본문으로 바로 이동</a>
      <Header pathname={getAdminPath(section)} search="" />
      <main className="site-container inner-page" id="main-content">
        <h1>관리자 페이지</h1>
        <AdminDashboardNotice status={status} onRetry={retry} resource={section === 'items' ? 'items' : 'summary'} />
      </main>
    </>
  )
}
