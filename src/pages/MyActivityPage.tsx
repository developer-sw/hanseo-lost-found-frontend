import { useEffect, useRef, useState } from 'react'
import { getFoundItemPath } from '../app/foundItemRoutes'
import { getMatchResultPath, MATCH_DEMO_PATH } from '../app/matchRoutes'
import { getMyActivityPath, getMyActivityTab, type MyActivityTab } from '../app/myActivityRoutes'
import { FoundReportForm } from '../components/FoundReportForm'
import { Hanbi } from '../components/Hanbi'
import { Icon, type IconName } from '../components/Icon'
import { LostReportForm } from '../components/LostReportForm'
import { MyActivityConfirmDialog } from '../components/MyActivityConfirmDialog'
import { MyActivityLists } from '../components/MyActivityLists'
import { myActivityService } from '../services/myActivity'
import type { MyActivity, MyActivityAction, MyActivityMutationResult, MyActivityResult, MyLostReport } from '../types/myActivity'
import '../styles/found-report.css'
import '../styles/report.css'
import '../styles/my-activity.css'

type ActivityView = MyActivityResult | { status: 'loading' }
type ReadyActivity = Extract<MyActivityResult, { status: 'ready' }>

const tabs: readonly { key: MyActivityTab; label: string; icon: IconName }[] = [
  { key: 'lost', label: '내 분실 신고', icon: 'edit' },
  { key: 'found', label: '내 습득 신고', icon: 'box' },
  { key: 'claims', label: '내 수령 신청', icon: 'clipboard' },
]

const activityNotices = {
  loading: '내 신고와 수령 신청을 불러오는 중입니다.',
  error: '내 신고와 수령 신청을 불러오지 못했습니다.',
  forbidden: '이 목록에 접근할 권한이 없습니다.',
  'sign-in-required': '학생 계정으로 로그인해 주세요.',
  unavailable: '마이페이지 API가 아직 연결되지 않았습니다.',
  'not-found': '수정할 신고를 찾을 수 없습니다.',
}

function ActivityNotice({ status, tab, account, onRetry }: {
  status: keyof typeof activityNotices
  tab: MyActivityTab
  account: boolean
  onRetry: () => void
}) {
  return (
    <section className="my-activity__notice" aria-labelledby="my-activity-notice-title">
      <span className="my-activity__stat-icon"><Icon name={status === 'loading' ? 'clock' : 'info'} size={23} /></span>
      <h2 id="my-activity-notice-title" role={status === 'loading' ? 'status' : undefined}>{activityNotices[status]}</h2>
      {status === 'sign-in-required' && (
        <div className="page-actions">
          <a className="primary-link" href="/account">학생 로그인</a>
          <a className="secondary-link" href={getMyActivityPath(tab)}>데모 목록 보기</a>
        </div>
      )}
      {status === 'unavailable' && <a className="secondary-link" href={getMyActivityPath(tab)}>데모 목록 보기</a>}
      {status === 'not-found' && <a className="secondary-link" href={getMyActivityPath(tab, { account })}>목록으로 돌아가기</a>}
      {status === 'error' && <button className="secondary-link" type="button" onClick={onRetry}>다시 시도</button>}
    </section>
  )
}

