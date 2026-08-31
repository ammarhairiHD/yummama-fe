import { Tag, Copy, CheckCircle, Clock } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { getPromos } from '../../api/promos'
import { formatMYR } from '../../utils/format'
import toast from 'react-hot-toast'
import { useState } from 'react'
import clsx from 'clsx'
import type { Promo } from '../../types'

export default function PromoPage() {
  const { data, loading } = useApi(() => getPromos(), [])
  const promos: Promo[] = data?.promos ?? []

  return (
    <div className="flex flex-col min-h-full bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 px-5 pt-12 pb-5 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Tag className="w-5 h-5 text-orange-500" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Promos</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Copy a code and apply it at checkout
        </p>
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-4 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3 mb-2" />
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-xl" />
              </div>
            ))}
          </div>
        ) : promos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Tag className="w-14 h-14 text-gray-200 dark:text-gray-700 mb-3" />
            <p className="font-semibold text-gray-500 dark:text-gray-400">No promos available</p>
            <p className="text-sm text-gray-400 mt-1">Check back soon for great deals!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {promos.map((promo) => (
              <PromoCard key={promo._id} promo={promo} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PromoCard({ promo }: { promo: Promo }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promo.code)
      setCopied(true)
      toast.success(`Code "${promo.code}" copied!`)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error('Could not copy code')
    }
  }

  const discountLabel =
    promo.discountType === 'percentage'
      ? `${promo.discountValue}% off${promo.maxDiscount ? ` (max ${formatMYR(promo.maxDiscount)})` : ''}`
      : `${formatMYR(promo.discountValue)} off`

  const daysLeft = Math.ceil(
    (new Date(promo.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm">
      {/* Top accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-orange-400 to-orange-500" />

      <div className="p-4">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-gray-900 dark:text-white text-base">{promo.title}</h3>
          <span className="text-xs font-bold bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full shrink-0">
            {discountLabel}
          </span>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{promo.description}</p>

        {/* Terms */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mb-4">
          {promo.minOrderAmount > 0 && (
            <span>Min. order {formatMYR(promo.minOrderAmount)}</span>
          )}
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>
              {daysLeft > 0 ? `Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}` : 'Expires today'}
            </span>
          </div>
          {promo.usageLimit > 0 && (
            <span>{promo.usageLimit - promo.usedCount} uses left</span>
          )}
        </div>

        {/* Promo code + copy button */}
        <div className="flex items-center gap-2">
          <div className="flex-1 border-2 border-dashed border-orange-300 dark:border-orange-700 rounded-xl px-4 py-2 bg-orange-50 dark:bg-orange-900/10">
            <span className="font-bold text-orange-600 dark:text-orange-400 tracking-widest text-sm">
              {promo.code}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className={clsx(
              'flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition active:scale-95',
              copied
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            )}
          >
            {copied ? (
              <><CheckCircle className="w-4 h-4" /> Copied!</>
            ) : (
              <><Copy className="w-4 h-4" /> Copy</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
