import { ADMIN_LOGIN_PATH } from '../app/adminRoutes'
import type { AdminHandoversResult } from '../types/adminHandovers'
import { Icon, type IconName } from './Icon'

type HandoverNoticeStatus = 'loading' | Exclude<AdminHandoversResult['status'], 'ready'>

const notices: Record<HandoverNoticeStatus, { title: string; description: string; icon: IconName }> = {
  loading: { title: '전달 진행 정보를 불러오는 중입니다.', description: '잠시만 기다려 주세요.', icon: 'clock' },
  'not-found': { title: '전달 건을 찾을 수 없습니다.', description: '전달 목록에서 현재 조회할 수 있는 물품을 확인해 주세요.', icon: 'search' },
  'sign-in-required': { title: '관리자 로그인이 필요합니다.', description: '관리자 계정으로 로그인한 뒤 다시 조회해 주세요.', icon: 'user' },
  expired: { title: '관리자 인증이 만료되었습니다.', description: '다시 로그인한 뒤 조회해 주세요.', icon: 'clock' },
  forbidden: { title: '전달 진행 현황을 조회할 권한이 없습니다.', description: '조회 권한이 있는 관리자 계정을 사용해 주세요.', icon: 'shield-check' },
  unavailable: { title: '전달 진행 조회 API가 아직 연결되지 않았습니다.', description: '서버 연동 후 실제 전달 정보를 조회할 수 있습니다.', icon: 'info' },
  error: { title: '전달 진행 정보를 불러오지 못했습니다.', description: '잠시 후 다시 시도해 주세요.', icon: 'info' },
}

export function AdminHandoverNotice({ status, allHref, onRetry, detail = false }: {
  status: HandoverNoticeStatus
  allHref?: string
  onRetry: () => void
  detail?: boolean
}) {
  const { title, description, icon } = notices[status]
  const Heading = detail ? 'h3' : 'h2'

  return (
    <div className="admin-dashboard-notice" role={status === 'loading' ? 'status' : undefined}>
      <span className="admin-dashboard-notice__icon"><Icon name={icon} size={24} /></span>
      <div>
        <Heading>{title}</Heading>
        <p>{description}</p>
      </div>
      {status === 'not-found' && allHref && <a className="secondary-link" href={allHref}>전체 전달 목록 보기</a>}
      {status === 'error' && <button className="secondary-link" type="button" onClick={onRetry}>다시 시도</button>}
      {(status === 'sign-in-required' || status === 'expired') && <a className="primary-link" href={ADMIN_LOGIN_PATH}>관리자 로그인</a>}
      {status === 'forbidden' && <a className="secondary-link" href="/">학생용 메인으로 이동</a>}
    </div>
  )
}
