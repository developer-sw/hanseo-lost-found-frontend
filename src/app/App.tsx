import { lazy, Suspense } from 'react'
import { ActiveHandoverShortcut } from '../components/ActiveHandoverShortcut'
import { Header } from '../components/Header'
import { LoginForm } from '../components/LoginForm'
import { MobileBottomNavigation } from '../components/MobileBottomNavigation'
import { SignupForm } from '../components/SignupForm'
import { AdminPage } from '../pages/AdminPage'
import { AuthPage } from '../pages/AuthPage'
import { FoundItemDetailPage } from '../pages/FoundItemDetailPage'
import { FoundItemsPage } from '../pages/FoundItemsPage'
import { FoundReportPage } from '../pages/FoundReportPage'
import { GuidePage } from '../pages/GuidePage'
import { HandoverPage, HandoverPageNotice } from '../pages/HandoverPage'
import { HomePage } from '../pages/HomePage'
import { LostReportPage } from '../pages/LostReportPage'
import { DemoMatchResultsPage, ReportMatchResultsPage } from '../pages/MatchResultsPage'
import { MyActivityPage } from '../pages/MyActivityPage'
import { PendingPage } from '../pages/PendingPage'
import { getAdminSection } from './adminRoutes'
import { getFoundItemId } from './foundItemRoutes'
import { getHandoverId, HANDOVER_DEMO_PATH } from './handoverRoutes'
import { getMatchReportId, MATCH_DEMO_PATH } from './matchRoutes'

const AdminDemoPage = import.meta.env.DEV ? lazy(() => import('../pages/AdminDemoPage')) : undefined
const HandoverDemoPage = import.meta.env.DEV ? lazy(() => import('../pages/HandoverDemoPage')) : undefined

function renderPage(pathname: string, params: URLSearchParams) {
  if (HandoverDemoPage && pathname === HANDOVER_DEMO_PATH) {
    return (
      <Suspense fallback={<HandoverPageNotice status="loading" />}>
        <HandoverDemoPage params={params} />
      </Suspense>
    )
  }

  switch (pathname) {
    case '/':
      return <HomePage />
    case '/found':
      return <FoundItemsPage params={params} />
    case '/guide':
      return <GuidePage />
    case '/report':
      return (
        <PendingPage title="신고·등록" message="필요한 신고 유형을 선택해 주세요.">
          <div className="page-actions">
            <a className="primary-link" href="/report/lost">분실물 신고</a>
            <a className="secondary-link" href="/report/found">습득물 등록</a>
          </div>
        </PendingPage>
      )
    case '/report/lost':
      return <LostReportPage />
    case MATCH_DEMO_PATH:
      return <DemoMatchResultsPage params={params} />
    case '/report/found':
      return <FoundReportPage />
    case '/my':
      return <MyActivityPage params={params} />
    case '/account':
      return params.get('tab') === 'notifications'
        ? <PendingPage title="알림" message="로그인과 알림 기능을 준비 중입니다." />
        : (
          <AuthPage title="로그인" description="이용할 계정 유형을 선택해 주세요.">
            <LoginForm initialRole={params.get('role') === 'admin' ? 'admin' : 'student'} />
          </AuthPage>
        )
    case '/account/signup':
      return (
        <AuthPage title="학생 회원가입" description="학생 계정에 사용할 정보를 입력해 주세요.">
          <SignupForm />
        </AuthPage>
      )
    default: {
      const reportId = getMatchReportId(pathname)
      if (reportId) return <ReportMatchResultsPage key={reportId} reportId={reportId} />

      if (pathname.startsWith('/found/')) {
        const itemId = getFoundItemId(pathname)
        return <FoundItemDetailPage key={itemId} itemId={itemId} params={params} />
      }

      const handoverId = getHandoverId(pathname)
      if (handoverId) return <HandoverPage key={handoverId} handoverId={handoverId} />

      return <PendingPage title="페이지를 찾을 수 없습니다" message="주소를 확인하거나 홈으로 돌아가 주세요." />
    }
  }
}

export function App() {
  const { pathname, search } = window.location
  const params = new URLSearchParams(search)

  if (AdminDemoPage) {
    const section = getAdminSection(pathname, '/admin/demo')
    if (section) {
      return (
        <Suspense fallback={<PendingPage title="관리자 데모" message="데모 화면을 불러오는 중입니다." />}>
          <AdminDemoPage section={section} params={params} />
        </Suspense>
      )
    }
  }

  const adminSection = getAdminSection(pathname)
  if (adminSection) return <AdminPage section={adminSection} params={params} />

  return (
    <>
      <a className="skip-link" href="#main-content">본문으로 바로 이동</a>
      <Header pathname={pathname} search={search} />
      {renderPage(pathname, params)}
      {!pathname.startsWith('/handover/') && <ActiveHandoverShortcut />}
      <MobileBottomNavigation pathname={pathname} search={search} />
    </>
  )
}
