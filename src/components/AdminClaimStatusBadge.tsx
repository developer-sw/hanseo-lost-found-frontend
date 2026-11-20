import type { ClaimRequestStatus } from '../types/claimRequest'
import { Icon, type IconName } from './Icon'

const statuses: Record<ClaimRequestStatus, { label: string; icon: IconName }> = {
  PENDING: { label: '대기', icon: 'clock' },
  APPROVED: { label: '주인 확정', icon: 'shield-check' },
  REJECTED: { label: '거절', icon: 'x' },
  CANCELLED: { label: '취소', icon: 'x' },
  COMPLETED: { label: '수령완료', icon: 'circle-check' },
}

export function AdminClaimStatusBadge({ status }: { status: ClaimRequestStatus }) {
  const { label, icon } = statuses[status]

  return (
    <span className="admin-claim-badge" data-status={status}>
      <Icon name={icon} size={15} />
      <span className="sr-only">신청 상태 </span>{label}
    </span>
  )
}
