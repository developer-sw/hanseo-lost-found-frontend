import { CATEGORY_LABELS } from '../data/foundItems'
import { Icon, type IconName } from './Icon'
import '../styles/home-sections.css'

const shortcuts = [
  { label: CATEGORY_LABELS.electronics, icon: 'headphones', href: '/found?category=electronics' },
  { label: CATEGORY_LABELS.wallets, icon: 'wallet', href: '/found?category=wallets' },
  { label: CATEGORY_LABELS.bags, icon: 'backpack', href: '/found?category=bags' },
  { label: CATEGORY_LABELS.clothing, icon: 'shirt', href: '/found?category=clothing' },
  { label: '더보기', icon: 'more', href: '/found' },
] satisfies { label: string; icon: IconName; href: string }[]

export function CategoryNavigation() {
  return (
    <nav className="category-navigation" aria-label="습득물 카테고리">
      <ul>
        {shortcuts.map(({ label, icon, href }) => (
          <li key={href}>
            <a href={href}>
              <span className="category-navigation__icon">
                <Icon name={icon} size={28} />
              </span>
              <span>{label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
