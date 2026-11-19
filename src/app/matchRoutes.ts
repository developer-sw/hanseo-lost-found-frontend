import { MATCH_DEMO_SCENARIOS, type MatchDemoScenario } from '../data/demoMatches'

export const MATCH_DEMO_PATH = '/report/lost/matches/demo'

export function getMatchDemoScenario(value: string | null): MatchDemoScenario | undefined {
  return value && Object.hasOwn(MATCH_DEMO_SCENARIOS, value) ? value as MatchDemoScenario : undefined
}

export function getMatchResultPath(reportId: string) {
  return `/report/lost/${encodeURIComponent(reportId)}/matches`
}

export function getMatchReportId(pathname: string) {
  const match = /^\/report\/lost\/([^/]+)\/matches$/.exec(pathname)
  if (!match) return undefined

  try {
    return decodeURIComponent(match[1])
  } catch {
    return undefined
  }
}

export function getMatchedFoundItemPath(foundItemId: string, reportId?: string) {
  const path = `/found/${encodeURIComponent(foundItemId)}`
  return reportId ? `${path}?${new URLSearchParams({ lostReportId: reportId })}` : path
}
