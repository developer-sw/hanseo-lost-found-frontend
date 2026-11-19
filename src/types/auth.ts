export type AuthRole = 'student' | 'admin'

export type LoginRequest =
  | { role: 'student'; studentId: string; password: string }
  | { role: 'admin'; adminId: string; password: string }

export interface StudentRegistrationRequest {
  studentId: string
  name: string
  department: string
  phoneNumber: string
  password: string
}

export interface SignupFields extends StudentRegistrationRequest {
  passwordConfirmation: string
}

export type AuthUser =
  | { role: 'student'; studentId: string; name?: string }
  | { role: 'admin'; adminId: string; name?: string }

export type AuthState =
  | { status: 'checking' }
  | { status: 'anonymous' }
  | { status: 'authenticated'; user: AuthUser }
