import { useState, type ComponentPropsWithoutRef } from 'react'
import { Icon } from './Icon'

type AuthFieldProps = ComponentPropsWithoutRef<'input'> & {
  id: string
  label: string
  error?: string
  hint?: string
  revealPassword?: boolean
}

export function AuthField({
  id,
  label,
  error,
  hint,
  revealPassword = false,
  type = 'text',
  'aria-describedby': describedBy,
  ...inputProps
}: AuthFieldProps) {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const descriptionIds = [error && `${id}-error`, hint && `${id}-hint`, describedBy].filter(Boolean).join(' ')
  const inputType = revealPassword ? (passwordVisible ? 'text' : 'password') : type

  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-field__control">
        <input
          {...inputProps}
          id={id}
          type={inputType}
          aria-invalid={error ? true : undefined}
          aria-describedby={descriptionIds || undefined}
        />
        {revealPassword && (
          <button
            className="auth-field__reveal"
            type="button"
            aria-label={`${label} ${passwordVisible ? '숨기기' : '표시'}`}
            aria-controls={id}
            onClick={() => setPasswordVisible((visible) => !visible)}
          >
            <Icon name={passwordVisible ? 'eye-off' : 'eye'} size={20} />
          </button>
        )}
      </div>
      {error && <p className="auth-field__error" id={`${id}-error`}>{error}</p>}
      {hint && <p className="auth-field__hint" id={`${id}-hint`}>{hint}</p>}
    </div>
  )
}
