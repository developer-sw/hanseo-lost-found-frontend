import hanseoLogo from '../assets/hanseo-logo.webp'
import { Icon } from './Icon'
import '../styles/navigation.css'

type HeaderProps = {
  pathname: string
  search: string
}

export function Header({ pathname, search }: HeaderProps) {
  const params = new URLSearchParams(search)
  const isFound = pathname === '/found' || pathname.startsWith('/found/')
  const isRecent = params.get('view') === 'recent'
  const isAccount = pathname === '/account'
  const isNotifications = isAccount && params.get('tab') === 'notifications'
  const links = [
    { label: '홈', href: '/', current: pathname === '/' },
    { label: '습득물 찾기', href: '/found', current: isFound && !isRecent },
    { label: '습득물 목록', href: '/found?view=recent', current: isFound && isRecent },
    { label: '내 신고·신청', href: '/my', current: pathname === '/my' },
    { label: '이용 안내', href: '/guide', current: pathname === '/guide' },
  ]

  return (
    <header className="site-header">
      <div className="site-container site-header__inner">
        <a className="site-brand" href="/" aria-label="한서대학교 분실·습득물 관리 시스템 홈">
          <img src={hanseoLogo} width={1045} height={281} alt="" className="site-brand__logo" />
          <span className="site-brand__divider" aria-hidden="true" />
          <span className="site-brand__name">분실·습득물 관리 시스템</span>
        </a>

        <nav className="site-header__navigation" aria-label="주 메뉴">
          {links.map(({ label, href, current }) => (
            <a className="site-header__link" href={href} aria-current={current ? 'page' : undefined} key={href}>
              {label}
            </a>
          ))}
        </nav>

        <div className="site-header__actions">
          <a className="site-header__notifications" href="/account?tab=notifications" aria-label="알림 안내" aria-current={isNotifications ? 'page' : undefined}>
            <Icon name="bell" size={22} />
          </a>
          <a className="site-header__account" href="/account" aria-current={isAccount && !isNotifications ? 'page' : undefined}>
            <Icon name="user" size={18} />
            <span>로그인</span>
          </a>
        </div>
      </div>
    </header>
  )
}
