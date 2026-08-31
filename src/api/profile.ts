import api from './client'
import * as mock from '../demo/mockApi'
import type { User } from '../types'

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

export const getProfile = () =>
  DEMO
    ? mock.demoGetProfile()
    : api.get<{ success: boolean; user: User }>('/profile').then((r) => r.data)

export const updateProfile = (data: Partial<Pick<User, 'name' | 'phone' | 'address' | 'avatar'>>) =>
  DEMO
    ? mock.demoUpdateProfile(data)
    : api.patch<{ success: boolean; user: User }>('/profile', data).then((r) => r.data)

export const changePassword = (currentPassword: string, newPassword: string) =>
  DEMO
    ? mock.demoChangePassword(currentPassword, newPassword)
    : api
        .patch<{ success: boolean; message: string }>('/profile/password', {
          currentPassword,
          newPassword,
        })
        .then((r) => r.data)
