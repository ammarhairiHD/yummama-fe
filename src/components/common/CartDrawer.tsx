import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { formatMYR } from '../../utils/format'
import clsx from 'clsx'

interface Props {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: Props) {
  const { items, subtotal, totalItems, updateQty, removeItem } = useCart()
  const navigate = useNavigate()

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleCheckout = () => {
    onClose()
    navigate('/checkout')
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={clsx(
          'fixed inset-0 z-50 bg-black/50 transition-opacity',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      />

      {/* Drawer */}
      <div
        className={clsx(
          'fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-3xl max-w-lg mx-auto transition-transform duration-300',
          open ? 'translate-y-0' : 'translate-y-full'
        )}
        style={{ maxHeight: '85vh' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-500" />
            <h2 className="font-bold text-gray-900 dark:text-white text-lg">Your Cart</h2>
            {totalItems > 0 && (
              <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 180px)' }}>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
              <ShoppingBag className="w-14 h-14 text-gray-200 dark:text-gray-700 mb-3" />
              <p className="font-semibold text-gray-500 dark:text-gray-400">Your cart is empty</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Add something delicious from the menu!
              </p>
              <button
                onClick={() => { onClose(); navigate('/menu') }}
                className="mt-5 px-6 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-xl active:scale-95 transition"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <div className="px-5 py-4 space-y-4">
              {items.map((ci) => (
                <div key={ci.cartId} className="flex gap-3">
                  {ci.menuItem.image ? (
                    <img
                      src={ci.menuItem.image}
                      alt={ci.menuItem.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                      <span className="text-2xl">🍽️</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                      {ci.menuItem.name}
                    </p>
                    {ci.selectedAddons.length > 0 && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">
                        {ci.selectedAddons.map((a) => a.addonName).join(', ')}
                      </p>
                    )}
                    {ci.note && (
                      <p className="text-xs text-gray-400 italic mt-0.5">"{ci.note}"</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-orange-500 font-bold text-sm">
                        {formatMYR(ci.itemTotal)}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeItem(ci.cartId)}
                          className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-2 py-1">
                          <button
                            onClick={() => updateQty(ci.cartId, ci.quantity - 1)}
                            className="w-5 h-5 flex items-center justify-center text-gray-600 dark:text-gray-400"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white w-5 text-center">
                            {ci.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(ci.cartId, ci.quantity + 1)}
                            className="w-5 h-5 flex items-center justify-center text-gray-600 dark:text-gray-400"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-600 dark:text-gray-400 text-sm">Subtotal</span>
              <span className="font-bold text-gray-900 dark:text-white">{formatMYR(subtotal)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-semibold rounded-xl transition"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  )
}
