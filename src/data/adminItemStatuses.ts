import type { IconName } from '../components/Icon'
import type { FoundItemStatus } from '../types/foundItem'

export const ADMIN_ITEM_STATUSES = [
  { status: 'STORED', label: '보관중', icon: 'box' },
  { status: 'CLAIM_REQUESTED', label: '수령신청', icon: 'clipboard' },
  { status: 'AWAITING_PICKUP', label: '수령대기', icon: 'clock' },
  { status: 'CLAIMED', label: '수령완료', icon: 'circle-check' },
] as const satisfies readonly { status: FoundItemStatus; label: string; icon: IconName }[]
