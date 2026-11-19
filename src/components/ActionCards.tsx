import { Icon, type IconName } from './Icon'

const actions: { title: string; description: string; href: string; icon: IconName; variant: string }[] = [
  { title: '분실물 신고', description: '물건을 잃어버렸나요?', href: '/report/lost', icon: 'box', variant: 'lost' },
  { title: '습득물 등록', description: '물건을 주웠나요?', href: '/report/found', icon: 'tag', variant: 'found' },
  { title: '전달 장소 추천', description: '주인 확정 후 만날 건물을 추천받아요!', href: '/guide#handover', icon: 'map-pin-house', variant: 'handover' },
]

export function ActionCards() {
  return (
    <nav className="action-cards" aria-label="분실·습득물 주요 기능">
      {actions.map(({ title, description, href, icon, variant }) => (
        <a className={`action-card action-card--${variant}`} href={href} key={href}>
          <span className="action-icon"><Icon name={icon} size={52} /></span>
          <span className="action-copy">
            <strong>{title}</strong>
            <span>{description}</span>
          </span>
          <span className="action-arrow"><Icon name="arrow-right" size={18} /></span>
        </a>
      ))}
    </nav>
  )
}
