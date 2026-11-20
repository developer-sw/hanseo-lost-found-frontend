import { useState } from 'react'
import { HANDOVER_DEMO_PATH } from '../app/handoverRoutes'
import { getMyActivityPath } from '../app/myActivityRoutes'
import { HandoverPanel } from '../components/HandoverPanel'
import { Icon } from '../components/Icon'
import { campusBuildings } from '../data/campusBuildings'
import { demoHandoverBuildingId, demoHandoverCases } from '../data/demoHandoverCases'
import { createDemoHandoverSession, demoHandoverBuildings, type DemoHandoverAction } from '../data/demoHandovers'
import { demoFoundItemDetails } from '../data/foundItems'
import type { HandoverBuilding, HandoverFailure, HandoverRecord, HandoverResult, HandoverRole } from '../types/handover'
import { getHandoverReadiness, getHandoverReadyUntil } from '../utils/handover'
import { handoverActionMessages } from '../utils/handoverMessages'
import { HandoverPageNotice } from './HandoverPage'

const readinessExamples = {
  success: '정상 처리',
  'permission-denied': '위치 권한 거부',
  unsupported: '위치 정보 미지원',
  timeout: '위치 확인 시간 초과',
  'insecure-context': '보안 연결 필요',
  'position-unavailable': '현재 위치 확인 불가',
  'network-error': '네트워크 오류',
} as const

type ReadinessExample = keyof typeof readinessExamples

function getDemoView(result: HandoverResult) {
  return { result, receivedAt: Date.now() }
}

function DemoNotice({ status }: HandoverFailure) {
  return <HandoverPageNotice status={status} extraAction={<a className="secondary-link" href={HANDOVER_DEMO_PATH}>전달 데모로 돌아가기</a>} />
}

function DemoHandoverSession({ initial, initialRole, recommendedBuilding }: {
  initial: HandoverRecord
  initialRole: HandoverRole
  recommendedBuilding: HandoverBuilding
}) {
  const [session] = useState(() => createDemoHandoverSession(initial, { recommendedBuilding }))
  const [view, setView] = useState(() => getDemoView(session.read(initialRole)))
  const [example, setExample] = useState<ReadinessExample>('success')
  const [error, setError] = useState<string>()

  function replaceSnapshot(result: HandoverResult) {
    if (result.status !== 'ready') {
      setError(handoverActionMessages[result.status])
      return false
    }
    setView(getDemoView(result))
    setError(undefined)
    return true
  }

  if (view.result.status !== 'ready') return <DemoNotice status={view.result.status} />

  const { snapshot } = view.result
  const { handover, role, serverNow } = snapshot
  const clockOffsetMs = Date.parse(serverNow) - view.receivedAt

  async function apply(action: DemoHandoverAction) {
    return replaceSnapshot(session.apply(role, action))
  }

  async function markReady(buildingId?: string) {
    if (!buildingId) return false
    if (example !== 'success') {
      setError(handoverActionMessages[example])
      return false
    }
    return apply({ type: 'ready', buildingId })
  }

  const controls = (serverTime: number) => (
    <div className="handover-demo-controls">
      <p className="handover-demo-controls__notice">
        <Icon name="info" size={19} />
        <span><strong>개발용 전달 데모</strong> · 건물 선택으로 시연하며, 추천 장소는 미리 정한 예시입니다. 새로고침하면 시연 결과가 초기화됩니다.</span>
      </p>
      <div className="handover-demo-controls__row">
        <label htmlFor="s10-demo-role">시연 역할</label>
        <select id="s10-demo-role" value={role} onChange={(event) => {
          const next = event.currentTarget.value
          if (next === 'finder' || next === 'owner') replaceSnapshot(session.read(next))
        }}>
          <option value="finder">습득자</option>
          <option value="owner">확정된 주인</option>
        </select>
        {handover.status === 'WAITING' && getHandoverReadiness(getHandoverReadyUntil(handover, role), serverTime).status === 'ready' && (
          <button type="button" className="secondary-link" onClick={() => replaceSnapshot(session.expireReadiness(role))}>이동 가능 시간 만료 시연</button>
        )}
      </div>
      {handover.status === 'WAITING' && (
        <details>
          <summary>위치·네트워크 오류 시연</summary>
          <div className="handover-demo-controls__row">
            <label htmlFor="s10-demo-example">이동 가능 요청 결과</label>
            <select id="s10-demo-example" value={example} onChange={(event) => {
              const value = event.currentTarget.value
              if (Object.hasOwn(readinessExamples, value)) setExample(value as ReadinessExample)
              setError(undefined)
            }}>
              {Object.entries(readinessExamples).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
        </details>
      )}
    </div>
  )

  return (
    <main className="site-container inner-page handover-page" id="main-content">
      <HandoverPanel
        snapshot={snapshot}
        clockOffsetMs={clockOffsetMs}
        backHref={getMyActivityPath(role === 'finder' ? 'found' : 'claims')}
        canMutate
        busy={false}
        actionError={error}
        demo
        buildings={demoHandoverBuildings}
        controls={controls}
        onReady={markReady}
        onReset={() => apply({ type: 'reset' })}
        onComplete={() => apply({ type: 'complete' })}
      />
    </main>
  )
}

export default function HandoverDemoPage({ params }: { params: URLSearchParams }) {
  const id = params.get('handoverId') ?? demoHandoverCases.wallet.handoverId
  const role = params.get('role') ?? 'finder'
  if (role !== 'finder' && role !== 'owner') return <DemoNotice status="forbidden" />

  const fixture = Object.values(demoHandoverCases).find(({ handoverId }) => handoverId === id)
  const item = fixture && demoFoundItemDetails.find(({ id }) => id === fixture.foundItemId)
  const recommendedBuilding = campusBuildings.find(({ id }) => id === demoHandoverBuildingId)
  if (!fixture || !item || !recommendedBuilding) return <DemoNotice status="not-found" />

  const initial: HandoverRecord = {
    handoverId: fixture.handoverId,
    claimId: fixture.claimId,
    claimStatus: fixture.claimStatus,
    item: { id: item.id, name: item.name, category: item.category, building: item.building, image: item.image, status: fixture.itemStatus },
    status: fixture.status,
    finderReadyUntil: null,
    ownerReadyUntil: null,
    building: fixture.status === 'DONE' ? recommendedBuilding : null,
    placeSetAt: fixture.placeSetAt,
    completedAt: fixture.completedAt,
  }

  return <DemoHandoverSession key={id} initial={initial} initialRole={role} recommendedBuilding={recommendedBuilding} />
}
