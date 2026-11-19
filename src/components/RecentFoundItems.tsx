import type { FoundItem } from '../types/foundItem'
import { FoundItemCard } from './FoundItemCard'
import { Icon } from './Icon'
import '../styles/home-sections.css'

export function RecentFoundItems({ items }: { items: readonly FoundItem[] }) {
  return (
    <div className="recent-found">
      <section className="recent-found__items" aria-labelledby="recent-found-title">
        <div className="recent-found__heading">
          <h2 id="recent-found-title">최근 등록된 습득물</h2>
          <a href="/found">
            전체보기
            <Icon name="arrow-right" size={18} />
          </a>
        </div>
        <ul className="recent-found__list">
          {items.map((item) => <li key={item.id}><FoundItemCard item={item} /></li>)}
        </ul>
      </section>

      <aside className="my-activity" aria-labelledby="my-activity-title">
        <h2 id="my-activity-title"><Icon name="clipboard" size={23} /> 내 진행 현황</h2>
        <p>로그인 후 확인할 수 있어요.</p>
        <ul>
          <li>
            <a href="/my?tab=reports">
              <Icon name="edit" size={20} />
              <span>내 신고한 건</span>
              <Icon name="chevron-right" size={16} />
            </a>
          </li>
          <li>
            <a href="/my?tab=claims">
              <Icon name="backpack" size={20} />
              <span>내 수령 신청</span>
              <Icon name="chevron-right" size={16} />
            </a>
          </li>
          <li>
            <a className="my-activity__guide" href="/guide#handover">
              <Icon name="users" size={20} />
              <span>전달 방법 안내</span>
              <Icon name="chevron-right" size={16} />
            </a>
          </li>
        </ul>
      </aside>
    </div>
  )
}