function ActivityOverview({ activity }: { activity: MyActivity }) {
  const { account, lostReports, foundReports, claims } = activity
  const metrics: readonly { label: string; icon: IconName; count: number }[] = [
    { label: '진행 중인 분실 신고', icon: 'edit', count: lostReports.filter(({ status }) => status === 'OPEN').length },
    { label: '보관 중인 내 습득 신고', icon: 'box', count: foundReports.filter(({ status }) => status === 'STORED').length },
    { label: '대기 중인 내 수령 신청', icon: 'clock', count: claims.filter(({ status }) => status === 'PENDING').length },
  ]

  return (
    <div className="my-activity__overview">
      <section className="my-activity__profile" aria-label="학생 계정 정보">
        <dl>
          <div><dt>이름</dt><dd>{account.name}</dd></div>
          <div><dt>학번</dt><dd>{account.studentId}</dd></div>
          <div><dt>학과</dt><dd>{account.department}</dd></div>
        </dl>
        <Hanbi className="my-activity__mascot" compact />
      </section>
      <dl className="my-activity__statistics" aria-label="진행 현황">
        {metrics.map(({ label, icon, count }) => (
          <div className="my-activity__stat" key={label}>
            <dt><span className="my-activity__stat-icon"><Icon name={icon} size={20} /></span>{label}</dt>
            <dd>{count}<span>건</span></dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function ReportEdit({ data, tab, id, account }: { data: ReadyActivity; tab: MyActivityTab; id: string; account: boolean }) {
  const lost = tab === 'lost' ? data.activity.lostReports.find((report) => report.id === id) : undefined
  const found = tab === 'found' ? data.activity.foundReports.find((report) => report.id === id) : undefined
  const backHref = getMyActivityPath(tab, { account })
  const isDemo = data.source === 'demo'
  const title = found ? '습득 신고 수정' : '분실 신고 수정'
  const onSaved = () => window.location.assign(backHref)
  const unavailable = async (): Promise<MyActivityMutationResult> => ({ status: 'unavailable' })

  if (!lost && !found) {
    return (
      <main className="site-container inner-page my-activity-page" id="main-content">
        <h1>신고 수정</h1>
        <ActivityNotice status="not-found" tab={tab} account={account} onRetry={() => {}} />
      </main>
    )
  }

  return (
    <main className={`site-container report-page my-activity-edit${found ? ' found-report-page' : ''}`} id="main-content">
      <a className="back-link" href={backHref}><Icon name="arrow-left" size={18} />목록으로 돌아가기</a>
      <header className="report-intro">
        <div className="report-intro__copy">
          <h1>{title}</h1>
          <p>{(lost?.itemName ?? found?.name)}의 신고 내용을 확인하고 수정해 주세요.</p>
        </div>
        <Hanbi className="report-mascot" compact />
      </header>
      <div className="report-card">
        <p className="report-demo-notice" id="my-edit-notice"><Icon name="info" size={18} />
          {isDemo ? '데모 모드입니다. 수정한 내용은 미리보기에서 확인할 수 있습니다.' : '수정한 내용을 확인한 뒤 저장해 주세요.'}
        </p>
        {lost && (
          <LostReportForm edit={{
            initial: lost, noticeId: 'my-edit-notice', returnHref: backHref, onSaved,
            onSave: isDemo ? unavailable : (request) => myActivityService.updateLost(lost.id, request),
          }} />
        )}
        {found && (
          <FoundReportForm edit={{
            initial: found, noticeId: 'my-edit-notice', returnHref: backHref, onSaved,
            onSave: isDemo ? unavailable : (request) => myActivityService.updateFound(found.id, request),
          }} />
        )}
      </div>
    </main>
  )
}

async function applyActivityAction(action: MyActivityAction, data: ReadyActivity): Promise<MyActivityMutationResult> {
  const { activity, source } = data
  switch (action.kind) {
    case 'delete-lost': {
      if (!activity.lostReports.some(({ id }) => id === action.id)) return { status: 'not-found' }
      return source === 'demo' ? { status: 'unavailable' } : myActivityService.deleteLost(action.id)
    }
    case 'delete-found': {
      const report = activity.foundReports.find(({ id }) => id === action.id)
      if (!report) return { status: 'not-found' }
      if (report.hasClaimRequests) return { status: 'has-claim-requests' }
      return source === 'demo' ? { status: 'unavailable' } : myActivityService.deleteFound(action.id)
    }
    case 'cancel-claim': {
      const claim = activity.claims.find(({ id }) => id === action.id)
      if (!claim) return { status: 'not-found' }
      if (claim.status !== 'PENDING') return { status: 'not-pending' }
      return source === 'demo' ? { status: 'unavailable' } : myActivityService.cancelClaim(action.id)
    }
  }
}

export function MyActivityPage({ params }: { params: URLSearchParams }) {
  const tab = getMyActivityTab(params)
  const empty = params.get('demo') === 'empty'
  const account = params.get('view') === 'account'
  const edit = params.get('edit')
  const [data, setData] = useState<ActivityView>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const [action, setAction] = useState<MyActivityAction | null>(null)
  const actionTrigger = useRef<HTMLElement>(null)

  useEffect(() => {
    let active = true
    myActivityService.getActivity({ mode: account ? 'api' : 'demo', empty }).then(
      (result) => { if (active) setData(result) },
      () => { if (active) setData({ status: 'error' }) },
    )
    return () => { active = false }
  }, [account, empty, attempt])

  function refresh() {
    setAction(null)
    setData({ status: 'loading' })
    setAttempt((current) => current + 1)
  }

  function openConfirmation(next: MyActivityAction) {
    actionTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setAction(next)
  }

  function closeConfirmation() {
    setAction(null)
    actionTrigger.current?.focus()
    actionTrigger.current = null
  }

  if (data.status === 'ready' && edit !== null) return <ReportEdit data={data} tab={tab} id={edit} account={account} />

  function getLostMatchHref(report: MyLostReport) {
    return data.status === 'ready' && data.source === 'api'
      ? getMatchResultPath(report.id)
      : `${MATCH_DEMO_PATH}?${new URLSearchParams({ example: report.id })}`
  }

  return (
    <main className="site-container inner-page my-activity-page" id="main-content" aria-busy={data.status === 'loading'}>
      <header className="my-activity__heading">
        <h1>마이페이지</h1>
        <p>내가 등록한 신고와 수령 신청 현황을 확인해 보세요.</p>
      </header>

      {data.status === 'ready' ? (
        <>
          {data.source === 'demo' && (
            <div className="my-activity__demo">
              <p><Icon name="info" size={18} /><span><strong>데모 모드</strong> · 예시 계정과 목록입니다. 수정·삭제·취소는 서버에 저장되지 않습니다.</span></p>
              <div className="my-activity__demo-links">
                <a href={getMyActivityPath(tab, { empty: !empty })}>{empty ? '예시 목록 보기' : '빈 목록 보기'}</a>
                <a href={getMyActivityPath(tab, { account: true })}>실제 계정 이용</a>
              </div>
            </div>
          )}
          <ActivityOverview activity={data.activity} />
          <nav className="my-activity__tabs" aria-label="마이페이지 메뉴">
            {tabs.map(({ key, label, icon }) => (
              <a key={key} href={getMyActivityPath(key, { account, empty })} aria-current={tab === key ? 'page' : undefined}>
                <Icon name={icon} size={19} />{label}
              </a>
            ))}
          </nav>
          <section aria-labelledby="my-activity-list-title">
            <h2 className="sr-only" id="my-activity-list-title">{tabs.find(({ key }) => key === tab)?.label}</h2>
            <MyActivityLists
              activity={data.activity}
              tab={tab}
              getLostMatchHref={getLostMatchHref}
              getEditHref={(kind, id) => getMyActivityPath(kind, { account, edit: id })}
              getDetailHref={(kind, id) => getFoundItemPath(id, { source: 'my', tab: kind, account })}
              onAction={openConfirmation}
            />
          </section>
          {action && (
            <MyActivityConfirmDialog
              action={action}
              demo={data.source === 'demo'}
              onConfirm={() => applyActivityAction(action, data)}
              onClose={closeConfirmation}
              onUpdated={refresh}
            />
          )}
        </>
      ) : <ActivityNotice status={data.status} tab={tab} account={account} onRetry={refresh} />}
    </main>
  )
}
