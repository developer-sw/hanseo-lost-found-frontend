import type { MyActivityMutationResult } from '../types/myActivity'

const mutationFeedback: Record<Exclude<MyActivityMutationResult['status'], 'success'>, string> = {
  unavailable: '서버에 연결되지 않아 변경사항이 반영되지 않았습니다.',
  'sign-in-required': '변경하려면 학생 계정으로 로그인해 주세요.',
  forbidden: '본인의 신고와 신청만 변경할 수 있습니다.',
  'not-found': '변경할 신고 또는 신청을 찾을 수 없습니다.',
  conflict: '상태가 이미 변경되었습니다. 목록을 다시 열어 현재 상태를 확인해 주세요.',
  'has-claim-requests': '수령 신청이 걸린 습득 신고는 삭제할 수 없습니다.',
  'not-pending': '대기 중인 수령 신청만 취소할 수 있습니다.',
  error: '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.',
}

export function getMyActivityMutationFeedback(status: Exclude<MyActivityMutationResult['status'], 'success'>) {
  return mutationFeedback[status]
}
