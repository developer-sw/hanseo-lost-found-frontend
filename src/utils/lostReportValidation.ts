import { campusBuildings } from '../data/campusBuildings'
import { CATEGORY_LABELS } from '../data/categories'
import type { FoundCategory } from '../types/foundItem'
import type { LostReportFields, LostReportRequest } from '../types/lostReport'

export const LOCATION_DETAIL_MAX_LENGTH = 100

export type LostReportErrors = Partial<Record<keyof LostReportFields, string>>

type LostReportValidationResult =
  | { status: 'invalid'; errors: LostReportErrors }
  | { status: 'valid'; request: LostReportRequest }

const koreaOffsetMs = 9 * 60 * 60 * 1000
const dateTimeInputPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/

export function formatKoreanDateTimeInput(date: Date) {
  return new Date(date.getTime() + koreaOffsetMs).toISOString().slice(0, 16)
}

function parseKoreanDateTimeInput(value: string) {
  if (!dateTimeInputPattern.test(value) || value.startsWith('0000')) return undefined

  const timestamp = Date.parse(`${value}:00Z`) - koreaOffsetMs
  if (!Number.isFinite(timestamp) || formatKoreanDateTimeInput(new Date(timestamp)) !== value) return undefined

  return timestamp
}

function isFoundCategory(categoryId: string): categoryId is FoundCategory {
  return Object.hasOwn(CATEGORY_LABELS, categoryId)
}

export function validateLostReport(fields: LostReportFields, now = new Date()): LostReportValidationResult {
  const errors: LostReportErrors = {}
  const itemName = fields.itemName.trim()
  const categoryId = isFoundCategory(fields.categoryId) ? fields.categoryId : undefined
  const lostTimestamp = parseKoreanDateTimeInput(fields.lostAt)

  if (!itemName) errors.itemName = '물품명을 입력해 주세요.'
  if (!categoryId) errors.categoryId = '카테고리를 선택해 주세요.'

  if (!fields.lostAt) {
    errors.lostAt = '분실 일시를 입력해 주세요.'
  } else if (lostTimestamp === undefined) {
    errors.lostAt = '분실 날짜와 시간을 올바르게 입력해 주세요.'
  } else if (lostTimestamp > now.getTime()) {
    errors.lostAt = '분실 일시는 현재보다 나중일 수 없습니다.'
  }

  if (!campusBuildings.some(({ id }) => id === fields.buildingId)) {
    errors.buildingId = '분실 장소의 건물을 선택해 주세요.'
  }

  if ([...fields.locationDetail].length > LOCATION_DETAIL_MAX_LENGTH) {
    errors.locationDetail = `세부 위치는 ${LOCATION_DETAIL_MAX_LENGTH}자 이내로 입력해 주세요.`
  }

  if (!categoryId || lostTimestamp === undefined || Object.keys(errors).length > 0) {
    return { status: 'invalid', errors }
  }

  const locationDetail = fields.locationDetail.trim()
  const description = fields.description.trim()

  return {
    status: 'valid',
    request: {
      itemName,
      categoryId,
      lostAt: new Date(lostTimestamp).toISOString(),
      buildingId: fields.buildingId,
      ...(locationDetail ? { locationDetail } : {}),
      ...(description ? { description } : {}),
    },
  }
}
