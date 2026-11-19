import { Icon, type IconName } from './Icon'
import '../styles/home-sections.css'

const steps = [
  { number: '①', icon: 'edit', short: '신고', title: '신고 등록', detail: '분실·습득' },
  { number: '②', icon: 'layers', short: '매칭', title: '자동 매칭', detail: '유사 물건 추천' },
  { number: '③', icon: 'users', short: '신청', title: '수령 신청', detail: '여러 명 가능' },
  { number: '④', icon: 'shield-check', short: '확정', title: '관리자 확정', detail: '증빙 확인' },
  { number: '⑤', icon: 'map-pin', short: '전달', title: '전달 장소 추천', detail: '두 당사자' },
  { number: '⑥', icon: 'circle-check', short: '완료', title: '수령 완료', detail: '받았어요' },
] satisfies { number: string; icon: IconName; short: string; title: string; detail: string }[]

export function ProcessOverview({ detailed = false }: { detailed?: boolean }) {
  return (
    <section className={detailed ? 'process-overview process-overview--detailed' : 'process-overview'} aria-labelledby="process-title">
      <div className="process-overview__heading">
        <div>
          <h2 id="process-title">이용 절차</h2>
          <p>한눈에 보기</p>
        </div>
        {!detailed && (
          <a className="process-overview__guide" href="/guide">
            자세히 보기
            <Icon name="chevron-right" size={14} />
          </a>
        )}
      </div>
      <ol className="process-overview__steps">
        {steps.map(({ number, icon, short, title, detail }, index) => (
          <li className="process-step" key={title}>
            <span className="process-step__icon"><Icon name={icon} size={34} /></span>
            <span className="process-step__text">
              <strong className="process-step__title">{number} {title}</strong>
              <span className="process-step__detail">({detail})</span>
            </span>
            <span className="process-step__short" aria-hidden="true">{short}</span>
            {index < steps.length - 1 && (
              <span className="process-step__arrow"><Icon name="arrow-right" size={22} /></span>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
