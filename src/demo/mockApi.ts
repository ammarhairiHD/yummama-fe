/**
 * Mock API — mirrors every real API module's exported functions.
 * Used when VITE_DEMO_MODE=true so the app works without a backend.
 */

import {
  MOCK_USERS, MOCK_ADS, MOCK_CATEGORIES, MOCK_MENU_ITEMS,
  MOCK_PROMOS, MOCK_ORDERS, MOCK_TRANSACTIONS,
  MOCK_ALL_ORDERS, MOCK_ALL_USERS, MOCK_DASHBOARD,
} from './mockData'
import type { User, Order, Transaction, UserWithStats, Promo, MenuItem, Category } from '../types'

// Simulated network delay (ms)
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms))

// In-memory state for the demo session
let _user: User | null = null
let _orders = [...MOCK_ORDERS]
// Per-account wallet/points state so admin and customer don't share balances
const WALLET_STATE: Record<string, { balance: number; points: number }> = {
  'nasrul@yummama.com':    { balance: 250.0, points: 500 },
  'halusinasibyammar@gmail.com': { balance: 85.5,  points: 120 },
}
let _walletBalance = 85.5
let _points = 120
let _transactions = [...MOCK_TRANSACTIONS]

// ─── Auth ─────────────────────────────────────────────────────────────────────
export async function demoLogin(email: string, password: string) {
  await delay()
  const PASSWORDS: Record<string, string> = {
    'nasrul@yummama.com': 'yummama2026',
    'halusinasibyammar@gmail.com': 'test1234',
  }
  const key = email.toLowerCase()
  const user = MOCK_USERS[key]
  if (!user || PASSWORDS[key] !== password) {
    throw { response: { data: { message: 'Invalid email or password' } } }
  }
  // Load the correct wallet/points for this account
  const state = WALLET_STATE[key] ?? { balance: 0, points: 0 }
  _walletBalance = state.balance
  _points = state.points
  _user = { ...user, walletBalance: _walletBalance, points: _points }
  return { success: true, token: 'demo-jwt-token', user: _user }
}

export async function demoRegister(data: any) {
  await delay()
  const newUser: User = {
    id: 'demo-new-' + Date.now(),
    name: data.name,
    email: data.email,
    phone: data.phone,
    userId: 'YMM-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    points: data.referralCode ? 20 : 0,
    walletBalance: 0,
    role: 'customer',
  }
  _user = newUser
  _walletBalance = 0
  _points = newUser.points
  return { success: true, token: 'demo-jwt-token', user: _user }
}

export async function demoGetMe() {
  await delay(200)
  if (!_user) throw { response: { status: 401 } }
  return { success: true, user: { ..._user, walletBalance: _walletBalance, points: _points } }
}

// ─── Menu ─────────────────────────────────────────────────────────────────────
export async function demoGetAds() {
  await delay(300)
  return { success: true, ads: MOCK_ADS }
}

export async function demoGetCategories() {
  await delay(300)
  return { success: true, categories: MOCK_CATEGORIES }
}

export async function demoGetMenuItems(params?: { category?: string; featured?: string }) {
  await delay(400)
  let items = MOCK_MENU_ITEMS
  if (params?.category) {
    items = items.filter((item) => {
      const cat = typeof item.category === 'object' ? item.category._id : item.category
      return cat === params.category
    })
  }
  if (params?.featured === 'true') {
    items = items.filter((item) => item.isFeatured)
  }
  return { success: true, items }
}

export async function demoGetMenuItem(id: string) {
  await delay(200)
  const item = MOCK_MENU_ITEMS.find((i) => i._id === id)
  if (!item) throw { response: { data: { message: 'Not found' } } }
  return { success: true, item }
}

// ─── Orders ───────────────────────────────────────────────────────────────────
export async function demoGetOrders(status?: string) {
  await delay(400)
  const orders = status
    ? _orders.filter((o) => o.status === status)
    : _orders
  return { success: true, orders: [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) }
}

export async function demoGetOrder(id: string) {
  await delay(200)
  const order = _orders.find((o) => o._id === id)
  if (!order) throw { response: { data: { message: 'Order not found' } } }
  return { success: true, order }
}

