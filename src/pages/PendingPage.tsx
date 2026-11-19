import type { ReactNode } from 'react'
import { Icon } from '../components/Icon'

interface PendingPageProps {
  title: string
  message: string
  children?: ReactNode
  backHref?: string
  backLabel?: string
}

export function PendingPage({ title, message, children, backHref = '/', backLabel = '홈으로' }: PendingPageProps) {
  return (
    <main className="site-container inner-page" id="main-content">
      <a className="back-link" href={backHref}><Icon name="arrow-left" size={18} />{backLabel}</a>
      <section className="page-panel" aria-labelledby="page-title">
        <h1 id="page-title">{title}</h1>
        <p>{message}</p>
        {children}
      </section>
    </main>
  )
}
