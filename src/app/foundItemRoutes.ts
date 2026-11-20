import type { MatchDemoScenario } from '../data/demoMatches'
import { getMatchDemoScenario, getMatchedFoundItemPath, getMatchResultPath, MATCH_DEMO_PATH } from './matchRoutes'
import { getMyActivityPath } from './myActivityRoutes'

type MyFoundDetailTab = 'found' | 'claims'

export type FoundItemClaimContext =
  | { source: 'search' }
  | { source: 'match-demo' }
  | { source: 'match'; lostReportId: string }

export interface FoundItemNavigation {
  backHref: string
  backLabel: string
  claimContext: FoundItemClaimContext
  myTab?: MyFoundDetailTab
}

type FoundItemLinkContext =
  | { source: 'search'; params: URLSearchParams }
  | { source: 'match-demo'; scenario: MatchDemoScenario }
  | { source: 'match'; lostReportId: string }
  | { source: 'my'; tab: MyFoundDetailTab; account?: boolean }

function isPathId(value: string | null): value is string {
  return Boolean(value && value.trim() === value && value !== '.' && value !== '..' && !/[\\/]/.test(value))
}

export function getFoundItemId(pathname: string): string | undefined {
  const match = /^\/found\/([^/?#]+)$/.exec(pathname)
  if (!match) return undefined

  try {
    const id = decodeURIComponent(match[1])
    return isPathId(id) ? id : undefined
  } catch {
    return undefined
  }
}

export function getFoundSearchParams(params: URLSearchParams) {
  const search = new URLSearchParams()
  for (const key of ['q', 'building', 'category']) {
    const value = params.get(key)?.trim()
    if (value) search.set(key, value)
  }
  return search
}

function withSearch(path: string, params: URLSearchParams) {
  return params.size > 0 ? `${path}?${params}` : path
}

export function getFoundItemPath(id: string, context?: FoundItemLinkContext) {
  if (context?.source === 'match') return getMatchedFoundItemPath(id, context.lostReportId)

  const path = getMatchedFoundItemPath(id)
  if (context?.source === 'my') {
    const params = new URLSearchParams({ source: 'my', tab: context.tab })
    if (context.account) params.set('view', 'account')
    return withSearch(path, params)
  }
  if (context?.source === 'search') return withSearch(path, getFoundSearchParams(context.params))
  if (context?.source === 'match-demo') {
    return withSearch(path, new URLSearchParams({ source: 'match-demo', scenario: context.scenario }))
  }
  return path
}

export function getFoundItemNavigation(params: URLSearchParams): FoundItemNavigation {
  const source = params.get('source')
  if (source === 'my') {
    const tab = params.get('tab')
    if (tab === 'found' || tab === 'claims') {
      return {
        backHref: getMyActivityPath(tab, { account: params.get('view') === 'account' }),
        backLabel: tab === 'found' ? '내 습득 신고로 돌아가기' : '내 수령 신청으로 돌아가기',
        claimContext: { source: 'search' },
        myTab: tab,
      }
    }
  } else if (source === 'match-demo') {
    const scenario = getMatchDemoScenario(params.get('scenario'))
    if (scenario) {
      return {
        backHref: withSearch(MATCH_DEMO_PATH, new URLSearchParams({ scenario })),
        backLabel: '데모 매칭 결과로 돌아가기',
        claimContext: { source: 'match-demo' },
      }
    }
  } else {
    const lostReportId = params.get('lostReportId')
    if (isPathId(lostReportId)) {
      return {
        backHref: getMatchResultPath(lostReportId),
        backLabel: '매칭 결과로 돌아가기',
        claimContext: { source: 'match', lostReportId },
      }
    }
  }

  return {
    backHref: withSearch('/found', getFoundSearchParams(params)),
    backLabel: '습득물 목록으로 돌아가기',
    claimContext: { source: 'search' },
  }
}
