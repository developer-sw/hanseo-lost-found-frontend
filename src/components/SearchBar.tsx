import { Icon } from './Icon'

export function SearchBar() {
  return (
    <div className="hero-search">
      <form className="quick-search" action="/found" method="get" role="search" aria-label="습득물 통합 검색">
        <Icon name="search" size={29} />
        <label className="sr-only" htmlFor="home-search">습득물 물품명 또는 키워드</label>
        <input id="home-search" type="search" name="q" placeholder="물품명, 키워드로 검색해 보세요" />
        <button type="submit">검색</button>
      </form>
      <a className="advanced-search" href="/found#filters">
        <Icon name="sliders" size={23} />
        상세검색
        <Icon name="chevron-down" size={16} />
      </a>
    </div>
  )
}
