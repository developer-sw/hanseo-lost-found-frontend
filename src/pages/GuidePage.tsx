import { ProcessOverview } from '../components/ProcessOverview'

export function GuidePage() {
  return (
    <main className="site-container inner-page" id="main-content">
      <h1>이용 안내</h1>
      <p className="page-intro">교내에서 물건을 잃어버렸거나 주웠을 때의 이용 절차입니다.</p>
      <ProcessOverview detailed />
      <section id="handover" className="page-panel handover-guide" aria-labelledby="handover-title">
        <h2 id="handover-title">전달 장소 추천</h2>
        <p>관리자가 주인을 확정하면 습득자와 분실자에게 전달 진행 패널이 열립니다. 두 사람이 모두 ‘지금 이동 가능’을 선택하면 만날 서산캠퍼스 건물 한 곳을 추천합니다.</p>
        <p>습득자가 물건을 직접 전달하고, 분실자가 ‘받았어요’를 눌러 수령을 완료합니다. 전달 기능은 준비 중입니다.</p>
      </section>
    </main>
  )
}
