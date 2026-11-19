import type { MatchDemoScenario } from '../data/demoMatches'
import { getMatchDemoScenario, getMatchedFoundItemPath, getMatchResultPath, MATCH_DEMO_PATH } from './matchRoutes'

export type FoundItemClaimContext =
  | { source: 'search' }
  | { source: 'match-demo' }
  | { source: 'match'; lostReportId: string }

export interface FoundItemNavigation {
  backHref: string
  backLabel: string
  claimContext: FoundItemClaimContext
}

type FoundItemLinkContext =
  | { source: 'search'; params: URLSearchParams }
  | { source: 'match-demo'; scenario: MatchDemoScenario }
  | { source: 'match'; lostReportId: string }

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
  if (params.get('view') === 'recent') search.set('view', 'recent')
  return search
}

function withSearch(path: string, params: URLSearchParams) {
  return params.size > 0 ? `${path}?${params}` : path
}

export function getFoundItemPath(id: string, context?: FoundItemLinkContext) {
  if (context?.source === 'match') return getMatchedFoundItemPath(id, context.lostReportId)

  const path = getMatchedFoundItemPath(id)
  if (context?.source === 'search') return withSearch(path, getFoundSearchParams(context.params))
  if (context?.source === 'match-demo') {
    return withSearch(path, new URLSearchParams({ source: 'match-demo', scenario: context.scenario }))
  }
  return path
}

export function getFoundItemNavigation(params: URLSearchParams): FoundItemNavigation {
  if (params.get('source') === 'match-demo') {
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
