import { useState } from 'react'
import { UserCircle, Mail, Phone, MapPin, Briefcase, Lock, Eye, EyeOff, Crown } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import * as profileApi from '../../api/profile'

const ic = 'w-full px-3 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50'

function Field({ label, icon: Icon, children }: { label: string; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </label>
      {children}
    </div>
  )
}

export default function AdminProfilePage() {
  const { user, updateUser } = useAuth()
  const [tab, setTab] = useState<'profile' | 'password'>('profile')

  // Profile form
  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
  })
  const [saving, setSaving] = useState(false)

  // Password form
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await profileApi.updateProfile(form)
      if (res.user) {
        updateUser(res.user)
        toast.success('Profile updated')
      } else {
        toast.error('Failed to update profile data')
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pw.next.length < 6) return toast.error('New password must be at least 6 characters')
    if (pw.next !== pw.confirm) return toast.error('Passwords do not match')
    setSavingPw(true)
    try {
      await profileApi.changePassword(pw.current, pw.next)
      toast.success('Password changed successfully')
      setPw({ current: '', next: '', confirm: '' })
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to change password')
    } finally {
      setSavingPw(false)
    }
  }

  return (
    <div className="p-4 lg:p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold text-white mb-6">Profile Settings</h1>

      {/* User card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center text-2xl font-bold text-white shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-lg">{user?.name}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400">
                <Crown className="w-3 h-3" />
                {user?.position || 'Admin'}
              </span>
              <span className="text-xs text-gray-500 font-mono">{user?.userId}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 p-1 rounded-xl mb-5 w-fit">
        {(['profile', 'password'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
              tab === t ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {t === 'password' ? 'Change Password' : 'Edit Profile'}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <form onSubmit={saveProfile} className="space-y-4">
          <Field label="Full Name" icon={UserCircle}>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={ic}
              placeholder="Your full name"
            />
          </Field>

          <Field label="Email" icon={Mail}>
            <input
              value={user?.email ?? ''}
              disabled
              className={ic + ' opacity-50 cursor-not-allowed'}
            />
          </Field>

          <Field label="Phone" icon={Phone}>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className={ic}
              placeholder="+60 12-345 6789"
            />
          </Field>

          <Field label="Address" icon={MapPin}>
            <input
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              className={ic}
              placeholder="Your address"
            />
          </Field>

          <Field label="Position" icon={Briefcase}>
            <input
              value={user?.position ?? '—'}
              disabled
              className={ic + ' opacity-50 cursor-not-allowed'}
            />
          </Field>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      )}

      {tab === 'password' && (
        <form onSubmit={changePassword} className="space-y-4">
          <Field label="Current Password" icon={Lock}>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={pw.current}
                onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
                className={ic + ' pr-10'}
                placeholder="Current password"
              />
              <button type="button" onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>

          <Field label="New Password" icon={Lock}>
            <div className="relative">
              <input
                type={showNext ? 'text' : 'password'}
                value={pw.next}
                onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
                className={ic + ' pr-10'}
                placeholder="Min 6 characters"
              />
              <button type="button" onClick={() => setShowNext((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200">
                {showNext ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>

          <Field label="Confirm New Password" icon={Lock}>
            <input
              type="password"
              value={pw.confirm}
              onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))}
              className={ic}
              placeholder="Repeat new password"
            />
          </Field>

          <button
            type="submit"
            disabled={savingPw}
            className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition disabled:opacity-50"
          >
            {savingPw ? 'Changing…' : 'Change Password'}
          </button>
        </form>
      )}
    </div>
  )
}
