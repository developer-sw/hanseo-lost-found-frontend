import { CATEGORY_LABELS, formatRegisteredAt } from '../data/foundItems'
import type { FoundItem } from '../types/foundItem'
import { Icon } from './Icon'
import '../styles/home-sections.css'

export function FoundItemCard({ item }: { item: FoundItem }) {
  const { id, name, category, building, locationDetail, registeredAt, image } = item
  const location = locationDetail ? `${building} ${locationDetail}` : building

  return (
    <a className="found-item-card" href={`/found/${id}`}>
      <img className="found-item-card__image" src={image} alt="" loading="lazy" />
      <div className="found-item-card__body">
        <span className="found-item-card__category">{CATEGORY_LABELS[category]}</span>
        <h3>{name}</h3>
        <div className="found-item-card__meta">
          <Icon name="map-pin" size={16} />
          <span>{location}</span>
        </div>
        <div className="found-item-card__meta">
          <Icon name="clock" size={16} />
          <time dateTime={registeredAt}>{formatRegisteredAt(registeredAt)}</time>
        </div>
      </div>
    </a>
  )
}
