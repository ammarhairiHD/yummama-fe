import { useState, useEffect } from 'react'
import {
  TrendingUp, ShoppingBag, Users, Clock, Package,
  DollarSign, BarChart3, ChevronDown, Info,
} from 'lucide-react'
import clsx from 'clsx'
import { adminGetDashboard } from '../../api/admin'
import type { DashboardStats, CogsInputs } from '../../types'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType
  label: string
  value: string
  sub?: string
  accent?: string
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-gray-400">{label}</p>
        <div className={clsx('w-8 h-8 rounded-xl flex items-center justify-center', accent ?? 'bg-orange-500/10')}>
          <Icon className={clsx('w-4 h-4', accent ? 'text-white' : 'text-orange-400')} />
        </div>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  )
}

function BarChart({ data }: { data: { month: number; orderCount: number; revenue: number }[] }) {
  const [metric, setMetric] = useState<'revenue' | 'orderCount'>('revenue')
  const values = data.map((d) => d[metric])
  const maxVal = Math.max(...values, 1)

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white">Monthly Performance</h3>
          <p className="text-xs text-gray-400 mt-0.5">Full year overview</p>
        </div>
        <div className="flex gap-1 bg-gray-800 p-1 rounded-xl">
          <button
            onClick={() => setMetric('revenue')}
            className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium transition', metric === 'revenue' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white')}
          >
            Revenue
          </button>
          <button
            onClick={() => setMetric('orderCount')}
            className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium transition', metric === 'orderCount' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white')}
          >
            Orders
          </button>
        </div>
      </div>

      <div className="flex items-end gap-1 h-40">
        {data.map((d) => {
          const val = d[metric]
          const height = maxVal > 0 ? Math.max(4, (val / maxVal) * 100) : 4
          return (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1 group relative">
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                {MONTHS[d.month - 1]}: {metric === 'revenue' ? `RM ${val.toFixed(0)}` : `${val} orders`}
              </div>
              <div className="w-full rounded-t-md bg-orange-500/20 hover:bg-orange-500/40 transition" style={{ height: `${height}%` }} />
              <span className="text-[10px] text-gray-500">{MONTHS[d.month - 1].slice(0, 1)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CogsCalculator({ annualSales }: { annualSales: number }) {
  const [inputs, setInputs] = useState<CogsInputs>({
    startingInventory: 0,
    purchases: 0,
    endingInventory: 0,
  })
  const [open, setOpen] = useState(true)

  const h = (k: keyof CogsInputs, v: string) =>
    setInputs((f) => ({ ...f, [k]: parseFloat(v) || 0 }))

  const cogs = inputs.startingInventory + inputs.purchases - inputs.endingInventory
  const foodCostPct = annualSales > 0 ? (cogs / annualSales) * 100 : 0
  const grossProfit = annualSales - cogs

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-orange-400" />
          <h3 className="font-semibold text-white">COGS & Profitability</h3>
        </div>
        <ChevronDown className={clsx('w-4 h-4 text-gray-400 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4">
          <p className="text-xs text-gray-400 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-500" />
            Enter your inventory values to calculate COGS, food cost %, and gross profit.
            Formula: <span className="font-mono text-gray-300 ml-1">Starting + Purchases − Ending = COGS</span>
          </p>

          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(
              [
                { key: 'startingInventory', label: 'Starting Inventory (RM)' },
                { key: 'purchases', label: 'Purchases (RM)' },
                { key: 'endingInventory', label: 'Ending Inventory (RM)' },
              ] as const
            ).map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={inputs[key] || ''}
                  onChange={(e) => h(key, e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>
            ))}
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <ResultCard
              label="COGS"
              formula="Starting + Purchases − Ending"
              value={`RM ${cogs.toFixed(2)}`}
              sub={cogs < 0 ? 'Check your inputs' : undefined}
              accent={cogs < 0 ? 'text-red-400' : 'text-white'}
            />
            <ResultCard
              label="Food & Bev Cost %"
              formula="(COGS ÷ Total Sales) × 100"
              value={`${foodCostPct.toFixed(1)}%`}
              sub={foodCostPct > 35 ? 'Above 35% — review costs' : foodCostPct > 0 ? 'Healthy range' : undefined}
              accent={foodCostPct > 35 ? 'text-red-400' : foodCostPct > 0 ? 'text-green-400' : 'text-white'}
            />
            <ResultCard
              label="Gross Profit"
              formula="Total Sales − COGS"
              value={`RM ${grossProfit.toFixed(2)}`}
              accent={grossProfit < 0 ? 'text-red-400' : 'text-green-400'}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function ResultCard({
  label,
  formula,
  value,
  sub,
  accent,
}: {
  label: string
  formula: string
  value: string
  sub?: string
  accent?: string
}) {
  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <p className="text-xs text-gray-600 font-mono mt-0.5 mb-2">{formula}</p>
      <p className={clsx('text-lg font-bold', accent ?? 'text-white')}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    adminGetDashboard(year)
      .then((res) => setStats(res.dashboard))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [year])

  if (loading) {
    return (
      <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-gray-900 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-gray-900 rounded-2xl animate-pulse" />)}
        </div>
        <div className="h-64 bg-gray-900 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (!stats) return null

  const thisMonthIdx = new Date().getMonth()
  const thisMonth = stats.monthlyData[thisMonthIdx]

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Business overview for {year}</p>
        </div>
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
        >
          {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={TrendingUp}
          label="Annual Sales"
          value={`RM ${stats.annualSales.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub={`${year} total`}
        />
        <StatCard
          icon={ShoppingBag}
          label="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          sub={`This year`}
        />
        <StatCard
          icon={Users}
          label="Customers"
          value={stats.totalCustomers.toLocaleString()}
          sub="Registered"
        />
        <StatCard
          icon={Clock}
          label="Pending Orders"
          value={stats.pendingOrders.toString()}
          sub="Need action"
          accent={stats.pendingOrders > 0 ? 'bg-orange-500' : undefined}
        />
      </div>

      {/* This month highlight */}
      {thisMonth && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 flex items-center gap-4">
          <BarChart3 className="w-8 h-8 text-orange-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-orange-300">
              {MONTHS[thisMonthIdx]} {year} — so far
            </p>
            <p className="text-white font-bold">
              {thisMonth.orderCount} orders · RM {thisMonth.revenue.toFixed(2)} revenue
            </p>
          </div>
        </div>
      )}

      {/* Monthly bar chart */}
      <BarChart data={stats.monthlyData} />

      {/* COGS calculator */}
      <CogsCalculator annualSales={stats.annualSales} />

      {/* Top products */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-orange-400" />
          <h3 className="font-semibold text-white">Top Selling Products</h3>
        </div>
        <div className="space-y-3">
          {stats.topProducts.map((p, i) => {
            const maxQty = Math.max(...stats.topProducts.map((x) => x.totalQty), 1)
            return (
              <div key={p._id} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-4 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white truncate">{p._id}</span>
                    <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0 ml-2">
                      <span>{p.totalQty} sold</span>
                      <span className="text-orange-400 font-medium">RM {p.totalRevenue.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${(p.totalQty / maxQty) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
