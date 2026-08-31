import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, ChevronRight, Clock } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { getOrders } from '../../api/orders'
import { formatMYR, formatDateTime } from '../../utils/format'
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from '../../utils/orderStatus'
import clsx from 'clsx'
import type { Order, OrderStatus } from '../../types'

type Tab = 'all' | 'ongoing' | 'pending_payment' | 'completed' | 'cancelled' | 'draft'

const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'ongoing', label: 'On-Going' },
  { key: 'pending_payment', label: 'Need Payment' },
  { key: 'completed', label: 'Completed' },
  { key: 'draft', label: 'Draft' },
  { key: 'cancelled', label: 'Cancelled' },
]

const ONGOING: OrderStatus[] = ['paid', 'preparing', 'ready']

export default function OrdersPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('all')

  const { data, loading, refetch } = useApi(() => getOrders(), [])
  const orders: Order[] = data?.orders ?? []

  const filtered = orders.filter((o) => {
    if (tab === 'all') return true
    if (tab === 'ongoing') return ONGOING.includes(o.status)
    return o.status === tab
  })

  return (
    <div className="flex flex-col min-h-full bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 px-5 pt-12 pb-0 shadow-sm sticky top-0 z-30">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Order History</h1>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-3">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={clsx(
                'shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap',
                tab === t.key
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 flex-1">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-4 animate-pulse">
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ClipboardList className="w-14 h-14 text-gray-200 dark:text-gray-700 mb-3" />
            <p className="font-semibold text-gray-500 dark:text-gray-400">No orders here</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {tab === 'all' ? 'Your order history is empty' : `No ${TABS.find((t) => t.key === tab)?.label.toLowerCase()} orders`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onClick={() => navigate(`/orders/${order._id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pull to refresh hint */}
      <div className="text-center pb-4">
        <button onClick={refetch} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          Tap to refresh
        </button>
      </div>
    </div>
  )
}

function OrderCard({ order, onClick }: { order: Order; onClick: () => void }) {
  const itemNames = order.items.map((i) => i.name).join(', ')

  return (
    <button
      onClick={onClick}
      className="w-full bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm text-left active:scale-[0.98] transition"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{order.orderNumber}</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5 line-clamp-1">
            {itemNames}
          </p>
        </div>
        <span
          className={clsx(
            'shrink-0 text-xs font-semibold px-2 py-1 rounded-full',
            ORDER_STATUS_COLOR[order.status]
          )}
        >
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDateTime(order.createdAt)}
          </div>
          <span>·</span>
          <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-bold text-gray-900 dark:text-white text-sm">
            {formatMYR(order.total)}
          </span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </button>
  )
}
