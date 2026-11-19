import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
import type { FoundItemClaimContext } from '../app/foundItemRoutes'
import { CATEGORY_LABELS } from '../data/categories'
import { demoClaimReportOptions } from '../data/demoClaimReports'
import { demoMatchReport } from '../data/demoMatches'
import { claimRequestService } from '../services/claimRequests'
import type { CreateClaimRequestResult, ListLinkableLostReportsResult } from '../types/claimRequest'
import type { FoundItemDetail } from '../types/foundItem'
import { OWNERSHIP_PROOF_MAX_LENGTH, validateOwnershipProof } from '../utils/claimRequestValidation'
import { Icon } from './Icon'
import { KoreanDateTime } from './KoreanDateTime'
import { ReportField } from './ReportField'
import '../styles/report.css'
import '../styles/claim-request.css'

interface ClaimRequestDialogProps {
  item: FoundItemDetail
  statusBadge: ReactNode
  context: FoundItemClaimContext
  source: 'demo' | 'api'
  onClose: () => void
  onCreated?: (result: Extract<CreateClaimRequestResult, { status: 'created' }>) => void
}

const reportMessages = {
  loading: '연결할 수 있는 분실 신고를 확인하고 있습니다.',
  unavailable: '분실 신고를 확인하려면 서버 연결이 필요합니다.',
  'sign-in-required': '본인의 분실 신고를 연결하려면 로그인해 주세요.',
  forbidden: '분실 신고를 조회할 권한이 없습니다.',
  error: '분실 신고를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
}

const submissionMessages = {
  unavailable: '수령 신청 API가 아직 연결되지 않았습니다.',
  'sign-in-required': '학생 계정으로 로그인해 주세요.',
  forbidden: '이 물품에 수령을 신청할 권한이 없습니다.',
  'not-found': '신청할 습득물을 찾을 수 없습니다.',
  conflict: '이미 신청한 물품이거나 신청 가능한 상태가 변경되었습니다.',
  error: '수령 신청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.',
}

