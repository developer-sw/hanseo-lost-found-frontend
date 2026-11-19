import { FoundItemCard } from '../components/FoundItemCard'
import { Icon } from '../components/Icon'
import { CATEGORY_LABELS, foundItems } from '../data/foundItems'

const buildings = [...new Set(foundItems.map(({ building }) => building))]

export function FoundItemsPage({ params }: { params: URLSearchParams }) {
  const keyword = params.get('q')?.trim() ?? ''
  const category = params.get('category') ?? ''
  const building = params.get('building') ?? ''
  const results = foundItems.filter((item) =>
    (!category || category === item.category) &&
    (!building || building === item.building) &&
    (!keyword || item.name.toLocaleLowerCase('ko').includes(keyword.toLocaleLowerCase('ko'))),
  )

  return (
    <main className="site-container inner-page" id="main-content">
      <h1>습득물 찾기</h1>
      <p className="page-intro">예시 습득물 목록에서 물품명, 건물, 카테고리로 검색해 보세요.</p>
      <form id="filters" className="found-filters page-panel" action="/found" method="get" role="search" aria-label="습득물 상세 검색">
        <label>
          물품명·키워드
          <input name="q" type="search" defaultValue={keyword} placeholder="예: 에어팟" />
        </label>
        <label>
          건물
          <select name="building" defaultValue={building}>
            <option value="">전체 건물</option>
            {buildings.map((name) => <option key={name}>{name}</option>)}
          </select>
        </label>
        <label>
          카테고리
          <select name="category" defaultValue={category}>
            <option value="">전체 카테고리</option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <button className="primary-link" type="submit"><Icon name="search" size={18} />검색</button>
      </form>
      <section className="search-results" aria-labelledby="results-title">
        <h2 id="results-title">습득물 {results.length}건</h2>
        {results.length ? (
          <ul className="search-results-grid">
            {results.map((item) => <li key={item.id}><FoundItemCard item={item} /></li>)}
          </ul>
        ) : (
          <div className="page-panel">
            <p>조건에 맞는 습득물이 없습니다. 검색어 또는 필터를 바꿔 보세요.</p>
            <a className="secondary-link" href="/found">검색 조건 초기화</a>
          </div>
        )}
      </section>
    </main>
  )
}
