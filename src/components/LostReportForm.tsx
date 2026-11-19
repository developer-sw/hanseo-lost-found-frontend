import { useRef, useState, type FormEvent } from 'react'
import { getMatchResultPath, MATCH_DEMO_PATH } from '../app/matchRoutes'
import { campusBuildings } from '../data/campusBuildings'
import { CATEGORY_LABELS } from '../data/categories'
import { lostReportService } from '../services/lostReports'
import type { LostReportFields, LostReportRequest } from '../types/lostReport'
import type { MyActivityMutationResult, MyLostReport } from '../types/myActivity'
import {
  formatKoreanDateTimeInput,
  LOCATION_DETAIL_MAX_LENGTH,
  validateLostReport,
  type LostReportErrors,
} from '../utils/lostReportValidation'
import { getMyActivityMutationFeedback } from '../utils/myActivityFeedback'
import { ReportActions } from './ReportActions'
import { ReportField } from './ReportField'

interface LostReportFormProps {
  edit?: {
    initial: MyLostReport
    onSave: (request: LostReportRequest) => Promise<MyActivityMutationResult>
    onSaved?: () => void
    noticeId?: string
    returnHref?: string
  }
}

const fieldOrder: (keyof LostReportFields)[] = [
  'itemName', 'categoryId', 'lostAt', 'buildingId', 'locationDetail', 'description',
]

const koreanDateTime = new Intl.DateTimeFormat('ko-KR', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Seoul',
})

