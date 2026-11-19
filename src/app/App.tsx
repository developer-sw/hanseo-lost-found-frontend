import { Header } from '../components/Header'
import { MobileBottomNavigation } from '../components/MobileBottomNavigation'
import { foundItems } from '../data/foundItems'
import { FoundItemsPage } from '../pages/FoundItemsPage'
import { GuidePage } from '../pages/GuidePage'
import { HomePage } from '../pages/HomePage'
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
      return <PendingPage title="분실물 신고" message="신고 양식을 준비 중입니다. 분실 신고는 등록한 학생 본인만 조회할 수 있습니다." />
    case '/report/found':
      return <PendingPage title="습득물 등록" message="습득물 등록 양식을 준비 중입니다. 등록할 때 습득한 건물과 사진이 필요합니다." />
    case '/my':
      return <PendingPage title={params.get('tab') === 'claims' ? '내 수령 신청' : '내 신고·신청'} message="로그인 후 내 신고와 수령 신청을 확인할 수 있는 화면을 준비 중입니다." />
    case '/account':
      return params.get('tab') === 'notifications'
        ? <PendingPage title="알림" message="로그인과 알림 기능을 준비 중입니다." />
        : <PendingPage title="로그인" message="학생 계정 로그인과 회원가입 화면을 준비 중입니다." />
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
