import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Package, Tag, Wallet, ChevronRight, Loader2 } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { placeOrder, cartToOrderItems } from '../../api/orders'
import { validatePromo } from '../../api/promos'
import { formatMYR } from '../../utils/format'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import type { FulfillmentType } from '../../types'

const DELIVERY_FEE = 3.0

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCart()
  const { user, updateUser } = useAuth()

  const [fulfillment, setFulfillment] = useState<FulfillmentType>('pickup')
  const [address, setAddress] = useState(user?.address ?? '')
  const [promoInput, setPromoInput] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoValidating, setPromoValidating] = useState(false)
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  if (items.length === 0) {
    navigate('/menu', { replace: true })
    return null
  }

  const deliveryFee = fulfillment === 'delivery' ? DELIVERY_FEE : 0
  const total = Math.max(0, subtotal - promoDiscount + deliveryFee)
  const canAfford = (user?.walletBalance ?? 0) >= total

  const handlePromoApply = async () => {
    if (!promoInput.trim()) return
    setPromoValidating(true)
    try {
      const res = await validatePromo(promoInput.trim(), subtotal)
      setPromoDiscount(res.discount)
      setAppliedPromo(promoInput.trim().toUpperCase())
      toast.success(`Promo applied! You save ${formatMYR(res.discount)}`)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid promo code')
      setPromoDiscount(0)
      setAppliedPromo(null)
    } finally {
      setPromoValidating(false)
    }
  }

  const removePromo = () => {
    setPromoDiscount(0)
    setAppliedPromo(null)
    setPromoInput('')
  }

  const handlePlaceOrder = async () => {
    if (fulfillment === 'delivery' && !address.trim()) {
      return toast.error('Please enter a delivery address')
    }
    if (!canAfford) {
      return toast.error('Insufficient wallet balance. Please top up first.')
    }

    setLoading(true)
    try {
      const res = await placeOrder({
        items: cartToOrderItems(items),
        fulfillmentType: fulfillment,
        deliveryAddress: fulfillment === 'delivery' ? address : undefined,
        promoCode: appliedPromo ?? undefined,
        paymentMethod: 'wallet',
        note: note || undefined,
      })

      // Deduct from local user state immediately
      const deducted = {
        ...user!,
        walletBalance: (user?.walletBalance ?? 0) - total,
        points: (user?.points ?? 0) + res.order.pointsEarned,
      }
      updateUser(deducted)

      clearCart()
      toast.success('Order placed successfully! 🎉')
      navigate(`/orders/${res.order._id}`, { replace: true })
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-full bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 px-5 pt-12 pb-4 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Checkout</h1>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Fulfillment type */}
        <Section title="Order Type">
          <div className="grid grid-cols-2 gap-2">
            {(['pickup', 'delivery'] as FulfillmentType[]).map((type) => (
              <button
                key={type}
                onClick={() => setFulfillment(type)}
                className={clsx(
                  'flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold text-sm transition',
                  fulfillment === type
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                )}
              >
                {type === 'pickup' ? <Package className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                {type === 'pickup' ? 'Self Pickup' : 'Delivery'}
              </button>
            ))}
          </div>

          {fulfillment === 'delivery' && (
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                Delivery Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your full delivery address…"
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition resize-none"
              />
            </div>
          )}
        </Section>

        {/* Order items */}
        <Section title={`Items (${items.length})`}>
          <div className="space-y-3">
            {items.map((ci) => (
              <div key={ci.cartId} className="flex items-start gap-3">
                <span className="text-sm font-bold text-orange-500 w-5 shrink-0">{ci.quantity}×</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {ci.menuItem.name}
                  </p>
                  {ci.selectedAddons.length > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {ci.selectedAddons.map((a) => a.addonName).join(', ')}
                    </p>
                  )}
                  {ci.note && (
                    <p className="text-xs text-gray-400 italic mt-0.5">"{ci.note}"</p>
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white shrink-0">
                  {formatMYR(ci.itemTotal)}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* Promo code */}
        <Section title="Promo Code">
          {appliedPromo ? (
            <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                  {appliedPromo}
                </span>
                <span className="text-sm text-green-600 dark:text-green-500">
                  −{formatMYR(promoDiscount)}
                </span>
              </div>
              <button
                onClick={removePromo}
                className="text-xs text-red-500 font-medium hover:underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                placeholder="Enter promo code"
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition uppercase"
              />
              <button
                onClick={handlePromoApply}
                disabled={promoValidating || !promoInput}
                className="px-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-semibold rounded-xl transition"
              >
                {promoValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
              </button>
            </div>
          )}
        </Section>

        {/* Note */}
        <Section title="Order Note (optional)">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. no cutlery needed"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
          />
        </Section>

        {/* Payment – wallet only */}
        <Section title="Payment">
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Wallet className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Yummama Wallet</p>
                <p className={clsx(
                  'text-xs font-medium',
                  canAfford ? 'text-green-600 dark:text-green-400' : 'text-red-500'
                )}>
                  {formatMYR(user?.walletBalance ?? 0)}
                  {!canAfford && ' — insufficient balance'}
                </p>
              </div>
            </div>
            {!canAfford && (
              <button
                onClick={() => navigate('/wallet')}
                className="flex items-center gap-1 text-xs text-orange-500 font-semibold"
              >
                Top Up <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </Section>

        {/* Summary */}
        <Section title="Summary">
          <div className="space-y-2 text-sm">
            <Row label="Subtotal" value={formatMYR(subtotal)} />
            {promoDiscount > 0 && (
              <Row label="Discount" value={`−${formatMYR(promoDiscount)}`} valueClass="text-green-600 dark:text-green-400" />
            )}
            {fulfillment === 'delivery' && (
              <Row label="Delivery Fee" value={formatMYR(deliveryFee)} />
            )}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-2 mt-2">
              <Row label="Total" value={formatMYR(total)} bold />
            </div>
            <p className="text-xs text-gray-400 text-center mt-1">
              You'll earn ~{Math.floor(total)} Yummama Points
            </p>
          </div>
        </Section>
      </div>

      {/* Place order button */}
      <div className="sticky bottom-20 px-4 pb-4">
        <button
          onClick={handlePlaceOrder}
          disabled={loading || !canAfford}
          className={clsx(
            'w-full py-4 rounded-2xl font-bold text-white text-base transition flex items-center justify-center gap-2',
            loading || !canAfford
              ? 'bg-orange-300 cursor-not-allowed'
              : 'bg-orange-500 hover:bg-orange-600 active:scale-95 shadow-lg'
          )}
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Placing order…</>
          ) : (
            `Place Order · ${formatMYR(total)}`
          )}
        </button>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
      {children}
    </div>
  )
}

function Row({ label, value, bold, valueClass }: { label: string; value: string; bold?: boolean; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className={clsx('text-gray-500 dark:text-gray-400', bold && 'font-bold text-gray-900 dark:text-white text-base')}>
        {label}
      </span>
      <span className={clsx('font-semibold text-gray-900 dark:text-white', bold && 'font-bold text-base', valueClass)}>
        {value}
      </span>
    </div>
  )
}
