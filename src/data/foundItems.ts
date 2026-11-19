import airpodsImage from '../assets/item-airpods.webp'
import earbudsCaseImage from '../assets/item-earbud-charging-case.webp'
import walletImage from '../assets/item-wallet.webp'
import tumblerImage from '../assets/item-tumbler.webp'
import wirelessEarbudsImage from '../assets/item-wireless-earbuds.webp'
import type { FoundItem } from '../types/foundItem'

export { CATEGORY_LABELS } from './categories'

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
    building: '인문사회관',
    locationDetail: '2층',
    foundAt: '2026-11-17T05:40:00.000Z',
    registeredAt: hoursBeforeDemo(6),
    image: airpodsImage,
  },
  {
    id: 'black-wallet',
    name: '검정색 지갑',
    category: 'wallets',
    building: '학생회관',
    locationDetail: '1층',
    foundAt: '2026-11-18T01:30:00.000Z',
    registeredAt: hoursBeforeDemo(9),
    image: walletImage,
  },
  {
    id: 'tumbler',
    name: '텀블러 (한서대 로고)',
    category: 'other',
    building: '도서관',
    locationDetail: '3층',
    foundAt: '2026-11-18T00:10:00.000Z',
    registeredAt: hoursBeforeDemo(12),
    image: tumblerImage,
  },
  {
    id: 'white-wireless-earbuds',
    name: '흰색 무선 이어폰 (충전 케이스 포함)',
    category: 'electronics',
    building: '연암도서관',
    locationDetail: '1층 열람실',
    foundAt: '2026-11-18T02:15:00.000Z',
    registeredAt: hoursBeforeDemo(15),
    image: wirelessEarbudsImage,
  },
  {
    id: 'black-bluetooth-earbud-case',
    name: '검정색 블루투스 이어폰 충전 케이스',
    category: 'electronics',
    building: '기타',
    locationDetail: '정문 근처',
    foundAt: '2026-11-16T07:20:00.000Z',
    registeredAt: hoursBeforeDemo(18),
    image: earbudsCaseImage,
  },
]

const relativeTime = new Intl.RelativeTimeFormat('ko', { numeric: 'auto' })

export function formatRegisteredAt(registeredAt: string) {
  const elapsedHours = Math.floor((Date.now() - Date.parse(registeredAt)) / hourInMs)

  if (elapsedHours < 1) return '방금 전'
  if (elapsedHours < 24) return relativeTime.format(-elapsedHours, 'hour')
  return relativeTime.format(-Math.floor(elapsedHours / 24), 'day')
}
