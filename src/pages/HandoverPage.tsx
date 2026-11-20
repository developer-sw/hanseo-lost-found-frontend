import { useState, type ReactNode } from 'react'
import { getMyActivityPath } from '../app/myActivityRoutes'
import { HandoverPanel } from '../components/HandoverPanel'
import { Icon } from '../components/Icon'
import { useHandover } from '../hooks/useHandover'
import type { HandoverViewState } from '../types/handover'
import { handoverActionMessages } from '../utils/handoverMessages'

type NoticeStatus = Exclude<HandoverViewState['status'], 'ready'>

const notices: Record<NoticeStatus, string> = {
  loading: '전달 정보를 불러오는 중입니다.',
  unavailable: '전달 진행 API가 아직 연결되지 않았습니다.',
  'sign-in-required': '전달 정보를 보려면 학생 계정으로 로그인해 주세요.',
  expired: '로그인 시간이 만료되었습니다. 다시 로그인해 주세요.',
  forbidden: '해당 습득자와 확정된 주인만 전달 정보를 볼 수 있습니다.',
  'not-found': '해당 전달 건을 찾을 수 없습니다.',
  conflict: '전달 상태가 변경되었습니다. 최신 정보를 다시 불러와 주세요.',
  'network-error': '네트워크 연결을 확인한 뒤 다시 시도해 주세요.',
  error: '전달 정보를 불러오지 못했습니다.',
}

export function HandoverPageNotice({ status, onRetry, extraAction }: {
  status: NoticeStatus
  onRetry?: () => void
  extraAction?: ReactNode
}) {
  const needsSignIn = status === 'sign-in-required' || status === 'expired'
  const canRetry = status === 'error' || status === 'network-error' || status === 'conflict'

  return (
    <main className="site-container inner-page handover-page" id="main-content" aria-busy={status === 'loading'}>
      <h1>전달 진행</h1>
      <section className="page-panel handover-page__notice" aria-label="전달 진행 안내">
        <p role={status === 'loading' ? 'status' : undefined}>
          <Icon name={status === 'loading' ? 'clock' : 'info'} size={19} />
          {notices[status]}
        </p>
        {status !== 'loading' && (
          <div className="page-actions">
            {needsSignIn && <a className="primary-link" href="/account">학생 로그인</a>}
            {canRetry && onRetry && <button className="primary-link" type="button" onClick={onRetry}>다시 시도</button>}
            {extraAction}
            <a className="secondary-link" href="/my">마이페이지로 돌아가기</a>
          </div>
        )}
      </section>
    </main>
  )
}

export function HandoverPage({ handoverId }: { handoverId: string }) {
  const [expanded, setExpanded] = useState(true)
  const handover = useHandover(handoverId, undefined, expanded)
  const { state, refresh } = handover

  if (state.status !== 'ready') return <HandoverPageNotice status={state.status} onRetry={refresh} />

  return (
    <main className="site-container inner-page handover-page" id="main-content">
      <HandoverPanel
        snapshot={state.snapshot}
        clockOffsetMs={handover.clockOffsetMs}
        backHref={getMyActivityPath(state.snapshot.role === 'finder' ? 'found' : 'claims', { account: true })}
        canMutate={handover.canMutate}
        busy={Boolean(handover.busy)}
        actionError={handover.actionError ? handoverActionMessages[handover.actionError.status] : undefined}
        onExpandedChange={setExpanded}
        onReady={() => handover.setReady()}
        onReset={handover.resetPlace}
        onComplete={handover.complete}
      />
    </main>
  )
}
