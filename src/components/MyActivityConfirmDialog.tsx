import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { MyActivityAction, MyActivityMutationResult } from '../types/myActivity'
import { getMyActivityMutationFeedback } from '../utils/myActivityFeedback'

const actionCopy = {
  'delete-lost': { question: '이 분실 신고를 삭제하시겠습니까?', confirm: '삭제 확인' },
  'delete-found': { question: '이 습득 신고를 삭제하시겠습니까?', confirm: '삭제 확인' },
  'cancel-claim': { question: '수령 신청을 취소하시겠습니까?', confirm: '신청 취소 확인' },
}

export function MyActivityConfirmDialog({ action, demo, onConfirm, onClose, onUpdated }: {
  action: MyActivityAction
  demo: boolean
  onConfirm: () => Promise<MyActivityMutationResult>
  onClose: () => void
  onUpdated: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const dismiss = useRef<HTMLButtonElement>(null)
  const confirm = useRef<HTMLButtonElement>(null)
  const submitting = useRef(false)
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState('')
  const { question, confirm: confirmLabel } = actionCopy[action.kind]

  useEffect(() => {
    if (dialog.current && !dialog.current.open) dialog.current.showModal()
    dismiss.current?.focus()
  }, [])

  function keepTabFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return
    const first = dismiss.current
    const last = !confirm.current || confirm.current.disabled ? first : confirm.current
    const current = event.shiftKey ? first : last
    const next = event.shiftKey ? last : first
    if (next && event.target === current) {
      event.preventDefault()
      next.focus()
    }
  }

  async function applyAction() {
    if (submitting.current) return
    submitting.current = true
    setBusy(true)
    setFeedback('')

    try {
      const result = await onConfirm()
      if (result.status === 'success') {
        dialog.current?.close()
        onUpdated()
      } else if (dialog.current?.open) {
        setFeedback(demo && result.status === 'unavailable'
          ? '데모 모드입니다. 목록은 그대로이며 서버에 변경사항이 반영되지 않았습니다.'
          : getMyActivityMutationFeedback(result.status))
        dismiss.current?.focus()
      }
    } catch {
      if (dialog.current?.open) setFeedback(getMyActivityMutationFeedback('error'))
    } finally {
      submitting.current = false
      if (dialog.current?.open) setBusy(false)
    }
  }

  return (
    <dialog className="my-activity-confirm" ref={dialog} aria-labelledby="my-activity-confirm-title" aria-describedby="my-activity-confirm-item" onClose={onClose} onKeyDown={keepTabFocus}>
      <h2 id="my-activity-confirm-title">{question}</h2>
      <p id="my-activity-confirm-item" className="my-activity-confirm__item">{action.name}</p>
      {action.kind === 'cancel-claim' && <p>취소하더라도 신청 내역은 남습니다.</p>}
      <div className="my-activity-confirm__feedback" role="status">{feedback && <p>{feedback}</p>}</div>
      <div className="my-activity-confirm__actions">
        <button className="secondary-link" ref={dismiss} type="button" onClick={() => dialog.current?.close()}>{feedback ? '닫기' : '돌아가기'}</button>
        {(!demo || !feedback) && (
          <button className="primary-link my-activity-confirm__confirm" ref={confirm} type="button" disabled={busy} onClick={() => void applyAction()}>
            {busy ? '처리 중…' : confirmLabel}
          </button>
        )}
      </div>
    </dialog>
  )
}
