import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import type { HandoverAction } from '../types/handover'

const confirmationCopy = {
  ready: {
    question: '현재 위치를 확인할까요?',
    description: '현재 위치를 한 번 확인하여 두 사람에게 공평한 교내 전달 장소를 추천합니다. 상대방에게는 추천 건물 이름만 표시됩니다.',
    confirm: '위치 확인하기',
    pending: '위치 확인 중…',
  },
  reset: {
    question: '전달 장소를 다시 정할까요?',
    description: '현재 추천 장소를 초기화하고 두 사람 모두 다시 이동 가능 상태를 설정해야 합니다.',
    confirm: '다시 정하기',
    pending: '처리 중…',
  },
  complete: {
    question: '물품을 전달받으셨나요?',
    description: '실제로 물품을 전달받았다면 수령완료를 눌러 주세요. 완료 후에는 전달이 종료됩니다.',
    confirm: '수령완료',
    pending: '처리 중…',
  },
} satisfies Record<HandoverAction, { question: string; description: string; confirm: string; pending: string }>

export function HandoverConfirmDialog({ action, demo, busy, allowed, error, onConfirm, onClose }: {
  action: HandoverAction
  demo: boolean
  busy: boolean
  allowed: boolean
  error?: string
  onConfirm: () => Promise<boolean>
  onClose: () => void
}) {
  const titleId = useId()
  const descriptionId = useId()
  const dialog = useRef<HTMLDialogElement>(null)
  const cancel = useRef<HTMLButtonElement>(null)
  const confirm = useRef<HTMLButtonElement>(null)
  const submitting = useRef(false)
  const [pending, setPending] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [unexpectedError, setUnexpectedError] = useState('')
  const { question, description, confirm: confirmLabel, pending: pendingLabel } = confirmationCopy[action]
  const isBusy = busy || pending

  useEffect(() => {
    if (dialog.current && !dialog.current.open) dialog.current.showModal()
    cancel.current?.focus({ preventScroll: true })
  }, [])

  function closeDialog() {
    dialog.current?.close()
    onClose()
  }

  function dismiss() {
    if (!busy && !submitting.current) closeDialog()
  }

  function keepTabFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === 'Escape') event.stopPropagation()
    if (event.key !== 'Tab') return

    const first = cancel.current
    const last = confirm.current ?? first
    const edge = event.shiftKey ? first : last
    const next = event.shiftKey ? last : first
    if (event.target === edge) {
      event.preventDefault()
      next?.focus()
    }
  }

  async function confirmAction() {
    if (busy || submitting.current || !allowed) return
    submitting.current = true
    setPending(true)
    setAttempted(true)
    setUnexpectedError('')

    try {
      if (await onConfirm()) closeDialog()
    } catch {
      if (dialog.current?.open) setUnexpectedError('요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      submitting.current = false
      if (dialog.current?.open) setPending(false)
    }
  }

  const feedback = !allowed && !isBusy
    ? '전달 상태가 바뀌었습니다. 창을 닫고 최신 상태를 확인해 주세요.'
    : attempted && !isBusy ? error || unexpectedError : undefined

  return (
    <dialog
      className="handover-dialog"
      ref={dialog}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy={isBusy}
      onKeyDown={keepTabFocus}
      onCancel={(event) => {
        event.preventDefault()
        dismiss()
      }}
    >
      <header className="handover-dialog__header">
        <h2 id={titleId}>{question}</h2>
      </header>
      <div className="handover-dialog__body">
        <p id={descriptionId}>{description}</p>
        {demo && <p className="handover-panel__note">시연에서는 이 화면의 예시 상태만 갱신됩니다.</p>}
        {feedback && <p className="handover-panel__issue" role="alert">{feedback}</p>}
      </div>
      <footer className="handover-dialog__actions">
        <button className="secondary-link" type="button" ref={cancel} aria-disabled={isBusy} onClick={dismiss}>취소</button>
        <button className="primary-link" type="button" ref={confirm} aria-disabled={isBusy || !allowed} onClick={() => void confirmAction()}>
          {isBusy ? pendingLabel : confirmLabel}
        </button>
      </footer>
    </dialog>
  )
}
