import { FoundReportForm } from '../components/FoundReportForm'
import { Hanbi } from '../components/Hanbi'
import { Icon } from '../components/Icon'
import '../styles/report.css'
import '../styles/found-report.css'

export function FoundReportPage() {
  return (
    <main className="site-container report-page found-report-page" id="main-content">
      <div className="report-intro">
        <div className="report-intro__copy">
          <h1>습득물 등록</h1>
          <p>교내에서 물건을 주우셨나요? 습득한 물건의 정보를 등록해 주인을 찾을 수 있도록 도와주세요!</p>
        </div>
        <Hanbi className="report-mascot" compact />
      </div>
      <div className="report-card">
        <p className="report-demo-notice" id="found-report-demo-notice">
          <Icon name="info" size={19} />
          <span><strong>데모 모드</strong>에서는 등록 내용을 확인할 수 있습니다. 입력 정보와 사진은 서버에 저장되지 않습니다.</span>
        </p>
        <aside className="found-custody" aria-labelledby="found-custody-title">
          <Icon name="shield-check" size={24} />
          <div>
            <h2 id="found-custody-title">습득물은 직접 보관해 주세요</h2>
            <p>등록한 물품은 주인이 확정되고 직접 전달할 때까지 습득자가 보관합니다.</p>
            <p>여러 학생이 수령을 신청할 수 있습니다. 관리자가 증빙을 비교해 주인 한 명을 확정하면 해당 학생에게 직접 전달해 주세요.</p>
          </div>
        </aside>
        <FoundReportForm />
      </div>
    </main>
  )
}