export function LostReportForm({ edit }: LostReportFormProps = {}) {
  const initial = edit?.initial
  const returnHref = edit?.returnHref ?? '/my?tab=lost'
  const [errors, setErrors] = useState<LostReportErrors>({})
  const [locationDetailLength, setLocationDetailLength] = useState(() => [...(initial?.locationDetail ?? '')].length)
  const [latestDateTime, setLatestDateTime] = useState(() => formatKoreanDateTimeInput(new Date()))
  const [preview, setPreview] = useState<LostReportRequest | null>(null)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const reviewTitleRef = useRef<HTMLHeadingElement>(null)

  function clearFieldFeedback(field: keyof LostReportFields) {
    setErrors((current) => current[field] ? { ...current, [field]: undefined } : current)
    setPreview(null)
    setFeedback('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    const form = event.currentTarget
    const data = new FormData(form)
    const read = (field: keyof LostReportFields) => String(data.get(field) ?? '')
    const now = new Date()
    const validation = validateLostReport({
      itemName: read('itemName'),
      categoryId: read('categoryId'),
      lostAt: read('lostAt'),
      buildingId: read('buildingId'),
      locationDetail: read('locationDetail'),
      description: read('description'),
    }, now)

    setPreview(null)
    setFeedback('')
    setLatestDateTime(formatKoreanDateTimeInput(now))

    if (validation.status === 'invalid') {
      const nextErrors = { ...validation.errors }
      const dateInput = form.elements.namedItem('lostAt')
      if (dateInput instanceof HTMLInputElement && dateInput.validity.badInput) {
        nextErrors.lostAt = '올바른 분실 날짜와 시간을 입력해 주세요.'
      }

      setErrors(nextErrors)
      const firstInvalidField = fieldOrder.find((field) => nextErrors[field])
      const invalidInput = firstInvalidField && form.elements.namedItem(firstInvalidField)
      if (invalidInput instanceof HTMLElement) requestAnimationFrame(() => invalidInput.focus())
      return
    }

    setErrors({})
    setIsSubmitting(true)
    try {
      if (edit) {
        const result = await edit.onSave(validation.request)
        if (result.status === 'success') {
          if (edit.onSaved) edit.onSaved()
          else window.location.assign(returnHref)
          return
        }
        if (result.status !== 'unavailable') {
          setFeedback(getMyActivityMutationFeedback(result.status))
          return
        }
      } else {
        const result = await lostReportService.create(validation.request)
        if (result.status === 'created') {
          window.location.assign(getMatchResultPath(result.reportId))
          return
        }
      }

      setPreview(validation.request)
      setFeedback(edit
        ? '데모 수정 미리보기입니다. 변경한 내용은 서버에 저장되지 않았습니다.'
        : '데모 미리보기입니다. 입력한 내용은 서버에 저장되지 않았습니다.')
      requestAnimationFrame(() => reviewTitleRef.current?.focus())
    } catch {
      setFeedback(edit ? '신고 수정 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.' : '신고를 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const reviewDetails = preview && [
    ['물품명', preview.itemName],
    ['카테고리', CATEGORY_LABELS[preview.categoryId]],
    ['분실 일시', `${koreanDateTime.format(new Date(preview.lostAt))} (한국 시간)`],
    ['분실 장소', campusBuildings.find(({ id }) => id === preview.buildingId)?.name],
    ['세부 위치', preview.locationDetail],
    ['물품 설명', preview.description],
  ]
  const initialTimestamp = initial ? Date.parse(initial.lostAt) : NaN

  return (
    <form className="report-form" method="post" onSubmit={handleSubmit} noValidate aria-busy={isSubmitting} aria-describedby={edit ? edit.noticeId : 'lost-report-demo-notice'}>
      <div className="report-fields">
        <ReportField id="lost-item-name" label="물품명" error={errors.itemName} className="report-field--wide" required>
          {(control) => <input {...control} name="itemName" type="text" defaultValue={initial?.itemName} placeholder="예: 에어팟 프로, 검정색 지갑, 학생증" onChange={() => clearFieldFeedback('itemName')} />}
        </ReportField>

        <ReportField id="lost-category" label="카테고리" error={errors.categoryId} required>
          {(control) => (
            <select {...control} name="categoryId" defaultValue={initial?.categoryId ?? ''} onChange={() => clearFieldFeedback('categoryId')}>
              <option value="">카테고리 선택</option>
              {Object.entries(CATEGORY_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          )}
        </ReportField>

        <ReportField id="lost-at" label="분실 일시" error={errors.lostAt} hint="한국 시간 기준으로 입력해 주세요." required>
          {(control) => (
            <input
              {...control}
              name="lostAt"
              type="datetime-local"
              defaultValue={Number.isFinite(initialTimestamp) ? formatKoreanDateTimeInput(new Date(initialTimestamp)) : undefined}
              step={60}
              max={latestDateTime}
              onFocus={() => setLatestDateTime(formatKoreanDateTimeInput(new Date()))}
              onChange={() => clearFieldFeedback('lostAt')}
            />
          )}
        </ReportField>

        <ReportField id="lost-building" label="분실 장소 (건물)" error={errors.buildingId} hint="건물 외 장소는 ‘기타’를 선택해 주세요." required>
          {(control) => (
            <select {...control} name="buildingId" defaultValue={initial?.buildingId ?? ''} onChange={() => clearFieldFeedback('buildingId')}>
              <option value="">건물 선택</option>
              {campusBuildings.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
            </select>
          )}
        </ReportField>

        <ReportField
          id="lost-location-detail"
          label="세부 위치 (선택)"
          error={errors.locationDetail}
          hint={`최대 ${LOCATION_DETAIL_MAX_LENGTH}자 · ${locationDetailLength}/${LOCATION_DETAIL_MAX_LENGTH}`}
        >
          {(control) => (
            <input
              {...control}
              name="locationDetail"
              type="text"
              defaultValue={initial?.locationDetail}
              placeholder="예: 2층 강의실 앞, 정문 근처"
              onChange={(event) => {
                setLocationDetailLength([...event.currentTarget.value].length)
                clearFieldFeedback('locationDetail')
              }}
            />
          )}
        </ReportField>

        <ReportField
          id="lost-description"
          label="물품 설명 (선택)"
          hint="색상이나 스티커처럼 물건을 구별할 수 있는 특징을 적어 주세요."
          error={errors.description}
          className="report-field--wide"
        >
          {(control) => (
            <textarea
              {...control}
              name="description"
              defaultValue={initial?.description}
              rows={4}
              placeholder="예: 흰색 에어팟 프로이고 케이스에 작은 스티커가 붙어 있습니다."
              onChange={() => clearFieldFeedback('description')}
            />
          )}
        </ReportField>
      </div>

      <div role="status" aria-atomic="true">
        {feedback && <p className="report-feedback">{feedback}</p>}
      </div>

      {reviewDetails && (
        <section className="report-review" aria-labelledby="lost-report-review-title">
          <h2 id="lost-report-review-title" ref={reviewTitleRef} tabIndex={-1}>{edit ? '분실 신고 수정 미리보기' : '신고 내용 미리보기'}</h2>
          <dl className="report-review__details">
            {reviewDetails.map(([label, value]) => value && (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          {!edit && <a className="secondary-link report-review__demo-link" href={MATCH_DEMO_PATH}>데모 매칭 결과 보기</a>}
        </section>
      )}

      <ReportActions isSubmitting={isSubmitting} cancelHref={edit ? returnHref : undefined} submitLabel={edit ? '수정 내용 확인' : undefined} />
    </form>
  )
}
