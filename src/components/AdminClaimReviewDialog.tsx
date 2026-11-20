import { useEffect, useId, useRef, useState } from 'react'
import type { AdminClaim, AdminClaimReviewAction } from '../types/adminClaims'

interface AdminClaimReviewDialogProps {
  action: AdminClaimReviewAction
  itemName: string
  claim: AdminClaim
  otherPendingCount: number
  demo: boolean
  onConfirm: () => Promise<void>
  onClose: () => void
}

export function AdminClaimReviewDialog({
  action, itemName, claim, otherPendingCount, demo, onConfirm, onClose,
}: AdminClaimReviewDialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  const cancel = useRef<HTMLButtonElement>(null)
  const submitting = useRef(false)
  const [busy, setBusy] = useState(false)
  const isApproval = action === 'approve'
  const proof = Array.from(claim.ownershipProof.trim())
  const proofSummary = proof.length > 180 ? `${proof.slice(0, 180).join('')}…` : proof.join('')

  useEffect(() => {
    if (dialog.current && !dialog.current.open) dialog.current.showModal()
    cancel.current?.focus({ preventScroll: true })
  }, [])

  function closeDialog() {
    dialog.current?.close()
    onClose()
  }

  function cancelReview() {
    if (!submitting.current) closeDialog()
  }

  async function confirm() {
    if (submitting.current) return
    submitting.current = true
    setBusy(true)
    try {
      await onConfirm()
    } finally {
      closeDialog()
    }
  }

  return (
    <dialog
      className="admin-claim-confirm"
      ref={dialog}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy={busy}
      onCancel={(event) => {
        event.preventDefault()
        cancelReview()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') event.stopPropagation()
      }}
    >
      <header className="admin-claim-confirm__header">
        <h2 id={titleId}>{isApproval ? '주인을 확정하시겠습니까?' : '해당 수령 신청을 거절하시겠습니까?'}</h2>
        {demo && <p>데모 시뮬레이션 · 예시 목록에서 처리 결과를 확인합니다.</p>}
      </header>
      <div className="admin-claim-confirm__body">
        <dl className="admin-claim-confirm__context">
          <div><dt>습득물</dt><dd>{itemName}</dd></div>
          <div><dt>선택한 신청자</dt><dd>{claim.applicant.name} · {claim.applicant.accountId}</dd></div>
          {isApproval && <div><dt>다른 대기 신청</dt><dd>{otherPendingCount}건</dd></div>}
        </dl>
        {isApproval && (
          <div className="admin-claim-confirm__evidence">
            <h3>소유 증빙 요약</h3>
            <p>{proofSummary}</p>
          </div>
        )}
        <p className="admin-claim-confirm__notice" id={descriptionId}>
          {isApproval
            ? '선택한 신청자를 최종 주인으로 확정하면 나머지 대기 신청은 자동으로 거절되고, 습득물은 수령대기 상태로 변경됩니다.'
            : '거절된 신청 기록은 보관되며, 해당 신청자는 같은 습득물에 다시 신청할 수 없습니다.'}
        </p>
      </div>
      <footer className="admin-claim-confirm__actions">
        <button
          className="secondary-link"
          ref={cancel}
          type="button"
          aria-disabled={busy}
          onClick={cancelReview}
        >취소</button>
        <button
          className={isApproval ? 'primary-link' : 'primary-link admin-claim-card__reject'}
          type="button"
          aria-disabled={busy}
          onClick={() => void confirm()}
        >
          {busy ? '처리 중…' : isApproval ? '주인 확정' : '거절하기'}
        </button>
      </footer>
    </dialog>
  )
}
