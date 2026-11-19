import { Icon, type IconName } from './Icon'

type MobileBottomNavigationProps = {
  pathname: string
  search: string
}

const mobileLinks: { label: string; href: string; icon: IconName }[] = [
  { label: '홈', href: '/', icon: 'home' },
  { label: '검색', href: '/found', icon: 'search' },
  { label: '신고·등록', href: '/report', icon: 'edit' },
  { label: '내 신청', href: '/my?tab=claims', icon: 'bookmark' },
  { label: 'MY', href: '/account', icon: 'user' },
]

export function MobileBottomNavigation({ pathname, search }: MobileBottomNavigationProps) {
  const section = pathname.split('/')[1]
  const isClaims = new URLSearchParams(search).get('tab') === 'claims'
  const activeHref = section === 'my'
    ? isClaims ? '/my?tab=claims' : '/account'
    : `/${section}`

  return (
    <nav className="mobile-navigation" aria-label="하단 메뉴">
      {mobileLinks.map(({ label, href, icon }) => {
        const isActive = href === activeHref
        return (
          <a className="mobile-navigation__link" href={href} aria-current={isActive ? 'page' : undefined} key={href}>
            <Icon name={isActive && icon === 'home' ? 'home-filled' : icon} size={22} />
            <span>{label}</span>
          </a>
        )
      })}
    </nav>
  )
}
