import { MATCH_DEMO_PATH } from '../app/matchRoutes'
import type { MatchViewState } from '../types/match'
import { Icon, type IconName } from './Icon'

type NoticeStatus = Exclude<MatchViewState['status'], 'ready'>

const notices: Record<NoticeStatus, { title: string; description: string; icon: IconName }> = {
  loading: { title: '추천 결과를 불러오는 중이에요.', description: '잠시만 기다려 주세요.', icon: 'clock' },
  error: { title: '추천 결과를 불러오지 못했어요.', description: '잠시 후 다시 시도해 주세요.', icon: 'info' },
  'not-found': { title: '분실 신고를 찾을 수 없어요.', description: '내 신고·신청에서 신고 목록을 확인해 주세요.', icon: 'search' },
  forbidden: { title: '이 추천 결과에 접근할 수 없어요.', description: '분실 신고를 작성한 학생만 결과를 확인할 수 있습니다.', icon: 'shield-check' },
  unavailable: { title: '매칭 API가 아직 연결되지 않았어요.', description: '예시 신고의 추천 결과는 데모 화면에서 확인할 수 있어요.', icon: 'info' },
}

export function MatchStateNotice({ status, onRetry, isDemo }: { status: NoticeStatus; onRetry?: () => void; isDemo: boolean }) {
  const { title, description, icon } = notices[status]

  return (
    <section className="match-state" aria-labelledby="match-state-title">
      <div className="match-state__icon"><Icon name={icon} size={28} /></div>
      <div role={status === 'loading' ? 'status' : undefined}>
        <h2 id="match-state-title">{title}</h2>
        <p>{description}</p>
      </div>
      {status === 'error' && onRetry && <button className="secondary-link" type="button" onClick={onRetry}>다시 시도</button>}
      {status === 'unavailable' && !isDemo && <a className="secondary-link" href={MATCH_DEMO_PATH}>데모 결과 보기</a>}
    </section>
  )
}
