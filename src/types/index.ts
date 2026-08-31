// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
  id: string
  name: string
  email: string
  phone: string
  userId: string      // referral code e.g. YMM-A3X9K2
  points: number
  walletBalance: number
  role: 'customer' | 'admin'
  avatar?: string
  address?: string
  referredBy?: string
  position?: string   // admin staff position
  isActive?: boolean
  createdAt?: string
}

export interface AdminUser extends User {
  role: 'admin'
  position: string
  isActive: boolean
  createdAt: string
}

export interface UserWithStats extends User {
  stats: {
    orderCount: number
    totalSpent: number
    lastOrder: {
      orderNumber: string
      status: OrderStatus
      total: number
      createdAt: string
    } | null
  }
}

// ─── Category ────────────────────────────────────────────────────────────────
export interface Category {
  _id: string
  name: string
  slug: string
  icon?: string
  order: number
}

// ─── Menu ────────────────────────────────────────────────────────────────────
export interface Addon {
  name: string
  price: number
  isRequired: boolean
}

export interface AddonGroup {
  groupName: string
  maxSelect: number
  addons: Addon[]
}

export interface MenuItem {
  _id: string
  name: string
  description: string
  price: number
  image?: string
  category: Category | string
  addonGroups: AddonGroup[]
  isAvailable: boolean
  isFeatured: boolean
  tags: string[]
  preparationTime: number
  calories?: number
}

// ─── Cart ────────────────────────────────────────────────────────────────────
export interface SelectedAddon {
  groupName: string
  addonName: string
  price: number
}

export interface CartItem {
  cartId: string
  menuItem: MenuItem
  quantity: number
  selectedAddons: SelectedAddon[]
  itemTotal: number
  note: string
}

// ─── Order ───────────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'draft'
  | 'pending_payment'
  | 'paid'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled'
  | 'rejected'

export type FulfillmentType = 'pickup' | 'delivery'

export interface OrderItem {
  menuItem: MenuItem | string
  name: string
  price: number
  quantity: number
  selectedAddons: SelectedAddon[]
  itemTotal: number
  note?: string
}

export interface Order {
  _id: string
  orderNumber: string   // sequential: AA0001 stored, displayed as #AA-0001
  user: string | { _id: string; name: string; email: string; phone: string; userId: string }
  items: OrderItem[]
  subtotal: number
  discount: number
  deliveryFee: number
  total: number
  status: OrderStatus
  fulfillmentType: FulfillmentType
  deliveryAddress?: string
  paymentMethod?: 'wallet' | 'online'
  promoCode?: string
  pointsEarned: number
  note?: string
  estimatedTime?: number
  rejectedReason?: string
  adminNote?: string
  createdAt: string
  updatedAt: string
}

// ─── Promo ───────────────────────────────────────────────────────────────────
export type PromoCategory =
  | 'welcome'
  | 'seasonal'
  | 'loyalty'
  | 'flash'
  | 'bundle'
  | 'product'
  | 'category'
  | 'free_delivery'
  | 'referral'
  | 'general'

export interface Promo {
  _id: string
  code: string
  title: string
  description: string
  promoCategory: PromoCategory
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minOrderAmount: number
  maxDiscount?: number
  usageLimit: number
  usedCount: number
  isActive: boolean
  expiresAt: string
  image?: string
  applicableProducts?: string[]
  applicableCategories?: string[]
  maxUsagePerUser?: number
}

// ─── Transaction ─────────────────────────────────────────────────────────────
export type TransactionType = 'topup' | 'payment' | 'refund' | 'referral_bonus' | 'points_redeem'

export interface Transaction {
  _id: string
  type: TransactionType
  amount: number
  balanceBefore: number
  balanceAfter: number
  status: 'pending' | 'success' | 'failed'
  description: string
  createdAt: string
}

// ─── Ad ──────────────────────────────────────────────────────────────────────
export interface Ad {
  _id: string
  title: string
  subtitle?: string
  image: string
  link?: string
  order: number
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export interface MonthlyDataPoint {
  month: number         // 1–12
  orderCount: number
  revenue: number
}

export interface TopProduct {
  _id: string           // product name
  totalQty: number
  totalRevenue: number
}

export interface DashboardStats {
  year: number
  annualSales: number
  totalOrders: number
  totalCustomers: number
  pendingOrders: number
  monthlyData: MonthlyDataPoint[]
  topProducts: TopProduct[]
}

// COGS inputs are managed locally in the dashboard UI
export interface CogsInputs {
  startingInventory: number
  purchases: number
  endingInventory: number
}

// ─── API Response ─────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
}
