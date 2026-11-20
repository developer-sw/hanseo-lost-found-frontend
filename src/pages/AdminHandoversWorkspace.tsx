import { useCallback, useEffect, useState } from 'react'
import { getAdminHandoversPath } from '../app/adminRoutes'
import { adminHandoversService } from '../services/adminHandovers'
import type { AdminHandoversQuery, AdminHandoversResult } from '../types/adminHandovers'
import { AdminHandoversPage } from './AdminHandoversPage'

export function AdminHandoversWorkspace({ query, onAccessFailure }: {
  query: AdminHandoversQuery
  onAccessFailure: (status: string) => boolean
}) {
  const { filter, foundItemId, handoverId } = query
  const [state, setState] = useState<AdminHandoversResult | { status: 'loading' }>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const response = await adminHandoversService.list({ filter, foundItemId, handoverId })
        if (active && !onAccessFailure(response.status)) setState(response)
      } catch {
        if (active) setState({ status: 'error' })
      }
    }

    void load()
    return () => { active = false }
  }, [filter, foundItemId, handoverId, attempt, onAccessFailure])

  const loadDetail = useCallback(async (id: string) => {
    const response = await adminHandoversService.getById(id)
    onAccessFailure(response.status)
    return response
  }, [onAccessFailure])

  function refresh() {
    setState({ status: 'loading' })
    setAttempt((value) => value + 1)
  }

  return (
    <AdminHandoversPage
      state={state}
      filter={filter}
      loadDetail={loadDetail}
      getFilterHref={getAdminHandoversPath}
      onRefresh={refresh}
    />
  )
}
