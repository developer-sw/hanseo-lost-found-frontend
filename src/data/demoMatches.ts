import type { MatchCandidate, MatchReportSummary, MatchViewState } from '../types/match'
import { foundItems } from './foundItems'

export const MATCH_DEMO_SCENARIOS = {
  three: '추천 3건',
  two: '추천 2건',
  one: '추천 1건',
  empty: '추천 없음',
  loading: '로딩 중',
  error: '요청 오류',
  'not-found': '신고 없음',
  forbidden: '접근 제한',
  unavailable: 'API 미연결',
} as const

export type MatchDemoScenario = keyof typeof MATCH_DEMO_SCENARIOS

const demoReport: MatchReportSummary = {
  itemName: '에어팟 프로 (검정색 케이스)',
  categoryId: 'electronics',
  lostAt: '2026-11-17T04:30:00.000Z',
  buildingName: '인문사회관',
  locationDetail: '2층 강의실 앞',
  status: 'OPEN',
}

// The order, scores and reasons are demo fixtures. Item facts come from the shared catalog.
const demoDetails: readonly Pick<MatchCandidate, 'id' | 'score' | 'reasons'>[] = [
  {
    id: 'airpods-pro',
    score: 80,
    reasons: ['‘에어팟 프로’ 부분 일치', '카테고리 일치', '건물 일치'],
  },
  {
    id: 'white-wireless-earbuds',
    score: 60,
    reasons: ['‘케이스’ 부분 일치', '카테고리 일치'],
  },
  {
    id: 'black-bluetooth-earbud-case',
    score: 40,
    reasons: ['‘검정색’ 부분 일치', '‘케이스’ 부분 일치'],
  },
]

const demoCandidates: readonly MatchCandidate[] = demoDetails.flatMap((details) => {
  const item = foundItems.find(({ id }) => id === details.id)
  if (!item) return []

  const { registeredAt: _registeredAt, ...foundItem } = item
  return [{ ...foundItem, ...details }]
})

const candidateCounts = { three: 3, two: 2, one: 1, empty: 0 } as const

export function getDemoMatchState(scenario: MatchDemoScenario): MatchViewState {
  switch (scenario) {
    case 'three':
    case 'two':
    case 'one':
    case 'empty':
      return {
        status: 'ready',
        result: { report: demoReport, candidates: demoCandidates.slice(0, candidateCounts[scenario]) },
      }
    default:
      return { status: scenario }
  }
}
