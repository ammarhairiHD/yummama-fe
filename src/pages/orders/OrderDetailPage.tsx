import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Package, Clock, Tag, Wallet, XCircle } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { getOrder, cancelOrder } from '../../api/orders'
import { formatMYR, formatDateTime } from '../../utils/format'
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from '../../utils/orderStatus'
import toast from 'react-hot-toast'
import { useState } from 'react'
import clsx from 'clsx'

const STATUS_STEPS = [
  { key: 'pending_payment', label: 'Need Payment' },
  { key: 'paid', label: 'Paid' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'completed', label: 'Completed' },
]

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [cancelling, setCancelling] = useState(false)

  const { data, loading, refetch } = useApi(() => getOrder(id!), [id])
  const order = data?.order

  const handleCancel = async () => {
    if (!order) return
    if (!confirm('Cancel this order?')) return
    setCancelling(true)
    try {
      await cancelOrder(order._id)
      toast.success('Order cancelled')
      refetch()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not cancel order')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-full bg-gray-50 dark:bg-gray-950 px-4 pt-16">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full">
        <p className="text-gray-500">Order not found</p>
        <button onClick={() => navigate('/orders')} className="mt-3 text-orange-500 font-medium">
          Back to Orders
        </button>
      </div>
    )
  }

  const activeStep = STATUS_STEPS.findIndex((s) => s.key === order.status)
  const isCancelled = order.status === 'cancelled'
  const isDraft = order.status === 'draft'
  const canCancel = ['draft', 'pending_payment'].includes(order.status)

  return (
    <div className="flex flex-col min-h-full bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 px-5 pt-12 pb-4 shadow-sm">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Orders</span>
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Order Detail</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{order.orderNumber}</p>
          </div>
          <span className={clsx('text-xs font-semibold px-3 py-1.5 rounded-full', ORDER_STATUS_COLOR[order.status])}>
            {ORDER_STATUS_LABEL[order.status]}
          </span>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Progress tracker */}
        {!isCancelled && !isDraft && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Order Progress</h3>
            <div className="flex items-center">
              {STATUS_STEPS.map((step, idx) => {
                const done = idx <= activeStep
                const isLast = idx === STATUS_STEPS.length - 1
                return (
                  <div key={step.key} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={clsx(
                          'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition',
                          done
                            ? 'bg-orange-500 border-orange-500 text-white'
                            : 'border-gray-300 dark:border-gray-600 text-gray-400'
                        )}
                      >
                        {done ? '✓' : idx + 1}
                      </div>
                      <span className={clsx(
                        'text-[9px] font-medium text-center leading-tight w-12',
                        done ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'
                      )}>
                        {step.label}
                      </span>
                    </div>
                    {!isLast && (
                      <div className={clsx(
                        'flex-1 h-0.5 mx-1 mb-5',
                        idx < activeStep ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'
                      )} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Fulfillment info */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            {order.fulfillmentType === 'pickup' ? (
              <Package className="w-5 h-5 text-orange-500" />
            ) : (
              <MapPin className="w-5 h-5 text-orange-500" />
            )}
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {order.fulfillmentType === 'pickup' ? 'Self Pickup' : 'Delivery'}
              </p>
              {order.fulfillmentType === 'delivery' && order.deliveryAddress && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{order.deliveryAddress}</p>
              )}
              {order.fulfillmentType === 'pickup' && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Jalan Ampang, Kuala Lumpur
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDateTime(order.createdAt)}</span>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
            Items ({order.items.length})
          </h3>
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="text-sm font-bold text-orange-500 w-5 shrink-0">{item.quantity}×</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.name}</p>
                  {item.selectedAddons.length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.selectedAddons.map((a) => a.addonName).join(', ')}
                    </p>
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white shrink-0">
                  {formatMYR(item.itemTotal)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment summary */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Payment Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
              <span className="text-gray-900 dark:text-white font-medium">{formatMYR(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between">
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <Tag className="w-3 h-3" />
                  <span>Discount {order.promoCode && `(${order.promoCode})`}</span>
                </div>
                <span className="text-green-600 dark:text-green-400 font-medium">−{formatMYR(order.discount)}</span>
              </div>
            )}
            {order.deliveryFee > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Delivery Fee</span>
                <span className="text-gray-900 dark:text-white font-medium">{formatMYR(order.deliveryFee)}</span>
              </div>
            )}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-2 flex justify-between">
              <span className="font-bold text-gray-900 dark:text-white">Total</span>
              <span className="font-bold text-gray-900 dark:text-white text-base">{formatMYR(order.total)}</span>
            </div>
            <div className="flex items-center gap-2 pt-1 text-xs text-gray-400">
              <Wallet className="w-3.5 h-3.5" />
              <span>Paid via Yummama Wallet</span>
            </div>
            {order.pointsEarned > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl px-3 py-2 text-xs text-yellow-700 dark:text-yellow-400 font-medium flex items-center gap-1.5">
                ⭐ You earned {order.pointsEarned} Yummama Points from this order
              </div>
            )}
          </div>
        </div>

        {/* Cancel button */}
        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-red-200 dark:border-red-900/50 text-red-500 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/10 active:scale-95 transition"
          >
            <XCircle className="w-4 h-4" />
            {cancelling ? 'Cancelling…' : 'Cancel Order'}
          </button>
        )}
      </div>
    </div>
  )
}