export async function demoPlaceOrder(payload: any) {
  await delay(800)
  const subtotal = payload.items.reduce((s: number, i: any) => {
    const addonTotal = (i.selectedAddons || []).reduce((a: number, x: any) => a + x.price, 0)
    return s + (i.price + addonTotal) * i.quantity
  }, 0)

  let discount = 0
  if (payload.promoCode) {
    const promo = MOCK_PROMOS.find((p) => p.code === payload.promoCode.toUpperCase())
    if (promo) {
      if (promo.discountType === 'percentage') {
        discount = (subtotal * promo.discountValue) / 100
        if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount)
      } else {
        discount = promo.discountValue
      }
    }
  }

  const deliveryFee = payload.fulfillmentType === 'delivery' ? 3.0 : 0
  const total = Math.max(0, subtotal - discount + deliveryFee)

  if (_walletBalance < total) {
    throw { response: { data: { message: 'Insufficient wallet balance' } } }
  }

  const pointsEarned = Math.floor(total)
  _walletBalance = parseFloat((_walletBalance - total).toFixed(2))
  _points += pointsEarned

  if (_user) {
    _user = { ..._user, walletBalance: _walletBalance, points: _points }
  }

  // Add transaction
  const tx: Transaction = {
    _id: 'tx-demo-' + Date.now(),
    type: 'payment',
    amount: -total,
    balanceBefore: _walletBalance + total,
    balanceAfter: _walletBalance,
    status: 'success',
    description: 'Payment for order',
    createdAt: new Date().toISOString(),
  }
  _transactions = [tx, ..._transactions]

  const order: Order = {
    _id: 'order-demo-' + Date.now(),
    orderNumber: 'YMM-' + Date.now().toString(36).toUpperCase(),
    user: _user?.id ?? 'demo',
    items: payload.items.map((i: any) => ({
      menuItem: i.menuItem,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      selectedAddons: i.selectedAddons,
      itemTotal: (i.price + (i.selectedAddons || []).reduce((a: number, x: any) => a + x.price, 0)) * i.quantity,
      note: i.note,
    })),
    subtotal,
    discount,
    deliveryFee,
    total,
    status: 'paid',
    fulfillmentType: payload.fulfillmentType,
    deliveryAddress: payload.deliveryAddress,
    paymentMethod: 'wallet',
    promoCode: payload.promoCode,
    pointsEarned,
    note: payload.note,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  _orders = [order, ..._orders]
  return { success: true, order }
}

export async function demoCancelOrder(id: string) {
  await delay(500)
  const idx = _orders.findIndex((o) => o._id === id)
  if (idx === -1) throw { response: { data: { message: 'Order not found' } } }
  if (!['draft', 'pending_payment'].includes(_orders[idx].status)) {
    throw { response: { data: { message: 'Order cannot be cancelled at this stage' } } }
  }
  _orders[idx] = { ..._orders[idx], status: 'cancelled' }
  return { success: true, order: _orders[idx] }
}

// ─── Promos ───────────────────────────────────────────────────────────────────
export async function demoGetPromos() {
  await delay(300)
  return { success: true, promos: MOCK_PROMOS }
}

export async function demoValidatePromo(code: string, orderAmount: number) {
  await delay(500)
  const promo = MOCK_PROMOS.find(
    (p) => p.code === code.toUpperCase() && p.isActive
  )
  if (!promo) throw { response: { data: { message: 'Invalid or expired promo code' } } }
  if (orderAmount < promo.minOrderAmount) {
    throw {
      response: {
        data: { message: `Minimum order for this promo is RM${promo.minOrderAmount.toFixed(2)}` },
      },
    }
  }
  let discount = 0
  if (promo.discountType === 'percentage') {
    discount = (orderAmount * promo.discountValue) / 100
    if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount)
  } else {
    discount = promo.discountValue
  }
  return { success: true, promo, discount }
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export async function demoGetProfile() {
  await delay(200)
  return { success: true, user: { ..._user!, walletBalance: _walletBalance, points: _points } }
}

export async function demoUpdateProfile(data: any) {
  await delay(500)
  _user = { ..._user!, ...data }
  return { success: true, user: _user }
}

