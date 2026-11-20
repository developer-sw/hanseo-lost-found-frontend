import type { HandoverStatus } from '../types/adminHandovers'
import { Icon } from './Icon'

type StepState = 'complete' | 'current' | 'upcoming' | 'not-recorded'

const states: Record<HandoverStatus, readonly StepState[]> = {
  WAITING: ['complete', 'current', 'upcoming', 'upcoming'],
  PLACE_SET: ['complete', 'complete', 'complete', 'upcoming'],
  DONE: ['complete', 'complete', 'complete', 'complete'],
}
const labels: Record<StepState, string> = { complete: '완료', current: '진행 중', upcoming: '미완료', 'not-recorded': '기록 없음' }
const doneWithoutPlace: readonly StepState[] = ['complete', 'not-recorded', 'not-recorded', 'complete']

export function HandoverTimeline({ status, hasPlace, admin = false }: { status: HandoverStatus; hasPlace: boolean; admin?: boolean }) {
  const className = admin ? 'admin-handover-timeline' : 'handover-timeline'
  const steps = ['주인 확정', admin ? '이동 대기' : '이동 가능 확인', '장소 확정', '수령완료']
  const stepStates = status === 'DONE' && !hasPlace ? doneWithoutPlace : states[status]

  return (
    <ol className={className} aria-label="전달 단계" role="list">
      {steps.map((label, index) => {
        const state = stepStates[index]

        return (
          <li key={label} data-state={state} aria-current={state === 'current' ? 'step' : undefined}>
            <span className={`${className}__marker`} aria-hidden="true">
              {state === 'complete' ? <Icon name="circle-check" size={18} /> : index + 1}
            </span>
            <strong>{label}</strong>
            <span className={`${className}__state`}>{labels[state]}</span>
          </li>
        )
      })}
    </ol>
  )
}
