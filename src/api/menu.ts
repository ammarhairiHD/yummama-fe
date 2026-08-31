import api from './client'
import * as mock from '../demo/mockApi'
import type { MenuItem, Category, Ad } from '../types'

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

export const getCategories = () =>
  DEMO
    ? mock.demoGetCategories()
    : api.get<{ success: boolean; categories: Category[] }>('/categories').then((r) => r.data)

export const getMenuItems = (params?: { category?: string; featured?: string }) =>
  DEMO
    ? mock.demoGetMenuItems(params)
    : api.get<{ success: boolean; items: MenuItem[] }>('/menu', { params }).then((r) => r.data)

export const getMenuItem = (id: string) =>
  DEMO
    ? mock.demoGetMenuItem(id)
    : api.get<{ success: boolean; item: MenuItem }>(`/menu/${id}`).then((r) => r.data)

export const getAds = () =>
  DEMO
    ? mock.demoGetAds()
    : api.get<{ success: boolean; ads: Ad[] }>('/menu/ads/active').then((r) => r.data)
