import { ActionCards } from '../components/ActionCards'
import { CategoryNavigation } from '../components/CategoryNavigation'
import { HeroSection } from '../components/HeroSection'
import { ProcessOverview } from '../components/ProcessOverview'
import { RecentFoundItems } from '../components/RecentFoundItems'
import { foundItems } from '../data/foundItems'
import '../styles/home.css'

export function HomePage() {
  return (
    <main id="main-content" className="home-page">
      <HeroSection />
      <div className="site-container home-sections">
        <ActionCards />
        <CategoryNavigation />
        <ProcessOverview />
        <RecentFoundItems items={foundItems.slice(0, 3)} />
      </div>
    </main>
  )
}
