import type { HandoverActionError } from '../types/handover'

export const handoverActionMessages: Record<HandoverActionError['status'], string> = {
  unavailable: '전달 진행 API 연결이 필요합니다.',
  'sign-in-required': '학생 계정 로그인이 필요합니다.',
  expired: '로그인 시간이 만료되었습니다. 다시 로그인해 주세요.',
  forbidden: '이 전달 건을 처리할 권한이 없습니다.',
  'not-found': '선택한 전달 건 또는 건물 정보를 찾을 수 없습니다.',
  conflict: '이미 처리되었거나 전달 상태가 변경되었습니다. 최신 상태를 확인해 주세요.',
  'network-error': '네트워크에 연결하지 못했습니다. 연결 상태를 확인한 뒤 다시 시도해 주세요.',
  error: '전달 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.',
  unsupported: '이 브라우저는 위치 정보 기능을 지원하지 않습니다.',
  'insecure-context': '위치 확인은 HTTPS 또는 localhost 환경에서만 가능합니다.',
  'permission-denied': '위치 권한이 거부되었습니다. 브라우저의 위치 권한을 확인해 주세요.',
  timeout: '위치를 확인하는 시간이 초과되었습니다. 다시 시도해 주세요.',
  'position-unavailable': '현재 위치를 확인할 수 없습니다. 기기의 위치 설정을 확인해 주세요.',
  aborted: '위치 확인이 취소되었습니다.',
}
