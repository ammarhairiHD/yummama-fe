import { useState, useEffect, useCallback } from 'react'
import {
  RefreshCw, Search, Filter, ChevronDown, ChevronUp, X,
  Clock, CheckCircle2, XCircle, Truck, UtensilsCrossed, AlertTriangle,
} from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import { adminGetOrders, adminUpdateOrderStatus, adminRejectOrder } from '../../api/admin'
import type { Order, OrderStatus } from '../../types'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  paid:            { label: 'New Order',    color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/30' },
  preparing:       { label: 'Preparing',    color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
  ready:           { label: 'Ready',        color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/30' },
  completed:       { label: 'Completed',    color: 'text-gray-400',   bg: 'bg-gray-400/10 border-gray-400/30' },
  cancelled:       { label: 'Cancelled',    color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/30' },
  rejected:        { label: 'Rejected',     color: 'text-red-500',    bg: 'bg-red-500/10 border-red-500/30' },
  pending_payment: { label: 'Pending Pay',  color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/30' },
  draft:           { label: 'Draft',        color: 'text-gray-500',   bg: 'bg-gray-500/10 border-gray-500/30' },
}

const STATUS_FLOW: Record<string, string[]> = {
  paid:      ['preparing', 'rejected'],
  preparing: ['ready', 'rejected'],
  ready:     ['completed'],
}

function formatInvoice(num: string) {
  if (!num || num.length < 6) return `#${num}`
  const letters = num.slice(0, 2)
  const digits = num.slice(2)
  return `#${letters}-${digits}`
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })
}

function getUser(order: Order) {
  if (typeof order.user === 'object' && order.user !== null) return order.user as any
  return null
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [rejectModal, setRejectModal] = useState<{ orderId: string; orderNumber: string } | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true)
    else setRefreshing(true)
    try {
      const res = await adminGetOrders()
      setOrders(res.orders)
    } catch {
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const updateStatus = async (orderId: string, status: string, estimatedTime?: number) => {
    setActionLoading(orderId + status)
    try {
      const res = await adminUpdateOrderStatus(orderId, { status, ...(estimatedTime && { estimatedTime }) })
      setOrders((prev) => prev.map((o) => o._id === orderId ? res.order : o))
      toast.success(`Order updated to ${STATUS_CONFIG[status]?.label ?? status}`)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    if (!rejectModal || !rejectReason.trim()) return toast.error('Please provide a rejection reason')
    setActionLoading(rejectModal.orderId + 'reject')
    try {
      const res = await adminRejectOrder(rejectModal.orderId, rejectReason.trim())
      setOrders((prev) => prev.map((o) => o._id === rejectModal.orderId ? res.order : o))
      toast.success('Order rejected')
      setRejectModal(null)
      setRejectReason('')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reject')
    } finally {
      setActionLoading(null)
    }
  }

  const STATUS_TABS = ['all', 'paid', 'preparing', 'ready', 'completed', 'cancelled', 'rejected']

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    const q = search.toLowerCase()
    const user = getUser(o)
    const matchSearch = !q
      || o.orderNumber.toLowerCase().includes(q)
      || (user?.name || '').toLowerCase().includes(q)
      || (user?.phone || '').toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  const activeCount = orders.filter((o) => ['paid', 'preparing', 'ready'].includes(o.status)).length

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Orders</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {activeCount > 0 ? (
              <span className="text-orange-400 font-medium">{activeCount} active order{activeCount !== 1 ? 's' : ''} need attention</span>
            ) : (
              'All caught up'
            )}
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition text-sm"
        >
          <RefreshCw className={clsx('w-4 h-4', refreshing && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order # or customer name…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_TABS.map((s) => {
          const count = s === 'all' ? orders.length : orders.filter((o) => o.status === s).length
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={clsx(
                'shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap',
                statusFilter === s
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              {s === 'all' ? 'All' : STATUS_CONFIG[s]?.label ?? s} ({count})
            </button>
          )
        })}
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-gray-900 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <UtensilsCrossed className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.draft
            const user = getUser(order)
            const isExpanded = expanded === order._id
            const nextStatuses = STATUS_FLOW[order.status] ?? []

            return (
              <div
                key={order._id}
                className={clsx(
                  'rounded-2xl border bg-gray-900 overflow-hidden transition',
                  ['paid', 'preparing'].includes(order.status)
                    ? 'border-orange-500/40 shadow-orange-500/10 shadow-lg'
                    : 'border-gray-800'
                )}
              >
                {/* Order header row */}
                <button
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                  onClick={() => setExpanded(isExpanded ? null : order._id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-white text-sm">
                        {formatInvoice(order.orderNumber)}
                      </span>
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full border font-medium', cfg.bg, cfg.color)}>
                        {cfg.label}
                      </span>
                      {order.fulfillmentType === 'delivery' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400">
                          Delivery
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="font-medium text-gray-300">{user?.name ?? 'Customer'}</span>
                      <span>·</span>
                      <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                      <span>·</span>
                      <span>RM {order.total.toFixed(2)}</span>
                      <span>·</span>
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(order.createdAt)}</span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                  )}
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-800 pt-3 space-y-4">
                    {/* Customer info */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500 mb-0.5">Customer</p>
                        <p className="text-white font-medium">{user?.name ?? '—'}</p>
                        <p className="text-gray-400">{user?.phone ?? '—'}</p>
                        <p className="text-gray-400">{user?.email ?? '—'}</p>
                      </div>
                      {order.fulfillmentType === 'delivery' && order.deliveryAddress && (
                        <div>
                          <p className="text-gray-500 mb-0.5">Delivery Address</p>
                          <p className="text-gray-300">{order.deliveryAddress}</p>
                        </div>
                      )}
                    </div>

                    {/* Items */}
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Items</p>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <div>
                              <span className="text-white">
                                {item.quantity}× {item.name}
                              </span>
                              {item.selectedAddons?.length > 0 && (
                                <p className="text-gray-500 mt-0.5">
                                  +{item.selectedAddons.map((a) => a.addonName).join(', ')}
                                </p>
                              )}
                              {item.note && <p className="text-orange-400 mt-0.5">Note: {item.note}</p>}
                            </div>
                            <span className="text-gray-300 font-medium shrink-0 ml-2">
                              RM {item.itemTotal.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="space-y-1 text-xs border-t border-gray-800 pt-3">
                      <div className="flex justify-between text-gray-400">
                        <span>Subtotal</span><span>RM {order.subtotal.toFixed(2)}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-green-400">
                          <span>Discount {order.promoCode ? `(${order.promoCode})` : ''}</span>
                          <span>−RM {order.discount.toFixed(2)}</span>
                        </div>
                      )}
                      {order.deliveryFee > 0 && (
                        <div className="flex justify-between text-gray-400">
                          <span>Delivery</span><span>RM {order.deliveryFee.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-white font-bold pt-1 border-t border-gray-800">
                        <span>Total</span><span>RM {order.total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Note */}
                    {order.note && (
                      <p className="text-xs bg-orange-500/10 border border-orange-500/30 rounded-xl px-3 py-2 text-orange-300">
                        Customer note: {order.note}
                      </p>
                    )}

                    {/* Rejected reason */}
                    {order.status === 'rejected' && order.rejectedReason && (
                      <p className="text-xs bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2 text-red-300">
                        Rejection reason: {order.rejectedReason}
                      </p>
                    )}

                    {/* Action buttons */}
                    {nextStatuses.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {nextStatuses.map((ns) => {
                          if (ns === 'rejected') return (
                            <button
                              key="reject"
                              onClick={() => setRejectModal({ orderId: order._id, orderNumber: order.orderNumber })}
                              disabled={!!actionLoading}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-medium transition disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          )
                          const actionLabel: Record<string, string> = {
                            preparing: 'Start Preparing',
                            ready: 'Mark Ready',
                            completed: 'Complete',
                          }
                          const ActionIcon = ns === 'preparing' ? UtensilsCrossed : ns === 'ready' ? Truck : CheckCircle2
                          return (
                            <button
                              key={ns}
                              onClick={() => updateStatus(order._id, ns)}
                              disabled={actionLoading === order._id + ns}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium transition disabled:opacity-50"
                            >
                              <ActionIcon className="w-3.5 h-3.5" />
                              {actionLoading === order._id + ns ? 'Updating…' : actionLabel[ns] ?? ns}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-md bg-gray-900 rounded-2xl border border-gray-800 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Reject Order</h3>
                <p className="text-xs text-gray-400">
                  {formatInvoice(rejectModal.orderNumber)} — customer will be notified
                </p>
              </div>
              <button onClick={() => { setRejectModal(null); setRejectReason('') }} className="ml-auto text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (e.g. item out of stock, kitchen closed…)"
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => { setRejectModal(null); setRejectReason('') }}
                className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-300 text-sm hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || !!actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting…' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
