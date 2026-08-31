import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Moon, Sun, ChevronRight, Copy, CheckCircle,
  LogOut, Lock, MapPin, Phone, Edit3, Wallet, Star, Shield
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { updateProfile, changePassword } from '../../api/profile'
import { formatMYR } from '../../utils/format'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [editOpen, setEditOpen] = useState(false)
  const [pwOpen, setPwOpen] = useState(false)
  const [copiedId, setCopiedId] = useState(false)

  const copyUserId = async () => {
    if (!user?.userId) return
    await navigator.clipboard.writeText(user.userId)
    setCopiedId(true)
    toast.success('Referral code copied!')
    setTimeout(() => setCopiedId(false), 2500)
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex flex-col min-h-full bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <div className="bg-orange-500 px-5 pt-12 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
            ) : (
              <span className="text-2xl font-bold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-xl truncate">{user?.name}</h1>
            <p className="text-orange-100 text-sm truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => setEditOpen(true)}
            className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <StatCard
            icon="💰"
            label="Wallet"
            value={formatMYR(user?.walletBalance ?? 0)}
            onClick={() => navigate('/wallet')}
          />
          <StatCard
            icon="⭐"
            label="Points"
            value={`${user?.points ?? 0} pts`}
          />
          <StatCard
            icon="🎁"
            label="Referrals"
            value={user?.referredBy ? 'Active' : 'None'}
          />
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Referral / User ID */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-bold text-gray-900 dark:text-white">Your Referral Code</p>
            <Shield className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-xs text-gray-400 mb-3">
            Share your code — you get 50 points, they get 20!
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-orange-50 dark:bg-orange-900/20 border-2 border-dashed border-orange-300 dark:border-orange-700 rounded-xl px-4 py-2.5">
              <span className="font-bold text-orange-600 dark:text-orange-400 tracking-widest">
                {user?.userId ?? '—'}
              </span>
            </div>
            <button
              onClick={copyUserId}
              className={clsx(
                'flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm transition active:scale-95',
                copiedId
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              )}
            >
              {copiedId ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedId ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden">
          <MenuRow
            icon={<Wallet className="w-4 h-4 text-green-600" />}
            iconBg="bg-green-100 dark:bg-green-900/30"
            label="Yummama Wallet"
            value={formatMYR(user?.walletBalance ?? 0)}
            onClick={() => navigate('/wallet')}
          />
          <MenuRow
            icon={<Star className="w-4 h-4 text-yellow-500" />}
            iconBg="bg-yellow-100 dark:bg-yellow-900/30"
            label="Yummama Points"
            value={`${user?.points ?? 0} pts`}
          />
        </div>

        {/* Account settings */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-4 pt-3 pb-2">
            Account
          </p>
          <MenuRow
            icon={<User className="w-4 h-4 text-blue-600" />}
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            label="Edit Profile"
            onClick={() => setEditOpen(true)}
          />
          <MenuRow
            icon={<Lock className="w-4 h-4 text-purple-600" />}
            iconBg="bg-purple-100 dark:bg-purple-900/30"
            label="Change Password"
            onClick={() => setPwOpen(true)}
          />
          <MenuRow
            icon={<Phone className="w-4 h-4 text-gray-600" />}
            iconBg="bg-gray-100 dark:bg-gray-800"
            label="Phone"
            value={user?.phone ?? '—'}
          />
          <MenuRow
            icon={<MapPin className="w-4 h-4 text-red-500" />}
            iconBg="bg-red-100 dark:bg-red-900/30"
            label="Address"
            value={user?.address ?? 'Not set'}
            onClick={() => setEditOpen(true)}
          />
        </div>

        {/* Appearance */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-4 pt-3 pb-2">
            Appearance
          </p>
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Sun className="w-4 h-4 text-yellow-500" />
                )}
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </span>
            </div>
            {/* Toggle switch */}
            <button
              onClick={toggleTheme}
              className={clsx(
                'w-12 h-6 rounded-full transition-colors relative',
                theme === 'dark' ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'
              )}
            >
              <div
                className={clsx(
                  'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'
                )}
              />
            </button>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-red-200 dark:border-red-900/50 text-red-500 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/10 active:scale-95 transition"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>

        <p className="text-center text-xs text-gray-400 pb-2">Yummama Bites v1.0.0</p>
      </div>

      {/* Edit Profile Modal */}
      {editOpen && (
        <EditProfileModal
          user={user!}
          onClose={() => setEditOpen(false)}
          onSaved={(updated) => { updateUser(updated); setEditOpen(false) }}
        />
      )}

      {/* Change Password Modal */}
      {pwOpen && (
        <ChangePasswordModal onClose={() => setPwOpen(false)} />
      )}
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, onClick }: { icon: string; label: string; value: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-white/20 rounded-2xl p-3 text-center active:scale-95 transition w-full"
      disabled={!onClick}
    >
      <span className="text-lg">{icon}</span>
      <p className="text-white/80 text-[10px] mt-0.5">{label}</p>
      <p className="text-white font-bold text-xs mt-0.5 truncate">{value}</p>
    </button>
  )
}

function MenuRow({
  icon, iconBg, label, value, onClick,
}: {
  icon: React.ReactNode
  iconBg: string
  label: string
  value?: string
  onClick?: () => void
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-800 last:border-none transition',
        onClick && 'hover:bg-gray-50 dark:hover:bg-gray-800/50 active:bg-gray-100 dark:active:bg-gray-800'
      )}
    >
      <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', iconBg)}>
        {icon}
      </div>
      <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white text-left">
        {label}
      </span>
      {value && (
        <span className="text-xs text-gray-400 dark:text-gray-500 mr-1 truncate max-w-[100px]">
          {value}
        </span>
      )}
      {onClick && <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />}
    </Tag>
  )
}

function EditProfileModal({
  user, onClose, onSaved,
}: {
  user: any
  onClose: () => void
  onSaved: (u: any) => void
}) {
  const [form, setForm] = useState({ name: user.name, phone: user.phone, address: user.address ?? '' })
  const [saving, setSaving] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const save = async () => {
    setSaving(true)
    try {
      const res = await updateProfile(form)
      onSaved(res.user)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-3xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-gray-900 dark:text-white text-lg">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm font-medium">
            Cancel
          </button>
        </div>
        {[
          { label: 'Full Name', key: 'name', type: 'text' },
          { label: 'Phone', key: 'phone', type: 'tel' },
        ].map(({ label, key, type }) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>
            <input
              type={type}
              value={(form as any)[key]}
              onChange={set(key)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
          </div>
        ))}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Address</label>
          <textarea
            rows={2}
            value={form.address}
            onChange={set('address')}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition resize-none"
          />
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl active:scale-95 transition"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const save = async () => {
    if (form.next !== form.confirm) return toast.error('New passwords do not match')
    if (form.next.length < 6) return toast.error('Password must be at least 6 characters')
    setSaving(true)
    try {
      await changePassword(form.current, form.next)
      toast.success('Password updated!')
      onClose()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-3xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-gray-900 dark:text-white text-lg">Change Password</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm font-medium">
            Cancel
          </button>
        </div>
        {[
          { label: 'Current Password', key: 'current' },
          { label: 'New Password', key: 'next' },
          { label: 'Confirm New Password', key: 'confirm' },
        ].map(({ label, key }) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">{label}</label>
            <input
              type="password"
              value={(form as any)[key]}
              onChange={set(key)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />
          </div>
        ))}
        <button
          onClick={save}
          disabled={saving}
          className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl active:scale-95 transition"
        >
          {saving ? 'Saving…' : 'Update Password'}
        </button>
      </div>
    </div>
  )
}
