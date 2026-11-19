import { useEffect, useState } from 'react'
import { getMatchDemoScenario, MATCH_DEMO_PATH } from '../app/matchRoutes'
import { Hanbi } from '../components/Hanbi'
import { Icon } from '../components/Icon'
import { MatchCandidateCard } from '../components/MatchCandidateCard'
import { MatchReportSummary } from '../components/MatchReportSummary'
import { MatchStateNotice } from '../components/MatchStateNotice'
import { getDemoMatchState, MATCH_DEMO_SCENARIOS, type MatchDemoScenario } from '../data/demoMatches'
import { matchService } from '../services/matches'
import type { MatchViewState } from '../types/match'
import '../styles/match.css'

function DemoControls({ scenario }: { scenario: MatchDemoScenario }) {
  return (
    <div className="match-demo">
      <p><Icon name="info" size={19} /><span><strong>데모 모드</strong> · 예시 분실 신고와 샘플 점수를 표시합니다. 실제 신고나 수령 신청과 연결되지 않습니다.</span></p>
      <form className="match-demo__controls" action={MATCH_DEMO_PATH} method="get">
        <label htmlFor="match-demo-scenario">데모 상태</label>
        <select id="match-demo-scenario" name="scenario" defaultValue={scenario}>
          {Object.entries(MATCH_DEMO_SCENARIOS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <button className="secondary-link" type="submit">보기</button>
      </form>
    </div>
  )
}

function MatchResultsPage({ state, reportId, demoScenario, onRetry }: {
  state: MatchViewState
  reportId?: string
  demoScenario?: MatchDemoScenario
  onRetry?: () => void
}) {
  const result = state.status === 'ready' ? state.result : undefined
  // Keep the supplied ranking. Exclude zero-point results before applying the display limit.
  const candidates = result?.candidates.filter(({ score }) => score > 0).slice(0, 3) ?? []
  const isEmpty = state.status === 'ready' && candidates.length === 0
  const title = isEmpty ? '아직 비슷한 습득물이 없어요.' : candidates.length ? '비슷한 습득물을 찾았어요!' : '자동 매칭 결과'
  const intro = isEmpty
    ? '새로운 습득물이 등록되면 다시 확인할 수 있어요.'
    : candidates.length ? '신고하신 분실물과 비슷한 습득물을 확인해 보세요.' : undefined

  return (
    <main className="site-container match-page" id="main-content">
      <header className="match-intro">
        <div>
          <h1>{title}</h1>
          {intro && <p>{intro}</p>}
        </div>
        <Hanbi className="match-mascot" compact />
      </header>

      {demoScenario && <DemoControls scenario={demoScenario} />}
      {result && <MatchReportSummary report={result.report} />}

      {candidates.length > 0 && (
        <section className="match-results" aria-labelledby="match-results-title">
          <div className="match-results__heading">
            <h2 id="match-results-title">추천 습득물 <span>{candidates.length}건</span></h2>
            <p>매칭 점수는 후보의 유사도를 비교하는 값입니다.</p>
          </div>
          <ol className="match-grid">
            {candidates.map((candidate, index) => (
              <li key={candidate.id}>
                <MatchCandidateCard candidate={candidate} rank={index + 1} reportId={reportId} demoScenario={demoScenario} />
              </li>
            ))}
          </ol>
        </section>
      )}

      {state.status !== 'ready' && <MatchStateNotice status={state.status} isDemo={Boolean(demoScenario)} onRetry={onRetry} />}

      <footer className="match-footer">
        <a className="secondary-link" href="/found"><Icon name="search" size={18} />다른 습득물 검색하기</a>
        <a className="primary-link" href="/my?tab=reports">내 신고·신청으로 이동</a>
      </footer>
    </main>
  )
}

export function DemoMatchResultsPage({ params }: { params: URLSearchParams }) {
  const scenario = getMatchDemoScenario(params.get('scenario')) ?? 'three'
  return <MatchResultsPage state={getDemoMatchState(scenario)} demoScenario={scenario} />
}

export function ReportMatchResultsPage({ reportId }: { reportId: string }) {
  const [state, setState] = useState<MatchViewState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true

    matchService.getByReportId(reportId).then(
      (result) => { if (active) setState(result) },
      () => { if (active) setState({ status: 'error' }) },
    )

    return () => { active = false }
  }, [reportId, attempt])

  function retry() {
    setState({ status: 'loading' })
    setAttempt((current) => current + 1)
  }

  return <MatchResultsPage state={state} reportId={reportId} onRetry={retry} />
}
