import airpodsImage from '../assets/item-airpods.webp'
import walletImage from '../assets/item-wallet.webp'
import tumblerImage from '../assets/item-tumbler.webp'
import type { FoundCategory, FoundItem } from '../types/foundItem'

export const CATEGORY_LABELS: Record<FoundCategory, string> = {
  electronics: '전자기기',
  wallets: '지갑·카드',
  bags: '가방·지갑류',
  clothing: '의류·잡화',
  other: '기타 물품',
}

const demoStartedAt = Date.now()
const hourInMs = 60 * 60 * 1000

function hoursBeforeDemo(hours: number) {
  return new Date(demoStartedAt - hours * hourInMs).toISOString()
}

export const foundItems: FoundItem[] = [
  {
    id: 'airpods-pro',
    name: '에어팟 프로',
    category: 'electronics',
    building: '인문관',
    locationDetail: '2층',
    registeredAt: hoursBeforeDemo(6),
    image: airpodsImage,
  },
  {
    id: 'black-wallet',
    name: '검정색 지갑',
    category: 'wallets',
    building: '학생회관',
    locationDetail: '1층',
    registeredAt: hoursBeforeDemo(9),
    image: walletImage,
  },
  {
    id: 'tumbler',
    name: '텀블러 (한서대 로고)',
    category: 'other',
    building: '도서관',
    locationDetail: '3층',
    registeredAt: hoursBeforeDemo(12),
    image: tumblerImage,
  },
]

const relativeTime = new Intl.RelativeTimeFormat('ko', { numeric: 'auto' })

export function formatRegisteredAt(registeredAt: string) {
  const elapsedHours = Math.floor((Date.now() - Date.parse(registeredAt)) / hourInMs)

  if (elapsedHours < 1) return '방금 전'
  if (elapsedHours < 24) return relativeTime.format(-elapsedHours, 'hour')
  return relativeTime.format(-Math.floor(elapsedHours / 24), 'day')
}
