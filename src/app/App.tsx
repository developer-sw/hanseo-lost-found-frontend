import { Header } from '../components/Header'
import { LoginForm } from '../components/LoginForm'
import { MobileBottomNavigation } from '../components/MobileBottomNavigation'
import { SignupForm } from '../components/SignupForm'
import { foundItems } from '../data/foundItems'
import { AuthPage } from '../pages/AuthPage'
import { FoundItemsPage } from '../pages/FoundItemsPage'
import { GuidePage } from '../pages/GuidePage'
import { HomePage } from '../pages/HomePage'
import { LostReportPage } from '../pages/LostReportPage'
import { PendingPage } from '../pages/PendingPage'

function renderPage(pathname: string, params: URLSearchParams) {
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
    case '/report/found':
      return <PendingPage title="습득물 등록" message="습득물 등록 양식을 준비 중입니다. 등록할 때 습득한 건물과 사진이 필요합니다." />
    case '/my':
      return <PendingPage title={params.get('tab') === 'claims' ? '내 수령 신청' : '내 신고·신청'} message="로그인 후 내 신고와 수령 신청을 확인할 수 있는 화면을 준비 중입니다." />
    case '/account':
      return params.get('tab') === 'notifications'
        ? <PendingPage title="알림" message="로그인과 알림 기능을 준비 중입니다." />
        : (
          <AuthPage title="로그인" description="이용할 계정 유형을 선택해 주세요.">
            <LoginForm />
          </AuthPage>
        )
    case '/account/signup':
      return (
        <AuthPage title="학생 회원가입" description="학생 계정에 사용할 정보를 입력해 주세요.">
          <SignupForm />
        </AuthPage>
      )
    default: {
      const item = foundItems.find(({ id }) => pathname === `/found/${id}`)

      return item
        ? <PendingPage title={item.name} message="습득물 상세 화면과 수령 신청 기능을 준비 중입니다." backHref="/found" backLabel="습득물 목록으로" />
        : <PendingPage title="페이지를 찾을 수 없습니다" message="주소를 확인하거나 홈으로 돌아가 주세요." />
    }
  }
}

export function App() {
  const { pathname, search } = window.location

  return (
    <>
      <a className="skip-link" href="#main-content">본문으로 바로 이동</a>
      <Header pathname={pathname} search={search} />
      {renderPage(pathname, new URLSearchParams(search))}
      <MobileBottomNavigation pathname={pathname} search={search} />
    </>
  )
}
