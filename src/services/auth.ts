import type { AuthUser, LoginRequest, StudentRegistrationRequest } from '../types/auth'

export type LoginResult =
  | { status: 'unavailable' }
  | { status: 'invalid-credentials' }
  | { status: 'authenticated'; user: AuthUser }

export type RegistrationResult =
  | { status: 'unavailable' }
  | { status: 'duplicate-student-id' }
  | { status: 'registered' }

export const authService = {
  async login(_request: LoginRequest): Promise<LoginResult> {
    return { status: 'unavailable' }
  },

  async registerStudent(_request: StudentRegistrationRequest): Promise<RegistrationResult> {
    return { status: 'unavailable' }
  },
}
