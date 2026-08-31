import { useState, useEffect } from 'react'
import { Search, UserPlus, X, Crown, User, ShieldCheck, ToggleLeft, ToggleRight, Eye, EyeOff } from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import { adminGetUsers, adminAddAdmin, adminToggleUserStatus } from '../../api/admin'
import type { UserWithStats } from '../../types'

const POSITIONS = ['Owner', 'Manager', 'Supervisor', 'Cashier', 'Chef', 'Rider', 'Customer Service']

function formatDate(iso?: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatRM(n: number) {
  return `RM ${n.toFixed(2)}`
}

const STATUS_MAP: Record<string, string> = {
  completed: 'text-green-400',
  preparing: 'text-yellow-400',
  ready: 'text-blue-400',
  cancelled: 'text-red-400',
  rejected: 'text-red-500',
  pending_payment: 'text-orange-400',
  paid: 'text-blue-400',
  draft: 'text-gray-400',
}

function AddAdminModal({ onAdd, onClose }: { onAdd: (data: any) => Promise<void>; onClose: () => void }) {
  const [saving, setSaving] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', position: '' })
  const h = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { name, email, phone, password, position } = form
    if (!name || !email || !phone || !password || !position)
      return toast.error('All fields are required')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')
    setSaving(true)
    try {
      await onAdd(form)
      onClose()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add admin')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl border border-gray-800">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-orange-400" />
            <h2 className="font-bold text-white">Add Admin</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <F label="Full Name *">
              <input value={form.name} onChange={(e) => h('name', e.target.value)}
                className={ic} placeholder="Siti Norzahira" />
            </F>
            <F label="Position *">
              <select value={form.position} onChange={(e) => h('position', e.target.value)} className={ic}>
                <option value="">Select…</option>
                {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </F>
          </div>
          <F label="Email *">
            <input type="email" value={form.email} onChange={(e) => h('email', e.target.value)}
              className={ic} placeholder="siti@yummama.com" />
          </F>
          <F label="Phone *">
            <input value={form.phone} onChange={(e) => h('phone', e.target.value)}
              className={ic} placeholder="+60 12-345 6789" />
          </F>
          <F label="Password *">
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => h('password', e.target.value)}
                className={ic + ' pr-10'}
                placeholder="Min 6 characters"
              />
              <button type="button" onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </F>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-300 text-sm hover:bg-gray-800 transition">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition disabled:opacity-50">
              {saving ? 'Adding…' : 'Add Admin'}
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'admin'>('all')
  const [showAddAdmin, setShowAddAdmin] = useState(false)
  const [selected, setSelected] = useState<UserWithStats | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    adminGetUsers()
      .then((res) => setUsers(res.users))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }, [])

  const handleAddAdmin = async (data: any) => {
    const res = await adminAddAdmin(data)
    setUsers((prev) => [res.user as UserWithStats, ...prev])
    toast.success(`Admin "${res.user.name}" added`)
  }

  const handleToggle = async (user: UserWithStats) => {
    setToggling(user.id)
    try {
      await adminToggleUserStatus(user.id, !user.isActive)
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, isActive: !u.isActive } : u))
      toast.success(`User ${!user.isActive ? 'activated' : 'deactivated'}`)
    } catch { toast.error('Failed to update') }
    setToggling(null)
  }

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    const matchSearch = !q
      || u.name.toLowerCase().includes(q)
      || u.email.toLowerCase().includes(q)
      || u.userId.toLowerCase().includes(q)
    return matchRole && matchSearch
  })

  const totalCustomers = users.filter((u) => u.role === 'customer').length
  const totalAdmins = users.filter((u) => u.role === 'admin').length

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Users</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {totalCustomers} customer{totalCustomers !== 1 ? 's' : ''} · {totalAdmins} admin{totalAdmins !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowAddAdmin(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition"
        >
          <UserPlus className="w-4 h-4" />
          Add Admin
        </button>
      </div>

      {/* Search + role filter */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, or ID…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
        </div>
        <div className="flex gap-1 bg-gray-900 border border-gray-800 p-1 rounded-xl">
          {(['all', 'customer', 'admin'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize',
                roleFilter === r ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* User list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-2xl bg-gray-900 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <User className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No users found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((user) => (
            <div
              key={user.id}
              className={clsx(
                'bg-gray-900 border rounded-2xl p-4 transition',
                user.isActive === false ? 'border-gray-800 opacity-60' : 'border-gray-800 hover:border-gray-700'
              )}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className={clsx(
                  'w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                  user.role === 'admin' ? 'bg-orange-500' : 'bg-gray-700'
                )}>
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white truncate">{user.name}</p>
                    {user.role === 'admin' && (
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 shrink-0">
                        <Crown className="w-3 h-3" />
                        {user.position || 'Admin'}
                      </span>
                    )}
                    {!user.isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 shrink-0">Inactive</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-400 mt-0.5">
                    <span>{user.email}</span>
                    <span>·</span>
                    <span className="font-mono">{user.userId}</span>
                    {user.role === 'customer' && (
                      <>
                        <span>·</span>
                        <span>RM {user.stats.totalSpent.toFixed(2)} spent</span>
                        <span>·</span>
                        <span>{user.stats.orderCount} order{user.stats.orderCount !== 1 ? 's' : ''}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {user.role === 'customer' && (
                    <button
                      onClick={() => setSelected(selected?.id === user.id ? null : user)}
                      className="p-2 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition text-xs"
                    >
                      {selected?.id === user.id ? 'Hide' : 'View'}
                    </button>
                  )}
                  <button
                    onClick={() => handleToggle(user)}
                    disabled={toggling === user.id}
                    className="transition"
                    title={user.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {user.isActive
                      ? <ToggleRight className="w-8 h-8 text-green-400" />
                      : <ToggleLeft className="w-8 h-8 text-gray-600" />}
                  </button>
                </div>
              </div>

              {/* Expanded customer stats */}
              {selected?.id === user.id && (
                <div className="mt-3 pt-3 border-t border-gray-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Stat label="Total Orders" value={user.stats.orderCount.toString()} />
                  <Stat label="Total Spent" value={formatRM(user.stats.totalSpent)} highlight />
                  <Stat label="Points" value={user.points.toString()} />
                  <Stat label="Member Since" value={formatDate(user.createdAt)} />
                  {user.stats.lastOrder && (
                    <div className="col-span-2 sm:col-span-4 bg-gray-800 rounded-xl px-3 py-2">
                      <p className="text-xs text-gray-500 mb-1">Last Order</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-mono text-white text-xs">
                          #{user.stats.lastOrder.orderNumber.slice(0, 2)}-{user.stats.lastOrder.orderNumber.slice(2)}
                        </span>
                        <span className={clsx('text-xs font-medium capitalize', STATUS_MAP[user.stats.lastOrder.status] ?? 'text-gray-400')}>
                          {user.stats.lastOrder.status.replace('_', ' ')}
                        </span>
                        <span className="text-orange-400 font-semibold text-xs">
                          {formatRM(user.stats.lastOrder.total)}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {formatDate(user.stats.lastOrder.createdAt)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAddAdmin && (
        <AddAdminModal onAdd={handleAddAdmin} onClose={() => setShowAddAdmin(false)} />
      )}
    </div>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-gray-800 rounded-xl px-3 py-2">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={clsx('text-sm font-semibold', highlight ? 'text-orange-400' : 'text-white')}>{value}</p>
    </div>
  )
}
