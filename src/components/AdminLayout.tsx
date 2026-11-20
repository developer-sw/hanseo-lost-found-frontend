import { useId, useRef, useState, type KeyboardEvent, type ReactNode, type Ref } from 'react'
import { ADMIN_LOGIN_PATH, ADMIN_SECTIONS, type AdminSection } from '../app/adminRoutes'
import hanseoLogo from '../assets/hanseo-logo.webp'
import { Icon } from './Icon'
import '../styles/admin-layout.css'

type AdminLayoutProps = {
  activeSection: AdminSection
  getHref: (section: AdminSection) => string
  demo: boolean
  accountName?: string
  children: ReactNode
}

type AdminHeaderProps = Pick<AdminLayoutProps, 'demo' | 'accountName'> & {
  dashboardHref: string
  navigationId: string
  menuOpen: boolean
  menuButtonRef: Ref<HTMLButtonElement>
  onMenuToggle: () => void
}

function AdminAccountMenu({ demo, accountName }: Pick<AdminLayoutProps, 'demo' | 'accountName'>) {
  const summaryRef = useRef<HTMLElement>(null)
  const name = demo ? undefined : accountName

  function closeWithEscape(event: KeyboardEvent<HTMLDetailsElement>) {
    if (event.key !== 'Escape' || !event.currentTarget.open) return
    event.stopPropagation()
    event.currentTarget.open = false
    summaryRef.current?.focus()
  }

  return (
    <details className="admin-account" onKeyDown={closeWithEscape}>
      <summary className="admin-account__trigger" ref={summaryRef} aria-label="관리자 계정 메뉴">
        <span className="admin-account__icon"><Icon name="user" size={18} /></span>
        <span className="admin-account__name">{name || (demo ? '데모 열람' : '관리자 계정')}</span>
        <Icon name="chevron-down" className="admin-account__chevron" size={15} />
      </summary>
      <div className="admin-account__panel">
        <strong>{name || (demo ? '관리자 데모' : '관리자 계정')}</strong>
        {demo && <p>개발 환경에서 예시 데이터로 화면을 확인하고 있습니다.</p>}
        {!name && <a href={ADMIN_LOGIN_PATH}>관리자 로그인 화면</a>}
      </div>
    </details>
  )
}

function AdminHeader({ dashboardHref, navigationId, menuOpen, menuButtonRef, onMenuToggle, demo, accountName }: AdminHeaderProps) {
  return (
    <header className="admin-header">
      <div className="admin-shell__width admin-header__inner">
        <button
          className="admin-header__menu"
          type="button"
          ref={menuButtonRef}
          aria-label={menuOpen ? '관리자 메뉴 닫기' : '관리자 메뉴 열기'}
          aria-controls={navigationId}
          aria-expanded={menuOpen}
          onClick={onMenuToggle}
        >
          <Icon name={menuOpen ? 'x' : 'menu'} size={22} />
        </button>
        <a className="admin-brand" href={dashboardHref} aria-label="한서대학교 분실·습득물 관리 시스템 관리자 대시보드">
          <img src={hanseoLogo} alt="" width={1045} height={281} />
          <span className="admin-brand__text">
            <span className="admin-brand__service">분실·습득물 관리 시스템</span>
            <span className="admin-brand__role">관리자 페이지</span>
          </span>
        </a>
        <AdminAccountMenu demo={demo} accountName={accountName} />
      </div>
    </header>
  )
}

function AdminSidebar({ id, expanded, activeSection, getHref, onNavigate }: Pick<AdminLayoutProps, 'activeSection' | 'getHref'> & {
  id: string
  expanded: boolean
  onNavigate: () => void
}) {
  return (
    <aside className="admin-sidebar" id={id} data-expanded={expanded}>
      <nav className="admin-sidenav" aria-label="관리자 메뉴">
        <ul>
          {ADMIN_SECTIONS.map(({ id: section, label, icon }) => (
            <li key={section}>
              <a href={getHref(section)} aria-current={activeSection === section ? 'page' : undefined} onClick={onNavigate}>
                <Icon name={icon} size={20} />
                <span>{label}</span>
              </a>
            </li>
          ))}
        </ul>
        <a className="admin-sidenav__student" href="/" onClick={onNavigate}>
          <Icon name="home" size={19} />
          <span>학생용 메인으로 이동</span>
        </a>
      </nav>
    </aside>
  )
}

export function AdminLayout({ activeSection, getHref, demo, accountName, children }: AdminLayoutProps) {
  const navigationId = useId()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)

  function closeMenuWithEscape(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Escape' || !menuOpen) return
    setMenuOpen(false)
    menuButton.current?.focus()
  }

  return (
    <div className="admin-shell" onKeyDown={closeMenuWithEscape}>
      <a className="skip-link" href="#main-content">본문으로 바로 이동</a>
      <AdminHeader
        dashboardHref={getHref('dashboard')}
        demo={demo}
        accountName={accountName}
        navigationId={navigationId}
        menuOpen={menuOpen}
        menuButtonRef={menuButton}
        onMenuToggle={() => setMenuOpen((open) => !open)}
      />
      <div className="admin-shell__width admin-shell__body">
        <AdminSidebar
          id={navigationId}
          expanded={menuOpen}
          activeSection={activeSection}
          getHref={getHref}
          onNavigate={() => setMenuOpen(false)}
        />
        <main className="admin-shell__main" id="main-content" tabIndex={-1}>
          {demo && (
            <div className="admin-shell__demo-notice">
              <Icon name="info" size={21} />
              <p><strong>데모 모드</strong> 예시 습득물 데이터를 표시합니다. 실제 데이터베이스와 연결되지 않았습니다. 관리자 인증은 연동 전입니다.</p>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
