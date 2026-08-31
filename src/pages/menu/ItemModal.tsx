import { useState, useEffect } from 'react'
import { X, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { formatMYR } from '../../utils/format'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import type { MenuItem, SelectedAddon } from '../../types'

interface Props {
  item: MenuItem
  onClose: () => void
}

export default function ItemModal({ item, onClose }: Props) {
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)
  const [note, setNote] = useState('')
  // Map: groupName -> list of selected addon names
  const [selections, setSelections] = useState<Record<string, string[]>>({})

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const toggleAddon = (groupName: string, addonName: string, maxSelect: number) => {
    setSelections((prev) => {
      const current = prev[groupName] ?? []
      if (current.includes(addonName)) {
        return { ...prev, [groupName]: current.filter((n) => n !== addonName) }
      }
      if (current.length >= maxSelect) {
        // Replace last if single-select
        if (maxSelect === 1) return { ...prev, [groupName]: [addonName] }
        toast.error(`Max ${maxSelect} selections for ${groupName}`)
        return prev
      }
      return { ...prev, [groupName]: [...current, addonName] }
    })
  }

  const buildSelectedAddons = (): SelectedAddon[] => {
    const result: SelectedAddon[] = []
    for (const group of item.addonGroups) {
      const selected = selections[group.groupName] ?? []
      for (const addonName of selected) {
        const addon = group.addons.find((a) => a.name === addonName)
        if (addon) {
          result.push({ groupName: group.groupName, addonName: addon.name, price: addon.price })
        }
      }
    }
    return result
  }

  const addonTotal = buildSelectedAddons().reduce((s, a) => s + a.price, 0)
  const total = (item.price + addonTotal) * qty

  const handleAdd = () => {
    // Check required addons
    for (const group of item.addonGroups) {
      const isRequired = group.addons.some((a) => a.isRequired)
      if (isRequired && !(selections[group.groupName]?.length)) {
        toast.error(`Please select an option for ${group.groupName}`)
        return
      }
    }
    addItem(item, qty, buildSelectedAddons(), note)
    toast.success(`${item.name} added to cart!`)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60"
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-3xl max-w-lg mx-auto overflow-y-auto"
        style={{ maxHeight: '90vh' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3">
          <div className="w-10 h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Image */}
        {item.image && (
          <img src={item.image} alt={item.name} className="w-full h-52 object-cover mt-3" />
        )}

        <div className="px-5 py-4">
          {/* Item info */}
          <div className="mb-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{item.name}</h2>
              <p className="text-orange-500 font-bold text-lg shrink-0">{formatMYR(item.price)}</p>
            </div>
            {item.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Addon groups */}
          {item.addonGroups.map((group) => {
            const selected = selections[group.groupName] ?? []
            const hasRequired = group.addons.some((a) => a.isRequired)
            return (
              <div key={group.groupName} className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {group.groupName}
                  </h3>
                  {hasRequired && (
                    <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
                      Required
                    </span>
                  )}
                  {!hasRequired && (
                    <span className="text-xs text-gray-400">
                      Pick up to {group.maxSelect}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {group.addons.map((addon) => {
                    const isSelected = selected.includes(addon.name)
                    return (
                      <button
                        key={addon.name}
                        onClick={() => toggleAddon(group.groupName, addon.name, group.maxSelect)}
                        className={clsx(
                          'w-full flex items-center justify-between px-4 py-3 rounded-xl border transition',
                          isSelected
                            ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20'
                            : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={clsx(
                              'w-5 h-5 rounded-full border-2 flex items-center justify-center transition',
                              isSelected
                                ? 'border-orange-500 bg-orange-500'
                                : 'border-gray-300 dark:border-gray-600'
                            )}
                          >
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white font-medium">
                            {addon.name}
                          </span>
                        </div>
                        {addon.price > 0 && (
                          <span className="text-sm text-orange-500 font-semibold">
                            +{formatMYR(addon.price)}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Note */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Special Instructions
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. no onions, less spicy…"
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition resize-none"
            />
          </div>
        </div>

        {/* Sticky footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-5 py-4">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-6 h-6 flex items-center justify-center text-gray-700 dark:text-gray-300"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-base font-bold text-gray-900 dark:text-white w-6 text-center">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-6 h-6 flex items-center justify-center text-gray-700 dark:text-gray-300"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleAdd}
              className="flex-1 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-semibold rounded-xl py-3 flex items-center justify-between px-4 transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart</span>
              <span>{formatMYR(total)}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
