import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Tag, ToggleLeft, ToggleRight, Copy } from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import { adminGetPromos, adminCreatePromo, adminUpdatePromo, adminDeletePromo } from '../../api/admin'
import type { Promo, PromoCategory } from '../../types'

const PROMO_CATEGORIES: { value: PromoCategory; label: string; icon: string; desc: string }[] = [
  { value: 'welcome',      label: 'Welcome',       icon: '🎉', desc: 'New users / first order' },
  { value: 'seasonal',     label: 'Seasonal',      icon: '🌙', desc: 'Raya, CNY, holidays' },
  { value: 'loyalty',      label: 'Loyalty',       icon: '⭐', desc: 'Reward repeat customers' },
  { value: 'flash',        label: 'Flash Sale',    icon: '⚡', desc: 'Time-limited deals' },
  { value: 'bundle',       label: 'Bundle',        icon: '📦', desc: 'Min order amount deals' },
  { value: 'product',      label: 'Product',       icon: '🍖', desc: 'On selected products' },
  { value: 'category',     label: 'Category',      icon: '🗂️', desc: 'On selected categories' },
  { value: 'free_delivery',label: 'Free Delivery', icon: '🚗', desc: 'Waive delivery fee' },
  { value: 'referral',     label: 'Referral',      icon: '👥', desc: 'Referral rewards' },
  { value: 'general',      label: 'General',       icon: '🏷️', desc: 'General discount' },
]

const STATUS_COLORS = {
  active:   'bg-green-400/10 border-green-400/30 text-green-400',
  inactive: 'bg-gray-500/10 border-gray-500/30 text-gray-400',
  expired:  'bg-red-400/10 border-red-400/30 text-red-400',
}

function promoStatus(promo: Promo): 'active' | 'inactive' | 'expired' {
  if (new Date(promo.expiresAt) < new Date()) return 'expired'
  return promo.isActive ? 'active' : 'inactive'
}

