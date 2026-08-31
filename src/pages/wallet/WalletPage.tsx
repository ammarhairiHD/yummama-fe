import { useState } from 'react'
import { ArrowUpRight, ArrowDownLeft, Plus, Wallet, Star, RefreshCw, Loader2 } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { getWallet, topUp } from '../../api/wallet'
import { useAuth } from '../../context/AuthContext'
import { formatMYR, formatDateTime } from '../../utils/format'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import type { Transaction } from '../../types'

export default function WalletPage() {
  const { user, updateUser } = useAuth()
  const [topUpOpen, setTopUpOpen] = useState(false)
  const { data, loading, refetch } = useApi(() => getWallet(), [])

  const balance = data?.walletBalance ?? user?.walletBalance ?? 0
  const points = data?.points ?? user?.points ?? 0
  const transactions: Transaction[] = data?.transactions ?? []
  const topUpAmounts: number[] = data?.topUpAmounts ?? [10, 20, 50, 100, 200]

  const handleTopUp = async (amount: number) => {
    try {
      const res = await topUp(amount)
      toast.success(res.message)
      updateUser({ ...user!, walletBalance: res.walletBalance })
      refetch()
      setTopUpOpen(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Top-up failed')
    }
  }

  return (
    <div className="flex flex-col min-h-full bg-gray-50 dark:bg-gray-950">
      {/* Header card */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-5 pt-12 pb-8 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute top-12 -right-4 w-24 h-24 bg-white/10 rounded-full" />

        <div className="flex items-center justify-between mb-6 relative">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-white" />
            <h1 className="text-white font-bold text-lg">Yummama Wallet</h1>
          </div>
          <button
            onClick={refetch}
            disabled={loading}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/20 text-white"
          >
            <RefreshCw className={clsx('w-4 h-4', loading && 'animate-spin')} />
          </button>
        </div>

        <div className="relative">
          <p className="text-orange-100 text-sm mb-1">Available Balance</p>
          <p className="text-white text-4xl font-bold mb-1">{formatMYR(balance)}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            <span className="text-orange-100 text-sm">
              {points} Yummama Points
            </span>
          </div>
        </div>

        {/* Top up button */}
        <button
          onClick={() => setTopUpOpen(true)}
          className="mt-5 bg-white text-orange-500 font-bold text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 active:scale-95 transition shadow"
        >
          <Plus className="w-4 h-4" />
          Top Up
        </button>
      </div>

      <div className="px-4 py-4">
        {/* Transaction history */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900 dark:text-white">Transaction History</h2>
          <span className="text-xs text-gray-400">{transactions.length} recent</span>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-4 animate-pulse flex gap-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Wallet className="w-14 h-14 text-gray-200 dark:text-gray-700 mb-3" />
            <p className="font-semibold text-gray-500 dark:text-gray-400">No transactions yet</p>
            <p className="text-sm text-gray-400 mt-1">Top up or place an order to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <TransactionRow key={tx._id} tx={tx} />
            ))}
          </div>
        )}
      </div>

      {/* Top-up modal */}
      {topUpOpen && (
        <TopUpModal
          amounts={topUpAmounts}
          onClose={() => setTopUpOpen(false)}
          onTopUp={handleTopUp}
        />
      )}
    </div>
  )
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const isCredit = tx.amount > 0
  const iconMap: Record<string, React.ReactNode> = {
    topup: <ArrowDownLeft className="w-4 h-4 text-green-600 dark:text-green-400" />,
    payment: <ArrowUpRight className="w-4 h-4 text-red-500" />,
    refund: <ArrowDownLeft className="w-4 h-4 text-blue-500" />,
    referral_bonus: <Star className="w-4 h-4 text-yellow-500" />,
    points_redeem: <ArrowUpRight className="w-4 h-4 text-orange-500" />,
  }
  const bgMap: Record<string, string> = {
    topup: 'bg-green-100 dark:bg-green-900/30',
    payment: 'bg-red-100 dark:bg-red-900/30',
    refund: 'bg-blue-100 dark:bg-blue-900/30',
    referral_bonus: 'bg-yellow-100 dark:bg-yellow-900/30',
    points_redeem: 'bg-orange-100 dark:bg-orange-900/30',
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
      <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', bgMap[tx.type] ?? 'bg-gray-100')}>
        {iconMap[tx.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
          {tx.description}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          {formatDateTime(tx.createdAt)}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className={clsx('font-bold text-sm', isCredit ? 'text-green-600 dark:text-green-400' : 'text-red-500')}>
          {isCredit ? '+' : ''}{formatMYR(Math.abs(tx.amount))}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{formatMYR(tx.balanceAfter)}</p>
      </div>
    </div>
  )
}

function TopUpModal({
  amounts, onClose, onTopUp,
}: { amounts: number[]; onClose: () => void; onTopUp: (n: number) => void }) {
  const [selected, setSelected] = useState<number | null>(null)
  const [custom, setCustom] = useState('')
  const [loading, setLoading] = useState(false)

  const finalAmount = custom ? parseFloat(custom) : selected

  const handleConfirm = async () => {
    if (!finalAmount || finalAmount < 1) return toast.error('Enter a valid amount')
    setLoading(true)
    await onTopUp(finalAmount)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-3xl p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-bold text-gray-900 dark:text-white text-lg">Top Up Wallet</h2>
          <button onClick={onClose} className="text-gray-400 text-sm font-medium hover:text-gray-600 dark:hover:text-gray-300">
            Cancel
          </button>
        </div>

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Select Amount</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {amounts.map((amt) => (
            <button
              key={amt}
              onClick={() => { setSelected(amt); setCustom('') }}
              className={clsx(
                'py-3 rounded-xl font-bold text-sm border-2 transition active:scale-95',
                selected === amt && !custom
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
              )}
            >
              {formatMYR(amt)}
            </button>
          ))}
        </div>

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Or Enter Custom</p>
        <input
          type="number"
          placeholder="Enter amount (e.g. 75)"
          value={custom}
          onChange={(e) => { setCustom(e.target.value); setSelected(null) }}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition mb-5"
        />

        <button
          onClick={handleConfirm}
          disabled={!finalAmount || loading}
          className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold rounded-xl transition active:scale-95 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
          ) : (
            `Top Up ${finalAmount ? formatMYR(finalAmount) : ''}`
          )}
        </button>
      </div>
    </div>
  )
}
