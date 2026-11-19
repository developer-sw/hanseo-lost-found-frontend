import type { FoundCategory, FoundItem } from './foundItem'

export interface MatchCandidate extends Omit<FoundItem, 'registeredAt'> {
  score: number
  reasons?: readonly string[]
}

export interface MatchReportSummary {
  itemName: string
  categoryId: FoundCategory
  lostAt: string
  buildingName: string
  locationDetail?: string
  status: 'OPEN' | 'CLOSED'
}

export interface MatchResultContent {
  report: MatchReportSummary
  candidates: readonly MatchCandidate[]
}

export interface MatchResult extends MatchResultContent {
  reportId: string
}

type MatchFailure = { status: 'error' | 'not-found' | 'forbidden' | 'unavailable' }

export type MatchViewState =
  | { status: 'ready'; result: MatchResultContent }
  | { status: 'loading' }
  | MatchFailure

export type MatchRequestResult =
  | { status: 'ready'; result: MatchResult }
  | MatchFailure
