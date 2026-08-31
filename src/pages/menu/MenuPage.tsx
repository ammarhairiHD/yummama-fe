import { useState } from 'react'
import { Search, ShoppingBag, Plus, Clock, SlidersHorizontal } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { getCategories, getMenuItems } from '../../api/menu'
import { useCart } from '../../context/CartContext'
import { formatMYR } from '../../utils/format'
import ItemModal from './ItemModal'
import CartDrawer from '../../components/common/CartDrawer'
import clsx from 'clsx'
import type { MenuItem, Category } from '../../types'

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [cartOpen, setCartOpen] = useState(false)

  const { data: catData } = useApi(() => getCategories(), [])
  const { data: menuData, loading } = useApi(
    () => getMenuItems(selectedCategory !== 'all' ? { category: selectedCategory } : {}),
    [selectedCategory]
  )

  const { totalItems, subtotal } = useCart()
  const categories: Category[] = catData?.categories ?? []
  const allItems: MenuItem[] = menuData?.items ?? []

  const filtered = allItems.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col min-h-full bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 px-5 pt-12 pb-4 shadow-sm sticky top-0 z-30">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Our Menu</h1>
          <button
            onClick={() => setCartOpen(true)}
            className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-500"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
          />
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-1">
          <CategoryPill
            label="All"
            active={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
          />
          {categories.map((cat) => (
            <CategoryPill
              key={cat._id}
              label={`${cat.icon ?? ''} ${cat.name}`}
              active={selectedCategory === cat._id}
              onClick={() => setSelectedCategory(cat._id)}
            />
          ))}
        </div>
      </div>

      {/* Items grid */}
      <div className="px-4 py-4 flex-1">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-32 bg-gray-200 dark:bg-gray-800" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <SlidersHorizontal className="w-12 h-12 text-gray-200 dark:text-gray-700 mb-3" />
            <p className="font-semibold text-gray-500 dark:text-gray-400">No items found</p>
            <p className="text-sm text-gray-400 mt-1">Try a different category or search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((item) => (
              <MenuCard key={item._id} item={item} onClick={() => setSelectedItem(item)} />
            ))}
          </div>
        )}
      </div>

      {/* Sticky cart bar */}
      {totalItems > 0 && (
        <div className="sticky bottom-20 px-4 z-20">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white rounded-2xl py-3.5 flex items-center justify-between px-5 shadow-lg transition"
          >
            <span className="bg-orange-600 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
              {totalItems}
            </span>
            <span className="font-semibold">View Cart</span>
            <span className="font-bold">{formatMYR(subtotal)}</span>
          </button>
        </div>
      )}

      {/* Item detail modal */}
      {selectedItem && (
        <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}

function CategoryPill({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap',
        active
          ? 'bg-orange-500 text-white shadow-sm'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
      )}
    >
      {label}
    </button>
  )
}

function MenuCard({ item, onClick }: { item: MenuItem; onClick: () => void }) {
  const { addItem } = useCart()

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (item.addonGroups.length > 0) {
      onClick() // open modal if there are addons
    } else {
      addItem(item, 1, [], '')
    }
  }

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden cursor-pointer active:scale-[0.97] transition shadow-sm"
    >
      <div className="relative">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-32 object-cover" />
        ) : (
          <div className="w-full h-32 bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
            <span className="text-4xl">🍽️</span>
          </div>
        )}
        {item.tags.includes('bestseller') && (
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            BESTSELLER
          </span>
        )}
        {item.tags.includes('spicy') && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            🌶 SPICY
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="font-semibold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2">
          {item.name}
        </p>
        <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          <span>{item.preparationTime}m</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-orange-500 font-bold text-sm">{formatMYR(item.price)}</p>
          <button
            onClick={handleQuickAdd}
            className="w-7 h-7 bg-orange-500 hover:bg-orange-600 active:scale-90 rounded-lg flex items-center justify-center text-white transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