function PromoForm({
  initial,
  onSave,
  onClose,
}: {
  initial?: Promo | null
  onSave: (data: any) => Promise<void>
  onClose: () => void
}) {
  const [saving, setSaving] = useState(false)
  const defaultExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const [form, setForm] = useState({
    code: initial?.code ?? '',
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    promoCategory: (initial?.promoCategory ?? 'general') as PromoCategory,
    discountType: (initial?.discountType ?? 'percentage') as 'percentage' | 'fixed',
    discountValue: initial?.discountValue?.toString() ?? '',
    minOrderAmount: initial?.minOrderAmount?.toString() ?? '0',
    maxDiscount: initial?.maxDiscount?.toString() ?? '',
    usageLimit: initial?.usageLimit?.toString() ?? '0',
    maxUsagePerUser: initial?.maxUsagePerUser?.toString() ?? '0',
    isActive: initial?.isActive ?? true,
    expiresAt: initial ? initial.expiresAt.split('T')[0] : defaultExpiry,
  })

  const h = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code || !form.title || !form.discountValue) return toast.error('Code, title, and discount are required')
    setSaving(true)
    try {
      await onSave({
        ...form,
        code: form.code.toUpperCase().replace(/\s+/g, ''),
        discountValue: parseFloat(form.discountValue),
        minOrderAmount: parseFloat(form.minOrderAmount) || 0,
        maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : undefined,
        usageLimit: parseInt(form.usageLimit) || 0,
        maxUsagePerUser: parseInt(form.maxUsagePerUser) || 0,
        expiresAt: new Date(form.expiresAt).toISOString(),
      })
      onClose()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-lg bg-gray-900 rounded-2xl border border-gray-800 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
          <h2 className="font-bold text-white">{initial ? 'Edit Promo' : 'Create Promo'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          {/* Code + Title */}
          <div className="grid grid-cols-2 gap-3">
            <F label="Promo Code *">
              <input value={form.code} onChange={(e) => h('code', e.target.value.toUpperCase())}
                className={ic} placeholder="SAVE10" />
            </F>
            <F label="Title *">
              <input value={form.title} onChange={(e) => h('title', e.target.value)}
                className={ic} placeholder="RM10 Off" />
            </F>
          </div>

          <F label="Description">
            <textarea value={form.description} onChange={(e) => h('description', e.target.value)}
              className={ic + ' resize-none'} rows={2} placeholder="Short description shown to customers" />
          </F>

          {/* Promo category */}
          <F label="Promo Type *">
            <div className="grid grid-cols-2 gap-1.5">
              {PROMO_CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => h('promoCategory', c.value)}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-2 rounded-xl border text-left text-xs transition',
                    form.promoCategory === c.value
                      ? 'bg-orange-500/10 border-orange-500 text-orange-300'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  )}
                >
                  <span className="text-base">{c.icon}</span>
                  <div>
                    <p className="font-medium">{c.label}</p>
                    <p className="text-gray-500 text-[10px]">{c.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </F>

          {/* Discount type + value */}
          <div className="grid grid-cols-3 gap-3">
            <F label="Discount Type">
              <select value={form.discountType} onChange={(e) => h('discountType', e.target.value)} className={ic}>
                <option value="percentage">% Percentage</option>
                <option value="fixed">RM Fixed</option>
              </select>
            </F>
            <F label={form.discountType === 'percentage' ? 'Value (%)' : 'Value (RM)'}>
              <input type="number" min="0" step="0.01" value={form.discountValue}
                onChange={(e) => h('discountValue', e.target.value)} className={ic} placeholder="10" />
            </F>
            {form.discountType === 'percentage' && (
              <F label="Max Discount (RM)">
                <input type="number" min="0" step="0.01" value={form.maxDiscount}
                  onChange={(e) => h('maxDiscount', e.target.value)} className={ic} placeholder="Optional" />
              </F>
            )}
          </div>

          {/* Rules */}
          <div className="grid grid-cols-2 gap-3">
            <F label="Min Order Amount (RM)">
              <input type="number" min="0" step="0.01" value={form.minOrderAmount}
                onChange={(e) => h('minOrderAmount', e.target.value)} className={ic} placeholder="0" />
            </F>
            <F label="Expiry Date">
              <input type="date" value={form.expiresAt} onChange={(e) => h('expiresAt', e.target.value)} className={ic} />
            </F>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <F label="Total Usage Limit (0 = unlimited)">
              <input type="number" min="0" value={form.usageLimit}
                onChange={(e) => h('usageLimit', e.target.value)} className={ic} placeholder="0" />
            </F>
            <F label="Per-User Limit (0 = unlimited)">
              <input type="number" min="0" value={form.maxUsagePerUser}
                onChange={(e) => h('maxUsagePerUser', e.target.value)} className={ic} placeholder="0" />
            </F>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <button type="button" onClick={() => h('isActive', !form.isActive)}>
              {form.isActive
                ? <ToggleRight className="w-8 h-8 text-green-400" />
                : <ToggleLeft className="w-8 h-8 text-gray-600" />}
            </button>
            <span className="text-sm text-gray-300">Active</span>
          </label>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-300 text-sm hover:bg-gray-800 transition">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition disabled:opacity-50">
              {saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Promo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const ic = 'w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50'
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

export default function AdminPromosPage() {
  const [promos, setPromos] = useState<Promo[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; promo?: Promo | null }>({ open: false })
  const [deleteConfirm, setDeleteConfirm] = useState<Promo | null>(null)

  useEffect(() => {
    adminGetPromos()
      .then((res) => setPromos(res.promos))
      .catch(() => toast.error('Failed to load promos'))
      .finally(() => setLoading(false))
  }, [])

  const save = async (data: any) => {
    if (modal.promo) {
      const res = await adminUpdatePromo(modal.promo._id, data)
      setPromos((prev) => prev.map((p) => p._id === modal.promo!._id ? res.promo : p))
      toast.success('Promo updated')
    } else {
      const res = await adminCreatePromo(data)
      setPromos((prev) => [res.promo, ...prev])
      toast.success('Promo created')
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      await adminDeletePromo(deleteConfirm._id)
      setPromos((prev) => prev.filter((p) => p._id !== deleteConfirm._id))
      toast.success('Promo deleted')
    } catch { toast.error('Failed to delete') }
    setDeleteConfirm(null)
  }

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Promo Codes</h1>
          <p className="text-sm text-gray-400 mt-0.5">{promos.filter((p) => promoStatus(p) === 'active').length} active promo{promos.filter((p) => promoStatus(p) === 'active').length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" />
          Create Promo
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-2xl bg-gray-900 animate-pulse" />)}
        </div>
      ) : promos.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Tag className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No promo codes yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {promos.map((promo) => {
            const st = promoStatus(promo)
            const pcat = PROMO_CATEGORIES.find((c) => c.value === promo.promoCategory)
            const usagePercent = promo.usageLimit > 0
              ? Math.round((promo.usedCount / promo.usageLimit) * 100)
              : null

            return (
              <div key={promo._id} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-xl shrink-0">
                    {pcat?.icon ?? '🏷️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-white">{promo.code}</span>
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full border font-medium capitalize', STATUS_COLORS[st])}>
                        {st}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
                        {pcat?.label ?? promo.promoCategory}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-200">{promo.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{promo.description}</p>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-gray-400">
                      <span className="text-orange-400 font-semibold">
                        {promo.discountType === 'percentage'
                          ? `${promo.discountValue}% off${promo.maxDiscount ? ` (max RM${promo.maxDiscount})` : ''}`
                          : `RM${promo.discountValue} off`}
                      </span>
                      {promo.minOrderAmount > 0 && <span>Min order RM{promo.minOrderAmount}</span>}
                      <span>Used: {promo.usedCount}{promo.usageLimit > 0 ? `/${promo.usageLimit}` : ''}</span>
                      <span>Expires: {new Date(promo.expiresAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>

                    {usagePercent !== null && (
                      <div className="mt-2">
                        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={clsx('h-full rounded-full transition-all', usagePercent >= 90 ? 'bg-red-500' : 'bg-orange-500')}
                            style={{ width: `${Math.min(100, usagePercent)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => { navigator.clipboard.writeText(promo.code); toast.success('Code copied') }}
                      className="p-2 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition"
                      title="Copy code"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setModal({ open: true, promo })}
                      className="p-2 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(promo)}
                      className="p-2 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal.open && (
        <PromoForm initial={modal.promo} onSave={save} onClose={() => setModal({ open: false })} />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-sm bg-gray-900 rounded-2xl border border-gray-800 p-5">
            <h3 className="font-semibold text-white mb-2">Delete Promo?</h3>
            <p className="text-sm text-gray-400 mb-4">
              Promo code <span className="font-mono font-bold text-white">{deleteConfirm.code}</span> will be permanently deleted.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-300 text-sm hover:bg-gray-800 transition">
                Cancel
              </button>
              <button onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
