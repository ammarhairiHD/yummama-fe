import api from './client'
import * as mock from '../demo/mockApi'
import type { User } from '../types'

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

interface LoginPayload { email: string; password: string }
interface RegisterPayload { name: string; email: string; phone: string; password: string; referralCode?: string }
interface AuthResponse { success: boolean; token: string; user: User; message?: string }

export const login = (data: LoginPayload) =>
  DEMO
    ? mock.demoLogin(data.email, data.password)
    : api.post<AuthResponse>('/auth/login', data).then((r) => r.data)

export const register = (data: RegisterPayload) =>
  DEMO
    ? mock.demoRegister(data)
    : api.post<AuthResponse>('/auth/register', data).then((r) => r.data)

export const getMe = () =>
  DEMO
    ? mock.demoGetMe()
    : api.get<{ success: boolean; user: User }>('/auth/me').then((r) => r.data)
