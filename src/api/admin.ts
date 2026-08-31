/**
 * Admin API — wraps all /api/admin/* endpoints.
 * In demo mode delegates to mockApi admin functions.
 */
import api from './client'
import * as mock from '../demo/mockApi'

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

// ─── Orders ──────────────────────────────────────────────────────────────────
export const adminGetOrders = (params?: { status?: string; page?: number; limit?: number }) =>
  DEMO
    ? mock.adminGetOrders(params)
    : api.get('/admin/orders', { params }).then((r) => r.data)

export const adminUpdateOrderStatus = (
  id: string,
  payload: { status: string; estimatedTime?: number; adminNote?: string }
) =>
  DEMO
    ? mock.adminUpdateOrderStatus(id, payload)
    : api.patch(`/admin/orders/${id}/status`, payload).then((r) => r.data)

export const adminRejectOrder = (id: string, reason: string) =>
  DEMO
    ? mock.adminRejectOrder(id, reason)
    : api.patch(`/admin/orders/${id}/reject`, { reason }).then((r) => r.data)

// ─── Users ───────────────────────────────────────────────────────────────────
export const adminGetUsers = (params?: { role?: string; page?: number; limit?: number }) =>
  DEMO
    ? mock.adminGetUsers(params)
    : api.get('/admin/users', { params }).then((r) => r.data)

export const adminAddAdmin = (data: {
  name: string
  email: string
  phone: string
  password: string
  position: string
}) =>
  DEMO
    ? mock.adminAddAdmin(data)
    : api.post('/admin/users/admin', data).then((r) => r.data)

export const adminToggleUserStatus = (id: string, isActive: boolean) =>
  DEMO
    ? mock.adminToggleUserStatus(id, isActive)
    : api.patch(`/admin/users/${id}/status`, { isActive }).then((r) => r.data)

// ─── Promos ──────────────────────────────────────────────────────────────────
export const adminGetPromos = () =>
  DEMO ? mock.adminGetPromos() : api.get('/admin/promos').then((r) => r.data)

export const adminCreatePromo = (data: any) =>
  DEMO ? mock.adminCreatePromo(data) : api.post('/admin/promos', data).then((r) => r.data)

export const adminUpdatePromo = (id: string, data: any) =>
  DEMO ? mock.adminUpdatePromo(id, data) : api.put(`/admin/promos/${id}`, data).then((r) => r.data)

export const adminDeletePromo = (id: string) =>
  DEMO ? mock.adminDeletePromo(id) : api.delete(`/admin/promos/${id}`).then((r) => r.data)

// ─── Menu ─────────────────────────────────────────────────────────────────────
export const adminGetMenu = () =>
  DEMO ? mock.adminGetMenu() : api.get('/admin/menu').then((r) => r.data)

export const adminCreateMenuItem = (data: any) =>
  DEMO ? mock.adminCreateMenuItem(data) : api.post('/admin/menu', data).then((r) => r.data)

export const adminUpdateMenuItem = (id: string, data: any) =>
  DEMO ? mock.adminUpdateMenuItem(id, data) : api.put(`/admin/menu/${id}`, data).then((r) => r.data)

export const adminDeleteMenuItem = (id: string) =>
  DEMO ? mock.adminDeleteMenuItem(id) : api.delete(`/admin/menu/${id}`).then((r) => r.data)

// ─── Categories ───────────────────────────────────────────────────────────────
export const adminGetCategories = () =>
  DEMO ? mock.adminGetCategories() : api.get('/admin/categories').then((r) => r.data)

export const adminCreateCategory = (data: any) =>
  DEMO ? mock.adminCreateCategory(data) : api.post('/admin/categories', data).then((r) => r.data)

export const adminUpdateCategory = (id: string, data: any) =>
  DEMO ? mock.adminUpdateCategory(id, data) : api.put(`/admin/categories/${id}`, data).then((r) => r.data)

export const adminDeleteCategory = (id: string) =>
  DEMO ? mock.adminDeleteCategory(id) : api.delete(`/admin/categories/${id}`).then((r) => r.data)

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const adminGetDashboard = (year?: number) =>
  DEMO
    ? mock.adminGetDashboard(year)
    : api.get('/admin/dashboard', { params: { year } }).then((r) => r.data)
