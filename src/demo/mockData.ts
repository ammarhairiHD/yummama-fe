import type { User, Category, MenuItem, Order, Promo, Transaction, Ad, UserWithStats, PromoCategory } from '../types'

// ─── Demo credentials ─────────────────────────────────────────────────────────
export const DEMO_ACCOUNTS = [
  {
    email: 'nasrul@yummama.com',
    password: 'yummama2026',
    label: 'Admin',
    role: 'admin',
    badge: '👑',
  },
  {
    email: 'halusinasibyammar@gmail.com',
    password: 'test1234',
    label: 'Customer',
    role: 'customer',
    badge: '👤',
  },
]

// ─── Users ───────────────────────────────────────────────────────────────────
export const MOCK_USERS: Record<string, User> = {
  'nasrul@yummama.com': {
    id: 'demo-admin-001',
    name: 'Nasrul Acap',
    email: 'nasrul@yummama.com',
    phone: '+60 12-888 0001',
    userId: 'YMM-ADMIN1',
    points: 500,
    walletBalance: 250.0,
    role: 'admin',
    address: 'Seksyen 16, Bangi, Selangor',
    position: 'Owner',
    isActive: true,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  },
  'halusinasibyammar@gmail.com': {
    id: 'demo-customer-001',
    name: 'Ammar Hairi',
    email: 'halusinasibyammar@gmail.com',
    phone: '+60 11-2461144',
    userId: 'YMM-CUST01',
    points: 120,
    walletBalance: 85.5,
    role: 'customer',
    address: 'Seksyen 8, Bangi, Selangor',
    isActive: true,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
}

// ─── All app users (for admin users page) ────────────────────────────────────
export const MOCK_ALL_USERS: UserWithStats[] = [
  {
    id: 'demo-admin-001',
    name: 'Nasrul Acap',
    email: 'nasrul@yummama.com',
    phone: '+60 12-888 0001',
    userId: 'YMM-ADMIN1',
    points: 500,
    walletBalance: 250.0,
    role: 'admin',
    position: 'Owner',
    isActive: true,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    stats: { orderCount: 0, totalSpent: 0, lastOrder: null },
  },
  {
    id: 'demo-admin-002',
    name: 'Ammar Hairi',
    email: 'halusinasibyammar@gmail.com',
    phone: '+60 12-2461144',
    userId: 'YMM-ADMIN2',
    points: 0,
    walletBalance: 0,
    role: 'admin',
    position: 'Pakar IT yang hensem',
    isActive: true,
    createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    stats: { orderCount: 0, totalSpent: 0, lastOrder: null },
  },
  {
    id: 'demo-customer-001',
    name: 'Ahmad Bin Ali',
    email: 'customer@yummama.com',
    phone: '+60 11-234 5678',
    userId: 'YMM-CUST01',
    points: 120,
    walletBalance: 85.5,
    role: 'customer',
    isActive: true,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    stats: {
      orderCount: 2,
      totalSpent: 63.7,
      lastOrder: { orderNumber: 'AA0002', status: 'preparing', total: 39.8, createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
    },
  },
  {
    id: 'demo-customer-002',
    name: 'Nurul Ain Binti Hassan',
    email: 'nurul@demo.com',
    phone: '+60 11-987 6543',
    userId: 'YMM-CUST02',
    points: 340,
    walletBalance: 120.0,
    role: 'customer',
    isActive: true,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    stats: {
      orderCount: 8,
      totalSpent: 338.6,
      lastOrder: { orderNumber: 'AA0012', status: 'completed', total: 45.8, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    },
  },
  {
    id: 'demo-customer-003',
    name: 'Razif Mohd Isa',
    email: 'razif@demo.com',
    phone: '+60 12-456 7890',
    userId: 'YMM-CUST03',
    points: 85,
    walletBalance: 30.0,
    role: 'customer',
    isActive: true,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    stats: {
      orderCount: 3,
      totalSpent: 85.2,
      lastOrder: { orderNumber: 'AA0009', status: 'completed', total: 23.9, createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
    },
  },
  {
    id: 'demo-customer-004',
    name: 'Farah Liyana',
    email: 'farah@demo.com',
    phone: '+60 11-321 4567',
    userId: 'YMM-CUST04',
    points: 210,
    walletBalance: 55.0,
    role: 'customer',
    isActive: true,
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    stats: {
      orderCount: 5,
      totalSpent: 210.5,
      lastOrder: { orderNumber: 'AA0015', status: 'completed', total: 52.8, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    },
  },
  {
    id: 'demo-customer-005',
    name: 'Hakim Zulkifli',
    email: 'hakim@demo.com',
    phone: '+60 13-654 3210',
    userId: 'YMM-CUST05',
    points: 50,
    walletBalance: 10.0,
    role: 'customer',
    isActive: false,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    stats: {
      orderCount: 1,
      totalSpent: 19.9,
      lastOrder: { orderNumber: 'AA0007', status: 'cancelled', total: 19.9, createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
    },
  },
]

// ─── Ads ──────────────────────────────────────────────────────────────────────
export const MOCK_ADS: Ad[] = [
  {
    _id: 'ad-1',
    title: 'Free Delivery This Weekend!',
    subtitle: 'Order above RM25 and enjoy free delivery',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    order: 1,
  },
  {
    _id: 'ad-2',
    title: 'New: Lamb Chop BBQ',
    subtitle: 'Juicy lamb, now on our menu',
    image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800',
    order: 2,
  },
  {
    _id: 'ad-3',
    title: 'Earn Yummama Points',
    subtitle: '1 point for every RM1 spent',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    order: 3,
  },
]

// ─── Categories ───────────────────────────────────────────────────────────────
export const MOCK_CATEGORIES: Category[] = [
  { _id: 'cat-1', name: 'Kerabu Meggi', slug: 'kerabu-meggi', icon: '🍜', order: 1 },
  { _id: 'cat-2', name: 'Begedil & Popia', slug: 'begedil-popia', icon: '🥟', order: 2 },
  { _id: 'cat-3', name: 'Snacks', slug: 'snacks', icon: '🍟', order: 3 },
]

// ─── Menu Items ───────────────────────────────────────────────────────────────
export const MOCK_MENU_ITEMS: MenuItem[] = [
  // ── Category: Kerabu Meggi ──────────────────────────────────────────────────
  {
    _id: 'item-1',
    name: 'Kerabu Meggi Oden',
    description: 'Instant noodles tossed in tangy spicy Thai salad dressing served with fishcakes and oden items',
    price: 12.0,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
    category: MOCK_CATEGORIES[0],
    isFeatured: true,
    isAvailable: true,
    preparationTime: 10,
    tags: ['spicy', 'bestseller'],
    addonGroups: [
      {
        groupName: 'Spice Level',
        maxSelect: 1,
        addons: [
          { name: 'Kurang Pedas', price: 0, isRequired: false },
          { name: 'Pedas Biasa', price: 0, isRequired: false },
          { name: 'Extra Pedas', price: 0, isRequired: false },
        ],
      },
      {
        groupName: 'Extras',
        maxSelect: 2,
        addons: [
          { name: 'Extra Egg', price: 1.5, isRequired: false },
          { name: 'Extra Sausage', price: 2.0, isRequired: false },
        ],
      },
    ],
  },
  {
    _id: 'item-2',
    name: 'Kerabu Meggi Seafood',
    description: 'Spicy Thai salad noodles loaded with fresh prawns, squid, and seafood toppings',
    price: 15.0,
    image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400',
    category: MOCK_CATEGORIES[0],
    isFeatured: true,
    isAvailable: true,
    preparationTime: 12,
    tags: ['spicy', 'popular', 'seafood'],
    addonGroups: [
      {
        groupName: 'Spice Level',
        maxSelect: 1,
        addons: [
          { name: 'Kurang Pedas', price: 0, isRequired: false },
          { name: 'Pedas Biasa', price: 0, isRequired: false },
          { name: 'Extra Pedas', price: 0, isRequired: false },
        ],
      },
      {
        groupName: 'Extra Seafood',
        maxSelect: 2,
        addons: [
          { name: 'Add Prawns', price: 4.0, isRequired: false },
          { name: 'Add Squid', price: 3.5, isRequired: false },
        ],
      },
    ],
  },
  {
    _id: 'item-3',
    name: 'Kerabu Meggi Ayam',
    description: 'Spicy kerabu noodles served with tender shredded chicken',
    price: 11.0,
    image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400',
    category: MOCK_CATEGORIES[0],
    isFeatured: false,
    isAvailable: true,
    preparationTime: 10,
    tags: ['spicy'],
    addonGroups: [
      {
        groupName: 'Spice Level',
        maxSelect: 1,
        addons: [
          { name: 'Kurang Pedas', price: 0, isRequired: false },
          { name: 'Pedas Biasa', price: 0, isRequired: false },
          { name: 'Extra Pedas', price: 0, isRequired: false },
        ],
      },
      {
        groupName: 'Extras',
        maxSelect: 2,
        addons: [
          { name: 'Extra Chicken', price: 3.0, isRequired: false },
          { name: 'Extra Telur Rebus', price: 1.5, isRequired: false },
        ],
      },
    ],
  },

  // ── Category: Begedil & Popia ──────────────────────────────────────────────
  {
    _id: 'item-4',
    name: 'Popia Begedil',
    description: 'Crispy popia skin filled with seasoned potato begedil, served with spicy sambal kicap',
    price: 8.0,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
    category: MOCK_CATEGORIES[1],
    isFeatured: true,
    isAvailable: true,
    preparationTime: 8,
    tags: ['bestseller', 'crispy'],
    addonGroups: [
      {
        groupName: 'Quantity',
        maxSelect: 1,
        addons: [
          { name: '5 Pcs', price: 0, isRequired: false },
          { name: '10 Pcs', price: 7.0, isRequired: false },
        ],
      },
      {
        groupName: 'Sauce',
        maxSelect: 1,
        addons: [
          { name: 'Extra Sambal Kicap', price: 1.0, isRequired: false },
        ],
      },
    ],
  },
  {
    _id: 'item-5',
    name: 'Tauhu Begedil',
    description: 'Deep-fried tofu pockets stuffed with spiced potato and meat filling, served with sambal dip',
    price: 8.0,
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=400',
    category: MOCK_CATEGORIES[1],
    isFeatured: false,
    isAvailable: true,
    preparationTime: 8,
    tags: ['popular'],
    addonGroups: [
      {
        groupName: 'Quantity',
        maxSelect: 1,
        addons: [
          { name: '5 Pcs', price: 0, isRequired: false },
          { name: '10 Pcs', price: 7.0, isRequired: false },
        ],
      },
      {
        groupName: 'Sauce',
        maxSelect: 1,
        addons: [
          { name: 'Extra Sambal Kicap', price: 1.0, isRequired: false },
        ],
      },
    ],
  },

  // ── Category: Snack ─────────────────────────────────────────────────────────
  {
    _id: 'item-6',
    name: 'Keropok Lekor',
    description: 'Crispy deep-fried Terengganu fish crackers served with sweet chili dip',
    price: 6.0,
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400',
    category: MOCK_CATEGORIES[2],
    isFeatured: false,
    isAvailable: true,
    preparationTime: 5,
    tags: ['snack', 'local'],
    addonGroups: [
      {
        groupName: 'Sauce',
        maxSelect: 1,
        addons: [
          { name: 'Extra Sos Manis', price: 0.5, isRequired: false },
          { name: 'Extra Cheese Sauce', price: 1.5, isRequired: false },
        ],
      },
    ],
  },
]

// ─── Promos ───────────────────────────────────────────────────────────────────
export const MOCK_PROMOS: Promo[] = [
  {
    _id: 'promo-1',
    code: 'WELCOME10',
    title: 'Welcome Offer',
    description: '10% off your first order at Yummama Bites!',
    promoCategory: 'welcome',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 15,
    maxDiscount: 8,
    usageLimit: 0,
    usedCount: 12,
    isActive: true,
    expiresAt: '2026-12-31T23:59:59.000Z',
    applicableProducts: [],
    applicableCategories: [],
    maxUsagePerUser: 1,
  },
  {
    _id: 'promo-2',
    code: 'SAVE5',
    title: 'RM5 Off',
    description: 'Get RM5 off when you spend RM30 or more',
    promoCategory: 'general',
    discountType: 'fixed',
    discountValue: 5,
    minOrderAmount: 30,
    usageLimit: 200,
    usedCount: 47,
    isActive: true,
    expiresAt: '2026-12-31T23:59:59.000Z',
    applicableProducts: [],
    applicableCategories: [],
    maxUsagePerUser: 0,
  },
  {
    _id: 'promo-3',
    code: 'YUMMAMA20',
    title: '20% Weekend Special',
    description: '20% off all orders, max discount RM15',
    promoCategory: 'seasonal',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: 20,
    maxDiscount: 15,
    usageLimit: 100,
    usedCount: 23,
    isActive: true,
    expiresAt: '2026-12-31T23:59:59.000Z',
    applicableProducts: [],
    applicableCategories: [],
    maxUsagePerUser: 0,
  },
  {
    _id: 'promo-4',
    code: 'FREEDEL',
    title: 'Free Delivery',
    description: 'Free delivery on all orders this week',
    promoCategory: 'free_delivery',
    discountType: 'fixed',
    discountValue: 3,
    minOrderAmount: 0,
    usageLimit: 500,
    usedCount: 120,
    isActive: false,
    expiresAt: '2026-06-30T23:59:59.000Z',
    applicableProducts: [],
    applicableCategories: [],
    maxUsagePerUser: 0,
  },
]

// ─── All orders (for admin view — cross-user) ─────────────────────────────────
export const MOCK_ALL_ORDERS: Order[] = [
  // Incoming / active orders
  {
    _id: 'order-admin-1',
    orderNumber: 'AA0001',
    user: { _id: 'demo-customer-003', name: 'Razif Mohd Isa', email: 'razif@demo.com', phone: '+60 12-456 7890', userId: 'YMM-CUST03' },
    items: [
      { 
        menuItem: MOCK_MENU_ITEMS[0], // Kerabu Meggi Oden
        name: 'Kerabu Meggi Oden', 
        price: 12.0, 
        quantity: 2, 
        selectedAddons: [{ groupName: 'Spice Level', addonName: 'Extra Pedas', price: 0 }], 
        itemTotal: 24.0 
      },
      { 
        menuItem: MOCK_MENU_ITEMS[3], // Popia Begedil
        name: 'Popia Begedil', 
        price: 8.0, 
        quantity: 1, 
        selectedAddons: [{ groupName: 'Sauce', addonName: 'Extra Sambal Kicap', price: 1.0 }], 
        itemTotal: 9.0 
      },
    ],
    subtotal: 33.0,
    discount: 0,
    deliveryFee: 3,
    total: 36.0,
    status: 'paid',
    fulfillmentType: 'delivery',
    deliveryAddress: 'No. 45, Jalan PJ, Petaling Jaya',
    paymentMethod: 'wallet',
    pointsEarned: 36,
    note: 'Please deliver to guard house',
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    _id: 'order-admin-2',
    orderNumber: 'AA0002',
    user: { _id: 'demo-customer-001', name: 'Ahmad Bin Ali', email: 'customer@yummama.com', phone: '+60 11-234 5678', userId: 'YMM-CUST01' },
    items: [
      { 
        menuItem: MOCK_MENU_ITEMS[1], // Kerabu Meggi Seafood
        name: 'Kerabu Meggi Seafood', 
        price: 15.0, 
        quantity: 2, 
        selectedAddons: [{ groupName: 'Extra Seafood', addonName: 'Add Prawns', price: 4.0 }], 
        itemTotal: 38.0 
      },
    ],
    subtotal: 38.0,
    discount: 5,
    deliveryFee: 3,
    total: 36.0,
    status: 'preparing',
    fulfillmentType: 'delivery',
    deliveryAddress: 'No. 12, Jalan Bukit Bintang, KL',
    paymentMethod: 'wallet',
    promoCode: 'SAVE5',
    pointsEarned: 36,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    _id: 'order-admin-3',
    orderNumber: 'AA0003',
    user: { _id: 'demo-customer-004', name: 'Farah Liyana', email: 'farah@demo.com', phone: '+60 11-321 4567', userId: 'YMM-CUST04' },
    items: [
      { 
        menuItem: MOCK_MENU_ITEMS[4], // Tauhu Begedil
        name: 'Tauhu Begedil', 
        price: 8.0, 
        quantity: 2, 
        selectedAddons: [], 
        itemTotal: 16.0 
      },
      { 
        menuItem: MOCK_MENU_ITEMS[5], // Keropok Lekor
        name: 'Keropok Lekor', 
        price: 6.0, 
        quantity: 1, 
        selectedAddons: [{ groupName: 'Sauce', addonName: 'Extra Cheese Sauce', price: 1.5 }], 
        itemTotal: 7.5 
      },
    ],
    subtotal: 23.5,
    discount: 0,
    deliveryFee: 0,
    total: 23.5,
    status: 'ready',
    fulfillmentType: 'pickup',
    paymentMethod: 'wallet',
    pointsEarned: 23,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    _id: 'order-admin-4',
    orderNumber: 'AA0004',
    user: { _id: 'demo-customer-002', name: 'Nurul Ain Binti Hassan', email: 'nurul@demo.com', phone: '+60 11-987 6543', userId: 'YMM-CUST02' },
    items: [
      { 
        menuItem: MOCK_MENU_ITEMS[2], // Kerabu Meggi Ayam
        name: 'Kerabu Meggi Ayam', 
        price: 11.0, 
        quantity: 3, 
        selectedAddons: [{ groupName: 'Extras', addonName: 'Extra Chicken', price: 3.0 }], 
        itemTotal: 42.0 
      },
      { 
        menuItem: MOCK_MENU_ITEMS[3], // Popia Begedil
        name: 'Popia Begedil', 
        price: 8.0, 
        quantity: 2, 
        selectedAddons: [], 
        itemTotal: 16.0 
      },
    ],
    subtotal: 58.0,
    discount: 5,
    deliveryFee: 3,
    total: 56.0,
    status: 'completed',
    fulfillmentType: 'delivery',
    deliveryAddress: 'Condo Vista, Cheras, KL',
    paymentMethod: 'wallet',
    promoCode: 'WELCOME10',
    pointsEarned: 56,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'order-admin-5',
    orderNumber: 'AA0005',
    user: { _id: 'demo-customer-002', name: 'Nurul Ain Binti Hassan', email: 'nurul@demo.com', phone: '+60 11-987 6543', userId: 'YMM-CUST02' },
    items: [
      { 
        menuItem: MOCK_MENU_ITEMS[0], // Kerabu Meggi Oden
        name: 'Kerabu Meggi Oden', 
        price: 12.0, 
        quantity: 2, 
        selectedAddons: [{ groupName: 'Spice Level', addonName: 'Pedas Biasa', price: 0 }], 
        itemTotal: 24.0 
      },
      { 
        menuItem: MOCK_MENU_ITEMS[5], // Keropok Lekor
        name: 'Keropok Lekor', 
        price: 6.0, 
        quantity: 1, 
        selectedAddons: [], 
        itemTotal: 6.0 
      },
    ],
    subtotal: 30.0,
    discount: 5,
    deliveryFee: 0,
    total: 25.0,
    status: 'completed',
    fulfillmentType: 'pickup',
    paymentMethod: 'wallet',
    promoCode: 'SAVE5',
    pointsEarned: 25,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'order-admin-6',
    orderNumber: 'AA0006',
    user: { _id: 'demo-customer-005', name: 'Hakim Zulkifli', email: 'hakim@demo.com', phone: '+60 13-654 3210', userId: 'YMM-CUST05' },
    items: [
      { 
        menuItem: MOCK_MENU_ITEMS[1], // Kerabu Meggi Seafood
        name: 'Kerabu Meggi Seafood', 
        price: 15.0, 
        quantity: 1, 
        selectedAddons: [], 
        itemTotal: 15.0 
      },
    ],
    subtotal: 15.0,
    discount: 0,
    deliveryFee: 0,
    total: 15.0,
    status: 'cancelled',
    fulfillmentType: 'pickup',
    paymentMethod: 'wallet',
    pointsEarned: 0,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'order-admin-7',
    orderNumber: 'AA0007',
    user: { _id: 'demo-customer-004', name: 'Farah Liyana', email: 'farah@demo.com', phone: '+60 11-321 4567', userId: 'YMM-CUST04' },
    items: [
      { 
        menuItem: MOCK_MENU_ITEMS[1], // Kerabu Meggi Seafood
        name: 'Kerabu Meggi Seafood', 
        price: 15.0, 
        quantity: 2, 
        selectedAddons: [], 
        itemTotal: 30.0 
      },
    ],
    subtotal: 30.0,
    discount: 0,
    deliveryFee: 3,
    total: 33.0,
    status: 'rejected',
    fulfillmentType: 'delivery',
    deliveryAddress: 'Shah Alam, Selangor',
    paymentMethod: 'wallet',
    pointsEarned: 0,
    rejectedReason: 'Item out of stock',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Also keep customer-facing orders
export const MOCK_ORDERS: Order[] = [
  {
    _id: 'order-1',
    orderNumber: 'AA0009',
    user: 'demo-customer-001',
    items: [
      {
        menuItem: MOCK_MENU_ITEMS[0], // Kerabu Meggi Oden
        name: 'Kerabu Meggi Oden',
        price: 12.0,
        quantity: 1,
        selectedAddons: [{ groupName: 'Extras', addonName: 'Extra Sausage', price: 2.0 }],
        itemTotal: 14.0,
      },
      {
        menuItem: MOCK_MENU_ITEMS[5], // Keropok Lekor
        name: 'Keropok Lekor',
        price: 6.0,
        quantity: 1,
        selectedAddons: [{ groupName: 'Sauce', addonName: 'Extra Sos Manis', price: 0.5 }],
        itemTotal: 6.5,
      },
    ],
    subtotal: 20.5,
    discount: 0,
    deliveryFee: 0,
    total: 20.5,
    status: 'completed',
    fulfillmentType: 'pickup',
    paymentMethod: 'wallet',
    pointsEarned: 20,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'order-2',
    orderNumber: 'AA0002',
    user: 'demo-customer-001',
    items: [
      {
        menuItem: MOCK_MENU_ITEMS[1], // Kerabu Meggi Seafood
        name: 'Kerabu Meggi Seafood',
        price: 15.0,
        quantity: 2,
        selectedAddons: [{ groupName: 'Extra Seafood', addonName: 'Add Prawns', price: 4.0 }],
        itemTotal: 38.0,
      },
    ],
    subtotal: 38.0,
    discount: 5,
    deliveryFee: 3,
    total: 36.0,
    status: 'preparing',
    fulfillmentType: 'delivery',
    deliveryAddress: 'No. 12, Jalan Bukit Bintang, KL',
    paymentMethod: 'wallet',
    promoCode: 'SAVE5',
    pointsEarned: 36,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    _id: 'order-3',
    orderNumber: 'AA0010',
    user: 'demo-customer-001',
    items: [
      {
        menuItem: MOCK_MENU_ITEMS[4], // Tauhu Begedil
        name: 'Tauhu Begedil',
        price: 8.0,
        quantity: 2,
        selectedAddons: [{ groupName: 'Sauce', addonName: 'Extra Sambal Kicap', price: 1.0 }],
        itemTotal: 18.0,
      },
    ],
    subtotal: 18.0,
    discount: 0,
    deliveryFee: 0,
    total: 18.0,
    status: 'pending_payment',
    fulfillmentType: 'pickup',
    pointsEarned: 0,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    _id: 'order-4',
    orderNumber: 'AA0006',
    user: 'demo-customer-001',
    items: [
      {
        menuItem: MOCK_MENU_ITEMS[1], // Kerabu Meggi Seafood
        name: 'Kerabu Meggi Seafood',
        price: 15.0,
        quantity: 1,
        selectedAddons: [],
        itemTotal: 15.0,
      },
    ],
    subtotal: 15.0,
    discount: 0,
    deliveryFee: 0,
    total: 15.0,
    status: 'cancelled',
    fulfillmentType: 'pickup',
    paymentMethod: 'wallet',
    pointsEarned: 0,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// ─── Transactions ─────────────────────────────────────────────────────────────
export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    _id: 'tx-1',
    type: 'topup',
    amount: 100,
    balanceBefore: 0,
    balanceAfter: 100,
    status: 'success',
    description: 'Wallet top-up of RM100.00',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'tx-2',
    type: 'payment',
    amount: -23.9,
    balanceBefore: 100,
    balanceAfter: 76.1,
    status: 'success',
    description: 'Payment for order AA0009',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'tx-3',
    type: 'topup',
    amount: 50,
    balanceBefore: 76.1,
    balanceAfter: 126.1,
    status: 'success',
    description: 'Wallet top-up of RM50.00',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'tx-4',
    type: 'payment',
    amount: -39.8,
    balanceBefore: 126.1,
    balanceAfter: 86.3,
    status: 'success',
    description: 'Payment for order AA0002',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    _id: 'tx-5',
    type: 'referral_bonus',
    amount: 5,
    balanceBefore: 86.3,
    balanceAfter: 91.3,
    status: 'success',
    description: 'Referral bonus — friend used your code',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
]

// ─── Dashboard mock data ───────────────────────────────────────────────────────
export const MOCK_DASHBOARD = {
  year: 2026,
  annualSales: 18450.80,
  totalOrders: 342,
  totalCustomers: 89,
  pendingOrders: 3,
  monthlyData: [
    { month: 1, orderCount: 18, revenue: 1020.50 },
    { month: 2, orderCount: 22, revenue: 1340.20 },
    { month: 3, orderCount: 31, revenue: 1890.60 },
    { month: 4, orderCount: 28, revenue: 1620.40 },
    { month: 5, orderCount: 35, revenue: 2100.80 },
    { month: 6, orderCount: 40, revenue: 2450.30 },
    { month: 7, orderCount: 38, revenue: 2280.50 },
    { month: 8, orderCount: 45, revenue: 2750.90 },
    { month: 9, orderCount: 33, revenue: 1980.20 },
    { month: 10, orderCount: 25, revenue: 1520.40 },
    { month: 11, orderCount: 15, revenue: 920.50 },
    { month: 12, orderCount: 12, revenue: 575.50 },
  ],
  topProducts: [
    { _id: 'Nasi Goreng Kampung', totalQty: 98, totalRevenue: 1264.2 },
    { _id: 'Ayam Percik', totalQty: 76, totalRevenue: 1436.4 },
    { _id: 'Mee Goreng Mamak', totalQty: 65, totalRevenue: 773.5 },
    { _id: 'Tom Yam Seafood', totalQty: 54, totalRevenue: 1074.6 },
    { _id: 'Lamb Chop BBQ', totalQty: 42, totalRevenue: 1381.8 },
  ],
}
