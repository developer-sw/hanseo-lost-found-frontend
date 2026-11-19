import { campusBuildings } from '../data/campusBuildings'
import { CATEGORY_LABELS } from '../data/categories'
import type { FoundCategory } from '../types/foundItem'
import type { FoundReportFields, FoundReportRequest } from '../types/foundReport'
import type { FoundReportUpdateRequest } from '../types/myActivity'
import { LOCATION_DETAIL_MAX_LENGTH } from './lostReportValidation'
import { parseKoreanDateTimeInput } from './reportDateTime'

export { LOCATION_DETAIL_MAX_LENGTH } from './lostReportValidation'

export type FoundReportErrors = Partial<Record<keyof FoundReportFields, string>>

type FoundReportValidationResult<Request> =
  | { status: 'invalid'; errors: FoundReportErrors }
  | { status: 'valid'; request: Request }

function isFoundCategory(categoryId: string): categoryId is FoundCategory {
  return Object.hasOwn(CATEGORY_LABELS, categoryId)
}

export function validateFoundReport(fields: FoundReportFields, now?: Date): FoundReportValidationResult<FoundReportRequest>
export function validateFoundReport(fields: FoundReportFields, now: Date, retainExistingPhoto: boolean): FoundReportValidationResult<FoundReportUpdateRequest>
export function validateFoundReport(fields: FoundReportFields, now = new Date(), retainExistingPhoto = false): FoundReportValidationResult<FoundReportUpdateRequest> {
  const errors: FoundReportErrors = {}
  const itemName = fields.itemName.trim()
  const categoryId = isFoundCategory(fields.categoryId) ? fields.categoryId : undefined
  const foundTimestamp = parseKoreanDateTimeInput(fields.foundAt)
  const { photo } = fields

  if (!itemName) errors.itemName = '물품명을 입력해 주세요.'
  if (!categoryId) errors.categoryId = '카테고리를 선택해 주세요.'

  if (!fields.foundAt) {
    errors.foundAt = '습득 일시를 입력해 주세요.'
  } else if (foundTimestamp === undefined) {
    errors.foundAt = '습득 날짜와 시간을 올바르게 입력해 주세요.'
  } else if (foundTimestamp > now.getTime()) {
    errors.foundAt = '습득 일시는 현재보다 나중일 수 없습니다.'
  }

  if (!campusBuildings.some(({ id }) => id === fields.buildingId)) {
    errors.buildingId = '습득 장소의 건물을 선택해 주세요.'
  }

  if (!photo && !retainExistingPhoto) errors.photo = '습득물 사진을 선택해 주세요.'

  if ([...fields.locationDetail].length > LOCATION_DETAIL_MAX_LENGTH) {
    errors.locationDetail = `세부 위치는 ${LOCATION_DETAIL_MAX_LENGTH}자 이내로 입력해 주세요.`
  }

  if (!categoryId || foundTimestamp === undefined || Object.keys(errors).length > 0) {
    return { status: 'invalid', errors }
  }

  const locationDetail = fields.locationDetail.trim()
  const description = fields.description.trim()

  return {
    status: 'valid',
    request: {
      itemName,
      categoryId,
      foundAt: new Date(foundTimestamp).toISOString(),
      buildingId: fields.buildingId,
      ...(locationDetail ? { locationDetail } : {}),
      ...(description ? { description } : {}),
      ...(photo ? { photo } : {}),
    },
  }
}
