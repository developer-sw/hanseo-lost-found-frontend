import { Hanbi } from './Hanbi'
import { SearchBar } from './SearchBar'

export function HeroSection() {
  return (
    <section className="hero" aria-labelledby="home-title">
      <div className="hero-overview">
        <div className="hero-landscape" aria-hidden="true" />
        <Hanbi className="hero-art" />
        <div className="site-container hero-content">
          <div className="hero-copy">
            <p className="hero-school">한서대학교 교내</p>
            <h1 id="home-title">
              <span className="hero-highlight">잃어버린 물건,</span>{' '}
              <span className="hero-title-end">한비와 함께 찾아요!</span>
            </h1>
            <p className="hero-description">분실물을 신고하고, 등록된 습득물을 검색해 보세요.</p>
          </div>
        </div>
      </div>
      <div className="site-container hero-search-wrap">
        <SearchBar />
      </div>
    </section>
  )
}