export function ClaimRequestDialog({ item, statusBadge, context, source, onClose, onCreated }: ClaimRequestDialogProps) {
  const dialogId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const proofRef = useRef<HTMLTextAreaElement>(null)
  const previewTitleRef = useRef<HTMLHeadingElement>(null)
  const [proof, setProof] = useState('')
  const [proofError, setProofError] = useState('')
  const [selectedReportKey, setSelectedReportKey] = useState('')
  const [reports, setReports] = useState<ListLinkableLostReportsResult | { status: 'loading' }>({ status: 'loading' })
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  const [failedImage, setFailedImage] = useState<string>()

  const isDemo = source === 'demo' || context.source === 'match-demo'
  const verifiedReports = !isDemo && reports.status === 'ready' ? reports.reports.filter(({ status }) => status === 'OPEN') : []
  const options = isDemo
    ? demoClaimReportOptions
    : verifiedReports.map((report) => ({ key: report.lostItemId, report }))

  const reportKey = context.source === 'match' ? context.lostReportId : selectedReportKey
  const verifiedReport = verifiedReports.find(({ lostItemId }) => lostItemId === reportKey)
  const linkedReport = context.source === 'match-demo' ? demoMatchReport
    : context.source === 'search' ? options.find(({ key }) => key === selectedReportKey)?.report
    : verifiedReport
  const isMatchUnverified = !isDemo && context.source === 'match' && !verifiedReport
  const reportStateMessage = reports.status === 'ready'
    ? '본인의 진행 중인 분실 신고로 확인되지 않았습니다.'
    : reportMessages[reports.status]

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (!dialog.open) dialog.showModal()
    closeButtonRef.current?.focus({ preventScroll: true })

    const viewport = window.visualViewport
    if (!viewport) return

    const updateViewport = () => {
      dialog.style.setProperty('--claim-dialog-viewport-height', `${viewport.height}px`)
      dialog.style.setProperty('--claim-dialog-viewport-top', `${viewport.offsetTop}px`)
    }

    updateViewport()
    viewport.addEventListener('resize', updateViewport)
    viewport.addEventListener('scroll', updateViewport)
    return () => {
      viewport.removeEventListener('resize', updateViewport)
      viewport.removeEventListener('scroll', updateViewport)
    }
  }, [])

  useEffect(() => {
    if (isDemo) return

    let active = true
    claimRequestService.listLinkableLostReports().then(
      (result) => { if (active) setReports(result) },
      () => { if (active) setReports({ status: 'error' }) },
    )

    return () => { active = false }
  }, [isDemo])

  function closeDialog() {
    dialogRef.current?.close()
  }

  function keepTabFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return

    const controls = event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), textarea:not(:disabled), select:not(:disabled)')
    const first = controls[0]
    const last = controls[controls.length - 1]
    const current = event.shiftKey ? first : last
    const next = event.shiftKey ? last : first

    if (next && event.target === current) {
      event.preventDefault()
      next.focus()
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting || isMatchUnverified) return

    const validation = validateOwnershipProof(proof)
    setSubmitError('')
    if (validation.status === 'invalid') {
      setProofError(validation.message)
      requestAnimationFrame(() => proofRef.current?.focus())
      return
    }

    setProofError('')
    if (isDemo) {
      setIsPreview(true)
      requestAnimationFrame(() => previewTitleRef.current?.focus())
      return
    }

    setIsSubmitting(true)
    try {
      const result = await claimRequestService.create({
        foundItemId: item.id,
        lostItemId: verifiedReport?.lostItemId ?? null,
        ownershipProof: validation.ownershipProof,
      })
      if (!dialogRef.current?.open) return
      if (result.status === 'created') {
        closeDialog()
        onCreated?.(result)
      } else {
        setSubmitError(submissionMessages[result.status])
      }
    } catch {
      if (dialogRef.current?.open) setSubmitError(submissionMessages.error)
    } finally {
      if (dialogRef.current?.open) setIsSubmitting(false)
    }
  }

  const searchHint = isDemo ? '데모용 예시 분실 신고만 표시합니다.'
    : reports.status !== 'ready' ? reportStateMessage
    : options.length === 0 ? '연결 가능한 분실 신고가 없습니다. 신고를 연결하지 않고 신청할 수 있습니다.'
    : '진행 중인 본인 신고 중 하나를 선택할 수 있습니다.'

  return (
    <dialog
      className="claim-dialog"
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${dialogId}-title`}
      aria-describedby={`${dialogId}-description`}
      onClose={onClose}
      onKeyDown={keepTabFocus}
    >
      <div className="claim-dialog__shell">
        <header className="claim-dialog__header">
          <h2 id={`${dialogId}-title`}>수령 신청</h2>
          <button className="claim-dialog__close" type="button" ref={closeButtonRef} aria-label="수령 신청 닫기" onClick={closeDialog}>
            <Icon name="x" size={22} />
          </button>
        </header>

        <div className="claim-dialog__content">
          <p id={`${dialogId}-description`} className="claim-dialog__intro">
            이 물건이 본인의 것이라면 소유 사실을 확인할 수 있는 정보를 작성해 주세요.
          </p>

          <div className="claim-dialog__summary">
            {item.image && item.image !== failedImage ? (
              <img className="claim-dialog__thumbnail" src={item.image} alt={`${item.name} 사진`} onError={() => setFailedImage(item.image)} />
            ) : (
              <span className="claim-dialog__thumbnail" role="img" aria-label="대표 사진 없음"><Icon name="box" size={26} /></span>
            )}
            <div className="claim-dialog__item">
              <strong>{item.name}</strong>
              <p>{CATEGORY_LABELS[item.category]}</p>
              {statusBadge}
            </div>
          </div>

          {isPreview ? (
            <section className="claim-dialog__preview" aria-labelledby={`${dialogId}-preview-title`}>
              <h3 id={`${dialogId}-preview-title`} ref={previewTitleRef} tabIndex={-1}>신청 내용 미리보기</h3>
              <p className="claim-dialog__notice">데모 미리보기입니다. 신청 내용은 제출되거나 저장되지 않았습니다.</p>
              <dl>
                <dt>습득물</dt><dd>{item.name}</dd>
                <dt>소유 증빙</dt><dd>{proof.trim()}</dd>
                <dt>연결된 분실 신고</dt><dd>{linkedReport ? `${linkedReport.itemName} (예시)` : '연결하지 않음'}</dd>
              </dl>
            </section>
          ) : (
            <form id={`${dialogId}-form`} method="post" onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
              <div className="claim-dialog__fields">
                <ReportField
                  id={`${dialogId}-proof`}
                  label="소유 증빙"
                  error={proofError}
                  hint="물건의 특징, 분실 당시 상황 등 본인 소유임을 확인할 수 있는 정보를 작성해 주세요."
                  required
                >
                  {(control) => (
                    <>
                      <textarea
                        {...control}
                        ref={proofRef}
                        name="ownershipProof"
                        value={proof}
                        rows={4}
                        placeholder="예: 이어폰 충전 케이스 안쪽에 작은 흠집이 있어요."
                        aria-describedby={`${control['aria-describedby']} ${dialogId}-proof-count`}
                        onChange={(event) => {
                          setProof(event.currentTarget.value)
                          setProofError('')
                          setSubmitError('')
                        }}
                      />
                      <p className="claim-dialog__count" id={`${dialogId}-proof-count`}>{[...proof].length}/{OWNERSHIP_PROOF_MAX_LENGTH}자</p>
                    </>
                  )}
                </ReportField>

                {context.source === 'search' ? (
                  <ReportField id={`${dialogId}-report`} label="분실 신고 연결 (선택)" hint={searchHint}>
                    {(control) => (
                      <select
                        {...control}
                        value={selectedReportKey}
                        onChange={(event) => {
                          setSelectedReportKey(event.currentTarget.value)
                          setSubmitError('')
                        }}
                      >
                        <option value="">연결하지 않음</option>
                        {options.map(({ key, report }) => <option key={key} value={key}>{report.itemName} · {report.buildingName}</option>)}
                      </select>
                    )}
                  </ReportField>
                ) : (
                  <div className="report-field">
                    <strong>연결되는 분실 신고</strong>
                    <div className="claim-dialog__linked" role="status">
                      {linkedReport ? (
                        <>
                          <strong>{linkedReport.itemName}{isDemo && ' (예시)'}</strong>
                          <p>{linkedReport.buildingName} · <KoreanDateTime value={linkedReport.lostAt} /></p>
                          <p>{isDemo ? '자동 연결을 확인하는 예시 분실 신고입니다.' : '자동으로 연결됩니다.'}</p>
                        </>
                      ) : (
                        <p>{isDemo ? reportMessages.unavailable : reportStateMessage}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <aside className="claim-dialog__notice">
                <p>신청 내용은 관리자가 확인하며, 다른 학생도 동일한 습득물에 신청할 수 있습니다.</p>
                <p>관리자가 소유 증빙을 비교하여 주인 한 명을 확정합니다.</p>
                {isDemo && <p>데모에서는 서버에 제출하지 않고 입력 내용만 확인합니다.</p>}
              </aside>
              <div role="status" aria-atomic="true">
                {submitError && <p className="claim-dialog__notice claim-dialog__notice--error">{submitError}</p>}
              </div>
            </form>
          )}
        </div>

        <div className="claim-dialog__actions">
          {isPreview ? (
            <>
              <button
                className="secondary-link"
                type="button"
                onClick={() => {
                  setIsPreview(false)
                  requestAnimationFrame(() => proofRef.current?.focus())
                }}
              >수정하기</button>
              <button className="primary-link" type="button" onClick={closeDialog}>확인</button>
            </>
          ) : (
            <>
              <button className="secondary-link" type="button" onClick={closeDialog}>취소</button>
              <button className="primary-link" type="submit" form={`${dialogId}-form`} disabled={isSubmitting || isMatchUnverified}>
                {isSubmitting ? '신청 내용 확인 중' : '수령 신청하기'}
              </button>
            </>
          )}
        </div>
      </div>
    </dialog>
  )
}
