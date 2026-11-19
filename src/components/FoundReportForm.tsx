import { useRef, useState, type FormEvent } from 'react'
import { campusBuildings } from '../data/campusBuildings'
import { CATEGORY_LABELS } from '../data/categories'
import { foundReportService } from '../services/foundReports'
import type { FoundReportFields, FoundReportRequest } from '../types/foundReport'
import { LOCATION_DETAIL_MAX_LENGTH, validateFoundReport, type FoundReportErrors } from '../utils/foundReportValidation'
import { formatKoreanDateTimeInput } from '../utils/reportDateTime'
import { FoundPhotoField, type FoundPhotoSelection } from './FoundPhotoField'
import { KoreanDateTime } from './KoreanDateTime'
import { ReportActions } from './ReportActions'
import { ReportField } from './ReportField'

const fieldOrder: (keyof FoundReportFields)[] = [
  'itemName', 'categoryId', 'foundAt', 'buildingId', 'locationDetail', 'photo', 'description',
]

export function FoundReportForm() {
  const [photo, setPhoto] = useState<FoundPhotoSelection>({ status: 'empty' })
  const [errors, setErrors] = useState<FoundReportErrors>({})
  const [locationDetailLength, setLocationDetailLength] = useState(0)
  const [latestDateTime, setLatestDateTime] = useState(() => formatKoreanDateTimeInput(new Date()))
  const [preview, setPreview] = useState<FoundReportRequest | null>(null)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const reviewTitleRef = useRef<HTMLHeadingElement>(null)

  function clearFieldFeedback(field: keyof FoundReportFields) {
    setErrors((current) => current[field] ? { ...current, [field]: undefined } : current)
    setPreview(null)
    setFeedback('')
  }

  function handlePhotoChange(next: FoundPhotoSelection) {
    setPhoto(next)
    clearFieldFeedback('photo')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting || photo.status === 'checking') return

    const form = event.currentTarget
    const data = new FormData(form)
    const read = (field: keyof FoundReportFields) => String(data.get(field) ?? '')
    const now = new Date()
    const validation = validateFoundReport({
      itemName: read('itemName'),
      categoryId: read('categoryId'),
      foundAt: read('foundAt'),
      buildingId: read('buildingId'),
      locationDetail: read('locationDetail'),
      description: read('description'),
      photo: photo.status === 'ready' ? photo.file : null,
    }, now)

    setPreview(null)
    setFeedback('')
    setLatestDateTime(formatKoreanDateTimeInput(now))

    if (validation.status === 'invalid') {
      const nextErrors = { ...validation.errors }
      const dateInput = form.elements.namedItem('foundAt')
      if (dateInput instanceof HTMLInputElement && dateInput.validity.badInput) {
        nextErrors.foundAt = '습득 날짜와 시간을 올바르게 입력해 주세요.'
      }
      if (photo.status === 'invalid') nextErrors.photo = photo.message

      setErrors(nextErrors)
      const firstInvalidField = fieldOrder.find((field) => nextErrors[field])
      const invalidInput = firstInvalidField === 'photo'
        ? form.querySelector('#found-photo-select')
        : firstInvalidField && form.elements.namedItem(firstInvalidField)
      if (invalidInput instanceof HTMLElement) requestAnimationFrame(() => invalidInput.focus())
      return
    }

    setErrors({})
    setIsSubmitting(true)
    try {
      const result = await foundReportService.create(validation.request)
      if (result.status === 'unavailable') {
        setPreview(validation.request)
        setFeedback('데모 미리보기입니다. 입력 정보와 사진은 서버에 저장되지 않았습니다.')
        requestAnimationFrame(() => reviewTitleRef.current?.focus())
      } else {
        window.location.assign('/my?tab=found')
      }
    } catch {
      setFeedback('습득물 등록 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const reviewDetails = preview && [
    ['물품명', preview.itemName],
    ['카테고리', CATEGORY_LABELS[preview.categoryId]],
    ['습득 일시', <KoreanDateTime key="found-at" value={preview.foundAt} />],
    ['습득 장소', campusBuildings.find(({ id }) => id === preview.buildingId)?.name],
    ['세부 위치', preview.locationDetail],
    ['물품 설명', preview.description],
  ] as const

  return (
    <form className="report-form" method="post" onSubmit={handleSubmit} noValidate aria-busy={isSubmitting} aria-describedby="found-report-demo-notice">
      <div className="report-fields">
        <ReportField id="found-item-name" label="물품명" error={errors.itemName} className="report-field--wide" required>
          {(control) => <input {...control} name="itemName" type="text" placeholder="예: 에어팟 프로, 검정색 지갑, 학생증" onChange={() => clearFieldFeedback('itemName')} />}
        </ReportField>

        <ReportField id="found-category" label="카테고리" error={errors.categoryId} required>
          {(control) => (
            <select {...control} name="categoryId" defaultValue="" onChange={() => clearFieldFeedback('categoryId')}>
              <option value="">카테고리 선택</option>
              {Object.entries(CATEGORY_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          )}
        </ReportField>

        <ReportField id="found-at" label="습득 일시" error={errors.foundAt} hint="한국 시간 기준으로 입력해 주세요." required>
          {(control) => (
            <input
              {...control}
              name="foundAt"
              type="datetime-local"
              step={60}
              max={latestDateTime}
              onFocus={() => setLatestDateTime(formatKoreanDateTimeInput(new Date()))}
              onChange={() => clearFieldFeedback('foundAt')}
            />
          )}
        </ReportField>

        <ReportField id="found-building" label="습득 장소 (건물)" error={errors.buildingId} hint="건물 외 장소는 ‘기타’를 선택해 주세요." required>
          {(control) => (
            <select {...control} name="buildingId" defaultValue="" onChange={() => clearFieldFeedback('buildingId')}>
              <option value="">건물 선택</option>
              {campusBuildings.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
            </select>
          )}
        </ReportField>

        <ReportField
          id="found-location-detail"
          label="세부 위치 (선택)"
          hint={`최대 ${LOCATION_DETAIL_MAX_LENGTH}자 · ${locationDetailLength}/${LOCATION_DETAIL_MAX_LENGTH}`}
          error={errors.locationDetail}
        >
          {(control) => (
            <input
              {...control}
              name="locationDetail"
              type="text"
              placeholder="예: 학생회관 1층 입구, 도서관 3층 열람실"
              onChange={(event) => {
                setLocationDetailLength([...event.currentTarget.value].length)
                clearFieldFeedback('locationDetail')
              }}
            />
          )}
        </ReportField>

        <FoundPhotoField selection={photo} onSelectionChange={handlePhotoChange} error={errors.photo} />

        <ReportField
          id="found-description"
          label="물품 설명 (선택)"
          hint="색상이나 스티커처럼 물건을 구별할 수 있는 특징을 적어 주세요."
          error={errors.description}
          className="report-field--wide"
        >
          {(control) => (
            <textarea
              {...control}
              name="description"
              rows={4}
              placeholder="예: 흰색 이어폰이며 충전 케이스에 작은 스티커가 붙어 있습니다."
              onChange={() => clearFieldFeedback('description')}
            />
          )}
        </ReportField>
      </div>

      <div role="status" aria-atomic="true">
        {feedback && <p className="report-feedback">{feedback}</p>}
      </div>

      {preview && reviewDetails && photo.status === 'ready' && photo.file === preview.photo && (
        <section className="report-review" aria-labelledby="found-report-review-title">
          <h2 id="found-report-review-title" ref={reviewTitleRef} tabIndex={-1}>습득 등록 내용 미리보기</h2>
          <dl className="report-review__details">
            {reviewDetails.map(([label, value]) => value && (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <figure className="found-report-review__photo">
            <img src={photo.previewUrl} alt="등록 내용에 포함된 습득물 사진" />
            <figcaption title={preview.photo.name}>{preview.photo.name}</figcaption>
          </figure>
        </section>
      )}

      <ReportActions isSubmitting={isSubmitting || photo.status === 'checking'} />
    </form>
  )
}
