import { useEffect, useState } from 'react'
import { getAdminHandoverPath, getAdminItemsPath, getAdminPath } from '../app/adminRoutes'
import { adminClaimsService } from '../services/adminClaims'
import type { AdminClaimReviewAction, AdminClaimReviewResult, AdminClaimsResult } from '../types/adminClaims'
import { AdminClaimsPage } from './AdminClaimsPage'

export function AdminClaimsWorkspace({ foundItemId, onAccessFailure }: {
  foundItemId?: string
  onAccessFailure: (status: string) => boolean
}) {
  const [state, setState] = useState<AdminClaimsResult | { status: 'loading' }>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const response = await adminClaimsService.list({ foundItemId })
        if (active && !onAccessFailure(response.status)) setState(response)
      } catch {
        if (active) setState({ status: 'error' })
      }
    }

    void load()
    return () => { active = false }
  }, [foundItemId, attempt, onAccessFailure])

  function refresh() {
    setState({ status: 'loading' })
    setAttempt((value) => value + 1)
  }

  async function review(action: AdminClaimReviewAction, _groupId: string, claimId: string): Promise<AdminClaimReviewResult> {
    try {
      const response = await adminClaimsService[action](claimId)
      if (!onAccessFailure(response.status) && response.status !== 'unavailable') refresh()
      return response
    } catch {
      refresh()
      return { status: 'error' }
    }
  }

  return (
    <AdminClaimsPage
      state={state}
      focusedId={foundItemId}
      onRetry={refresh}
      onReview={review}
      getItemsHref={() => getAdminItemsPath('CLAIM_REQUESTED')}
      getClaimsHref={() => getAdminPath('claims')}
      getHandoversHref={(group, result) => getAdminHandoverPath(group.item.id, result?.handover.id ?? group.handoverId)}
    />
  )
}
