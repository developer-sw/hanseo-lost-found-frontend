import type { ReactNode } from 'react'

interface ReportControlProps {
  id: string
  required?: boolean
  'aria-invalid'?: true
  'aria-describedby'?: string
}

interface ReportFieldProps {
  id: string
  label: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  children: (control: ReportControlProps) => ReactNode
}

export function ReportField({ id, label, error, hint, required, className, children }: ReportFieldProps) {
  const descriptions = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ')

  return (
    <div className={className ? `report-field ${className}` : 'report-field'}>
      <label htmlFor={id}>
        {label}
        {required && <span className="report-field__required" aria-hidden="true"> *</span>}
      </label>
      {children({
        id,
        required,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': descriptions || undefined,
      })}
      {error && <p className="report-field__error" id={`${id}-error`}>{error}</p>}
      {hint && <p className="report-field__hint" id={`${id}-hint`}>{hint}</p>}
    </div>
  )
}
