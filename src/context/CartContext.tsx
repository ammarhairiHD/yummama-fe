import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { CartItem, MenuItem, SelectedAddon } from '../types'

interface CartContextType {
  items: CartItem[]
  totalItems: number
  subtotal: number
  addItem: (item: MenuItem, qty: number, addons: SelectedAddon[], note: string) => void
  removeItem: (cartId: string) => void
  updateQty: (cartId: string, qty: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function calcItemTotal(item: MenuItem, addons: SelectedAddon[], qty: number): number {
  const addonTotal = addons.reduce((s, a) => s + a.price, 0)
  return (item.price + addonTotal) * qty
}

function makeCartId(itemId: string, addons: SelectedAddon[]): string {
  const addonKey = addons.map((a) => `${a.groupName}:${a.addonName}`).sort().join('|')
  return `${itemId}__${addonKey}`
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = useCallback(
    (menuItem: MenuItem, qty: number, selectedAddons: SelectedAddon[], note: string) => {
      const cartId = makeCartId(menuItem._id, selectedAddons)
      setItems((prev) => {
        const existing = prev.find((ci) => ci.cartId === cartId)
        if (existing) {
          return prev.map((ci) =>
            ci.cartId === cartId
              ? {
                  ...ci,
                  quantity: ci.quantity + qty,
                  itemTotal: calcItemTotal(menuItem, selectedAddons, ci.quantity + qty),
                }
              : ci
          )
        }
        return [
          ...prev,
          {
            cartId,
            menuItem,
            quantity: qty,
            selectedAddons,
            itemTotal: calcItemTotal(menuItem, selectedAddons, qty),
            note,
          },
        ]
      })
    },
    []
  )

  const removeItem = useCallback((cartId: string) => {
    setItems((prev) => prev.filter((ci) => ci.cartId !== cartId))
  }, [])

  const updateQty = useCallback((cartId: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((ci) => ci.cartId !== cartId))
      return
    }
    setItems((prev) =>
      prev.map((ci) =>
        ci.cartId === cartId
          ? { ...ci, quantity: qty, itemTotal: calcItemTotal(ci.menuItem, ci.selectedAddons, qty) }
          : ci
      )
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = items.reduce((s, ci) => s + ci.quantity, 0)
  const subtotal = items.reduce((s, ci) => s + ci.itemTotal, 0)

  return (
    <CartContext.Provider value={{ items, totalItems, subtotal, addItem, removeItem, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
