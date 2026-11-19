import type { AuthRole, SignupFields } from '../types/auth'

interface LoginFields {
  identifier: string
  password: string
}

const koreanPhoneNumber = /^(?:010[ -]?\d{4}|(?:02|0(?:1[16789]|[3-6]\d|70))[ -]?\d{3,4})[ -]?\d{4}$/

export function validateLogin(
  fields: LoginFields,
  role: AuthRole,
): Partial<Record<keyof LoginFields, string>> {
  const errors: Partial<Record<keyof LoginFields, string>> = {}

  if (!fields.identifier.trim()) {
    errors.identifier = role === 'student' ? '학번을 입력해 주세요.' : '관리자 ID를 입력해 주세요.'
  }
  if (!fields.password) errors.password = '비밀번호를 입력해 주세요.'

  return errors
}

export function validateSignup(fields: SignupFields): Partial<Record<keyof SignupFields, string>> {
  const errors: Partial<Record<keyof SignupFields, string>> = {}

  if (!fields.studentId.trim()) errors.studentId = '학번을 입력해 주세요.'
  if (!fields.name.trim()) errors.name = '이름을 입력해 주세요.'
  if (!fields.department.trim()) errors.department = '학과를 입력해 주세요.'

  const phoneNumber = fields.phoneNumber.trim()
  if (!phoneNumber) {
    errors.phoneNumber = '전화번호를 입력해 주세요.'
  } else if (!koreanPhoneNumber.test(phoneNumber)) {
    errors.phoneNumber = '전화번호를 010-1234-5678과 같은 형식으로 입력해 주세요.'
  }

  if (!fields.password) errors.password = '비밀번호를 입력해 주세요.'
  if (!fields.passwordConfirmation) {
    errors.passwordConfirmation = '비밀번호를 다시 입력해 주세요.'
  } else if (fields.password !== fields.passwordConfirmation) {
    errors.passwordConfirmation = '비밀번호가 일치하지 않습니다.'
  }

  return errors
}
