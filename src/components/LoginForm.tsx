import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { flushSync } from 'react-dom'
import { authService } from '../services/auth'
import type { AuthRole, LoginRequest } from '../types/auth'
import { validateLogin } from '../utils/authValidation'
import { AuthField } from './AuthField'
import { Icon } from './Icon'

const roles = [
  { role: 'student', label: '학생', icon: 'user' },
  { role: 'admin', label: '관리자', icon: 'shield-check' },
] as const

type LoginErrors = ReturnType<typeof validateLogin>

function RoleLoginForm({ role }: { role: AuthRole }) {
  const fieldId = useId()
  const [errors, setErrors] = useState<LoginErrors>({})
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setSubmitting] = useState(false)

  function clearFieldError(field: keyof LoginErrors) {
    setErrors((current) => current[field] ? { ...current, [field]: undefined } : current)
    setFeedback('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    const form = event.currentTarget
    const data = new FormData(form)
    const identifier = String(data.get('identifier') ?? '').trim()
    const password = String(data.get('password') ?? '')
    const nextErrors = validateLogin({ identifier, password }, role)
    const invalidField = nextErrors.identifier ? 'identifier' : nextErrors.password ? 'password' : undefined

    setFeedback('')

    if (invalidField) {
      flushSync(() => setErrors(nextErrors))
      form.querySelector<HTMLInputElement>(`input[name="${invalidField}"]`)?.focus()
      return
    }

    setErrors(nextErrors)
    setSubmitting(true)
    const request: LoginRequest = role === 'student'
      ? { role, studentId: identifier, password }
      : { role, adminId: identifier, password }

    try {
      const result = await authService.login(request)
      setFeedback(result.status === 'invalid-credentials'
        ? '아이디 또는 비밀번호가 올바르지 않습니다.'
        : '인증 서버 연결을 준비 중입니다. 아직 로그인할 수 없습니다.')
    } catch {
      setFeedback('로그인 요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="auth-form" method="post" noValidate onSubmit={handleSubmit} aria-describedby="auth-preview-notice">
      <div className="auth-fields">
        <AuthField
          id={`${fieldId}-identifier`}
          label={role === 'student' ? '학번' : '관리자 ID'}
          name="identifier"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          error={errors.identifier}
          onChange={() => clearFieldError('identifier')}
        />
        <AuthField
          id={`${fieldId}-password`}
          label="비밀번호"
          name="password"
          type="password"
          autoComplete="current-password"
          revealPassword
          required
          error={errors.password}
          onChange={() => clearFieldError('password')}
        />
      </div>
      <div className="auth-form-actions">
        <button className="auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? '로그인 확인 중…' : '로그인'}
        </button>
        <div role="status">
          {feedback && <p className="auth-feedback">{feedback}</p>}
        </div>
      </div>
      {role === 'student' && (
        <p className="auth-form-footer">
          처음 이용하시나요? <a href="/account/signup">학생 회원가입</a>
        </p>
      )}
    </form>
  )
}

export function LoginForm() {
  const tabId = useId()
  const [activeRole, setActiveRole] = useState<AuthRole>('student')
  const tabs = useRef<Record<AuthRole, HTMLButtonElement | null>>({ student: null, admin: null })

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, role: AuthRole) {
    const otherRole = role === 'student' ? 'admin' : 'student'
    const tabByKey: Record<string, AuthRole | undefined> = {
      ArrowLeft: otherRole,
      ArrowRight: otherRole,
      Home: 'student',
      End: 'admin',
    }
    const nextRole = tabByKey[event.key]
    if (!nextRole) return

    event.preventDefault()
    setActiveRole(nextRole)
    tabs.current[nextRole]?.focus()
  }

  return (
    <div className="auth-login">
      <div className="auth-role-tabs" role="tablist" aria-label="로그인 유형">
        {roles.map(({ role, label, icon }) => (
          <button
            key={role}
            id={`${tabId}-${role}-tab`}
            type="button"
            className="auth-role-tab"
            role="tab"
            aria-selected={role === activeRole}
            aria-controls={`${tabId}-${role}-panel`}
            tabIndex={role === activeRole ? 0 : -1}
            ref={(tab) => { tabs.current[role] = tab }}
            onClick={() => setActiveRole(role)}
            onKeyDown={(event) => handleTabKeyDown(event, role)}
          >
            <Icon name={icon} size={19} />
            {label}
          </button>
        ))}
      </div>
      {roles.map(({ role }) => (
        <div
          key={role}
          id={`${tabId}-${role}-panel`}
          className="auth-tab-panel"
          role="tabpanel"
          aria-labelledby={`${tabId}-${role}-tab`}
          hidden={role !== activeRole}
        >
          {role === activeRole && <RoleLoginForm role={role} />}
        </div>
      ))}
    </div>
  )
}
