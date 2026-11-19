import { Hanbi } from '../components/Hanbi'
import { Icon } from '../components/Icon'
import { LostReportForm } from '../components/LostReportForm'
import '../styles/report.css'

export function LostReportPage() {
  return (
    <main className="site-container report-page" id="main-content">
      <div className="report-intro">
        <div className="report-intro__copy">
          <h1>분실물 신고</h1>
          <p>잃어버린 물건의 정보를 입력해 주세요. 비슷한 습득물이 등록되어 있다면 찾아드릴게요!</p>
        </div>
        <Hanbi className="report-mascot" compact />
      </div>
      <div className="report-card">
        <p className="report-demo-notice" id="lost-report-demo-notice">
          <Icon name="info" size={19} />
          <span><strong>데모 모드</strong>에서는 입력 내용을 확인할 수 있습니다. 신고 정보는 서버에 저장되지 않습니다.</span>
        </p>
        <LostReportForm />
      </div>
    </main>
  )
}
