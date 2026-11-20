import airpodsImage from '../assets/item-airpods.webp'
import earbudsCaseImage from '../assets/item-earbud-charging-case.webp'
import walletImage from '../assets/item-wallet.webp'
import tumblerImage from '../assets/item-tumbler.webp'
import wirelessEarbudsImage from '../assets/item-wireless-earbuds.webp'
import type { FoundItem, FoundItemDetail } from '../types/foundItem'

export { CATEGORY_LABELS } from './categories'

const hourInMs = 60 * 60 * 1000

export const demoFoundItemDetails: readonly FoundItemDetail[] = [
  {
    id: 'airpods-pro',
    name: '에어팟 프로',
    category: 'electronics',
    building: '인문사회관',
    locationDetail: '2층',
    foundAt: '2026-11-17T05:40:00.000Z',
    registeredAt: '2026-11-19T10:00:00.000Z',
    image: airpodsImage,
    status: 'STORED',
    description: '흰색 충전 케이스와 이어버드가 함께 있습니다.',
  },
  {
    id: 'black-wallet',
    name: '검정색 지갑',
    category: 'wallets',
    building: '학생회관',
    locationDetail: '1층',
    foundAt: '2026-11-18T01:30:00.000Z',
    registeredAt: '2026-11-19T07:00:00.000Z',
    image: walletImage,
    status: 'AWAITING_PICKUP',
    description: '덮개에 금색 단추가 달린 검정색 지갑입니다.',
  },
  {
    id: 'tumbler',
    name: '텀블러 (한서대 로고)',
    category: 'other',
    building: '도서관',
    locationDetail: '3층',
    foundAt: '2026-11-18T00:10:00.000Z',
    registeredAt: '2026-11-19T04:00:00.000Z',
    image: tumblerImage,
    status: 'CLAIMED',
  },
  {
    id: 'white-wireless-earbuds',
    name: '흰색 무선 이어폰 (충전 케이스 포함)',
    category: 'electronics',
    building: '연암도서관',
    locationDetail: '1층 열람실',
    foundAt: '2026-11-18T02:15:00.000Z',
    registeredAt: '2026-11-19T01:00:00.000Z',
    image: wirelessEarbudsImage,
    status: 'CLAIM_REQUESTED',
    description: '흰색 이어버드 두 개와 둥근 충전 케이스가 함께 있습니다.',
  },
  {
    id: 'black-bluetooth-earbud-case',
    name: '검정색 블루투스 이어폰 충전 케이스',
    category: 'electronics',
    building: '기타',
    locationDetail: '정문 근처',
    foundAt: '2026-11-16T07:20:00.000Z',
    registeredAt: '2026-11-18T22:00:00.000Z',
    image: earbudsCaseImage,
    status: 'STORED',
    description: '검정색 충전 케이스이며 이어버드는 들어 있지 않습니다.',
  },
]

export const foundItems: FoundItem[] = demoFoundItemDetails.map(({
  status: _status,
  description: _description,
  claimEligibility: _claimEligibility,
  ...item
}) => item)

const relativeTime = new Intl.RelativeTimeFormat('ko', { numeric: 'auto' })

export function formatRegisteredAt(registeredAt: string) {
  const elapsedHours = Math.floor((Date.now() - Date.parse(registeredAt)) / hourInMs)

  if (elapsedHours < 1) return '방금 전'
  if (elapsedHours < 24) return relativeTime.format(-elapsedHours, 'hour')
  return relativeTime.format(-Math.floor(elapsedHours / 24), 'day')
}