export async function demoChangePassword(_current: string, _next: string) {
  await delay(600)
  return { success: true, message: 'Password updated successfully' }
}

// ─── Wallet ───────────────────────────────────────────────────────────────────
export async function demoGetWallet() {
  await delay(300)
  return {
    success: true,
    walletBalance: _walletBalance,
    points: _points,
    transactions: _transactions,
    topUpAmounts: [10, 20, 50, 100, 200],
  }
}

export async function demoTopUp(amount: number) {
  await delay(700)
  const before = _walletBalance
  _walletBalance = parseFloat((_walletBalance + amount).toFixed(2))
  if (_user) _user = { ..._user, walletBalance: _walletBalance }

  const tx: Transaction = {
    _id: 'tx-demo-' + Date.now(),
    type: 'topup',
    amount,
    balanceBefore: before,
    balanceAfter: _walletBalance,
    status: 'success',
    description: `Wallet top-up of RM${amount.toFixed(2)}`,
    createdAt: new Date().toISOString(),
  }
  _transactions = [tx, ..._transactions]
  return {
    success: true,
    message: `Successfully topped up RM${amount.toFixed(2)}`,
    walletBalance: _walletBalance,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN MOCK API
// ═══════════════════════════════════════════════════════════════════════════════

// In-memory admin state
let _adminOrders: Order[] = [...MOCK_ALL_ORDERS]
let _adminUsers: UserWithStats[] = [...MOCK_ALL_USERS]
let _adminPromos = [...MOCK_PROMOS]
let _adminMenuItems = [...MOCK_MENU_ITEMS]
let _adminCategories = [...MOCK_CATEGORIES]

// ─── Admin Orders ────────────────────────────────────────────────────────────
export async function adminGetOrders(params?: { status?: string }) {
  await delay(400)
  let orders = [..._adminOrders]
  if (params?.status) orders = orders.filter((o) => o.status === params.status)
  return {
    success: true,
    orders: orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    total: orders.length,
  }
}

export async function adminUpdateOrderStatus(
  id: string,
  payload: { status: string; estimatedTime?: number; adminNote?: string }
) {
  await delay(400)
  const idx = _adminOrders.findIndex((o) => o._id === id)
  if (idx === -1) throw { response: { data: { message: 'Order not found' } } }
  _adminOrders[idx] = {
    ..._adminOrders[idx],
    status: payload.status as any,
    ...(payload.estimatedTime !== undefined && { estimatedTime: payload.estimatedTime }),
    ...(payload.adminNote !== undefined && { adminNote: payload.adminNote }),
    updatedAt: new Date().toISOString(),
  }
  return { success: true, order: _adminOrders[idx] }
}

export async function adminRejectOrder(id: string, reason: string) {
  await delay(400)
  const idx = _adminOrders.findIndex((o) => o._id === id)
  if (idx === -1) throw { response: { data: { message: 'Order not found' } } }
  _adminOrders[idx] = {
    ..._adminOrders[idx],
    status: 'rejected',
    rejectedReason: reason,
    updatedAt: new Date().toISOString(),
  }
  return { success: true, order: _adminOrders[idx] }
}

// ─── Admin Users ─────────────────────────────────────────────────────────────
export async function adminGetUsers(params?: { role?: string }) {
  await delay(400)
  let users = [..._adminUsers]
  if (params?.role) users = users.filter((u) => u.role === params.role)
  return { success: true, users, total: users.length }
}

export async function adminAddAdmin(data: {
  name: string; email: string; phone: string; password: string; position: string
}) {
  await delay(600)
  if (_adminUsers.find((u) => u.email === data.email)) {
    throw { response: { data: { message: 'Email already registered' } } }
  }
  const newAdmin: UserWithStats = {
    id: 'demo-admin-' + Date.now(),
    name: data.name,
    email: data.email,
    phone: data.phone,
    userId: 'YMM-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    points: 0,
    walletBalance: 0,
    role: 'admin',
    position: data.position,
    isActive: true,
    createdAt: new Date().toISOString(),
    stats: { orderCount: 0, totalSpent: 0, lastOrder: null },
  }
  _adminUsers = [newAdmin, ..._adminUsers]
  return { success: true, user: newAdmin }
}

export async function adminToggleUserStatus(id: string, isActive: boolean) {
  await delay(300)
  const idx = _adminUsers.findIndex((u) => u.id === id)
  if (idx === -1) throw { response: { data: { message: 'User not found' } } }
  _adminUsers[idx] = { ..._adminUsers[idx], isActive }
  return { success: true, user: _adminUsers[idx] }
}

// ─── Admin Promos ─────────────────────────────────────────────────────────────
export async function adminGetPromos() {
  await delay(300)
  return { success: true, promos: [..._adminPromos] }
}

export async function adminCreatePromo(data: any) {
  await delay(500)
  const newPromo: Promo = {
    _id: 'promo-' + Date.now(),
    ...data,
    code: (data.code || '').toUpperCase(),
    usedCount: 0,
  }
  _adminPromos = [newPromo, ..._adminPromos]
  return { success: true, promo: newPromo }
}

export async function adminUpdatePromo(id: string, data: any) {
  await delay(400)
  const idx = _adminPromos.findIndex((p) => p._id === id)
  if (idx === -1) throw { response: { data: { message: 'Promo not found' } } }
  _adminPromos[idx] = { ..._adminPromos[idx], ...data, code: (data.code || _adminPromos[idx].code).toUpperCase() }
  return { success: true, promo: _adminPromos[idx] }
}

export async function adminDeletePromo(id: string) {
  await delay(400)
  _adminPromos = _adminPromos.filter((p) => p._id !== id)
  return { success: true, message: 'Promo deleted' }
}

// ─── Admin Menu ───────────────────────────────────────────────────────────────
export async function adminGetMenu() {
  await delay(300)
  return { success: true, items: [..._adminMenuItems] }
}

export async function adminCreateMenuItem(data: any) {
  await delay(500)
  const cat = _adminCategories.find((c) => c._id === data.category) ?? _adminCategories[0]
  const newItem: MenuItem = {
    _id: 'item-' + Date.now(),
    addonGroups: [],
    tags: [],
    isAvailable: true,
    isFeatured: false,
    preparationTime: 15,
    ...data,
    category: cat,
  }
  _adminMenuItems = [newItem, ..._adminMenuItems]
  return { success: true, item: newItem }
}

export async function adminUpdateMenuItem(id: string, data: any) {
  await delay(400)
  const idx = _adminMenuItems.findIndex((i) => i._id === id)
  if (idx === -1) throw { response: { data: { message: 'Item not found' } } }
  const cat = data.category
    ? (_adminCategories.find((c) => c._id === data.category) ?? _adminMenuItems[idx].category)
    : _adminMenuItems[idx].category
  _adminMenuItems[idx] = { ..._adminMenuItems[idx], ...data, category: cat }
  return { success: true, item: _adminMenuItems[idx] }
}

export async function adminDeleteMenuItem(id: string) {
  await delay(400)
  _adminMenuItems = _adminMenuItems.filter((i) => i._id !== id)
  return { success: true, message: 'Item deleted' }
}

// ─── Admin Categories ─────────────────────────────────────────────────────────
export async function adminGetCategories() {
  await delay(300)
  return { success: true, categories: [..._adminCategories] }
}

export async function adminCreateCategory(data: any) {
  await delay(400)
  const newCat: Category = { _id: 'cat-' + Date.now(), order: _adminCategories.length + 1, ...data }
  _adminCategories = [..._adminCategories, newCat]
  return { success: true, category: newCat }
}

export async function adminUpdateCategory(id: string, data: any) {
  await delay(400)
  const idx = _adminCategories.findIndex((c) => c._id === id)
  if (idx === -1) throw { response: { data: { message: 'Category not found' } } }
  _adminCategories[idx] = { ..._adminCategories[idx], ...data }
  return { success: true, category: _adminCategories[idx] }
}

export async function adminDeleteCategory(id: string) {
  await delay(400)
  _adminCategories = _adminCategories.filter((c) => c._id !== id)
  return { success: true, message: 'Category deleted' }
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
export async function adminGetDashboard(_year?: number) {
  await delay(600)
  return { success: true, dashboard: MOCK_DASHBOARD }
}
