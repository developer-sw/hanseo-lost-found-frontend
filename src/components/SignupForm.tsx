import { useState, type FormEvent } from 'react'
import { authService } from '../services/auth'
import type { SignupFields, StudentRegistrationRequest } from '../types/auth'
import { validateSignup } from '../utils/authValidation'
import { AuthField } from './AuthField'

type SignupErrors = Partial<Record<keyof SignupFields, string>>

const fields = [
  { name: 'studentId', label: '학번', autoComplete: 'username' },
  { name: 'name', label: '이름', autoComplete: 'name' },
  { name: 'department', label: '학과' },
  { name: 'phoneNumber', label: '전화번호', type: 'tel', inputMode: 'tel', autoComplete: 'tel', hint: '예: 010-1234-5678' },
  { name: 'password', label: '비밀번호', autoComplete: 'new-password', revealPassword: true },
  { name: 'passwordConfirmation', label: '비밀번호 확인', autoComplete: 'new-password', revealPassword: true },
] as const

function focusField(form: HTMLFormElement, name: keyof SignupFields) {
  const input = form.elements.namedItem(name)
  if (input instanceof HTMLInputElement) requestAnimationFrame(() => input.focus())
}

export function SignupForm() {
  const [errors, setErrors] = useState<SignupErrors>({})
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleFieldChange(name: keyof SignupFields) {
    setErrors((current) => {
      const next = { ...current }
      delete next[name]
      if (name === 'password') delete next.passwordConfirmation
      return next
    })
    setFeedback('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    const form = event.currentTarget
    const data = new FormData(form)
    const readField = (name: keyof SignupFields) => String(data.get(name) ?? '')
    const values: SignupFields = {
      studentId: readField('studentId').trim(),
      name: readField('name').trim(),
      department: readField('department').trim(),
      phoneNumber: readField('phoneNumber').trim(),
      password: readField('password'),
      passwordConfirmation: readField('passwordConfirmation'),
    }

    const validationErrors = validateSignup(values)
    const firstInvalidField = fields.find(({ name }) => validationErrors[name])
    setErrors(validationErrors)
    setFeedback('')

    if (firstInvalidField) {
      focusField(form, firstInvalidField.name)
      return
    }

    const request: StudentRegistrationRequest = {
      studentId: values.studentId,
      name: values.name,
      department: values.department,
      phoneNumber: values.phoneNumber,
      password: values.password,
    }

    setIsSubmitting(true)
    try {
      const result = await authService.registerStudent(request)
      if (result.status === 'duplicate-student-id') {
        setErrors({ studentId: '이미 등록된 학번입니다.' })
        focusField(form, 'studentId')
      } else if (result.status === 'registered') {
        form.reset()
        setFeedback('회원가입이 완료되었습니다. 로그인 화면으로 이동해 주세요.')
      } else {
        setFeedback('회원가입 API가 아직 연결되지 않았습니다. 입력 정보는 저장되지 않았습니다.')
      }
    } catch {
      setFeedback('회원가입을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="auth-form" method="post" onSubmit={handleSubmit} noValidate aria-busy={isSubmitting} aria-describedby="auth-preview-notice">
      <div className="auth-fields auth-fields--signup">
        {fields.map(({ name, ...field }) => (
          <AuthField
            key={name}
            id={`signup-${name}`}
            name={name}
            {...field}
            error={errors[name]}
            onChange={() => handleFieldChange(name)}
            required
          />
        ))}
      </div>

      <button className="auth-submit" type="submit" disabled={isSubmitting}>회원가입</button>

      <div role="status" aria-atomic="true">
        {feedback && <p className="auth-feedback">{feedback}</p>}
      </div>

      <p className="auth-form-footer">
        이미 계정이 있나요? <a href="/account">로그인 화면으로</a>
      </p>
    </form>
  )
}
