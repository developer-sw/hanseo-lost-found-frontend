import type { ReactNode } from 'react'
import { Hanbi } from '../components/Hanbi'
import { Icon } from '../components/Icon'
import '../styles/auth.css'

interface AuthPageProps {
  title: string
  description: string
  children: ReactNode
}

export function AuthPage({ title, description, children }: AuthPageProps) {
  return (
    <main className="site-container auth-page" id="main-content">
      <div className="auth-shell">
        <div className="auth-artwork">
          <Hanbi className="auth-mascot" compact />
        </div>
        <section className="auth-card" aria-labelledby="auth-title">
          <div className="auth-heading">
            <h1 id="auth-title">{title}</h1>
            <p>{description}</p>
          </div>
          <p className="auth-preview-notice" id="auth-preview-notice">
            <Icon name="info" size={18} />
            <span>인증 연동 준비 중입니다. 현재는 입력값을 확인할 수 있습니다.</span>
          </p>
          {children}
        </section>
      </div>
    </main>
  )
}
