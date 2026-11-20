import { useEffect, useId, useRef, useState } from 'react'
import hanseoLogo from '../assets/hanseo-logo.webp'
import { Icon, type IconName } from './Icon'
import '../styles/navigation.css'

type HeaderProps = {
  pathname: string
  search: string
}

const reportLinks: { label: string; description: string; href: string; icon: IconName }[] = [
  { label: '분실물 신고', description: '물건을 잃어버리셨나요?', href: '/report/lost', icon: 'box' },
  { label: '습득물 등록', description: '주운 물건이 있나요?', href: '/report/found', icon: 'tag' },
]

function ReportNavigation({ current }: { current: boolean }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const disclosure = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    function dismissOutside(event: Event) {
      if (event.target instanceof Node && !disclosure.current?.contains(event.target)) setOpen(false)
    }

    function dismissOnEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape' || event.defaultPrevented) return
      event.preventDefault()
      setOpen(false)
      trigger.current?.focus()
    }

    document.addEventListener('pointerdown', dismissOutside, true)
    document.addEventListener('focusin', dismissOutside)
    document.addEventListener('keydown', dismissOnEscape)
    return () => {
      document.removeEventListener('pointerdown', dismissOutside, true)
      document.removeEventListener('focusin', dismissOutside)
      document.removeEventListener('keydown', dismissOnEscape)
    }
  }, [open])

  return (
    <div className="site-header__report" ref={disclosure}>
      <button
        className="site-header__link site-header__report-trigger"
        type="button"
        ref={trigger}
        aria-current={current ? 'page' : undefined}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((expanded) => !expanded)}
      >
        신고·등록 <Icon name="chevron-down" size={14} />
      </button>
      <div className="site-header__report-panel" id={panelId} hidden={!open}>
        {reportLinks.map(({ label, description, href, icon }) => (
          <a className="site-header__report-option" href={href} key={href} onClick={() => setOpen(false)}>
            <span className="site-header__report-icon"><Icon name={icon} size={22} /></span>
            <span className="site-header__report-copy"><strong>{label}</strong><span>{description}</span></span>
          </a>
        ))}
      </div>
    </div>
  )
}

export function Header({ pathname, search }: HeaderProps) {
  const params = new URLSearchParams(search)
  const isFound = pathname === '/found' || pathname.startsWith('/found/')
  const isReport = pathname === '/report' || pathname.startsWith('/report/')
  const isAccount = pathname === '/account'
  const isNotifications = isAccount && params.get('tab') === 'notifications'
  const links = [
    { label: '홈', href: '/', current: pathname === '/' },
    { label: '습득물 찾기', href: '/found', current: isFound },
    { label: '신고·등록', href: '/report', current: isReport },
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
          {links.map(({ label, href, current }) => href === '/report'
            ? <ReportNavigation current={current} key={href} />
            : <a className="site-header__link" href={href} aria-current={current ? 'page' : undefined} key={href}>{label}</a>,
          )}
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
