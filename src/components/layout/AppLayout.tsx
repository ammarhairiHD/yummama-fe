import { Outlet } from 'react-router-dom'
import BottomNav from '../common/BottomNav'
import CartDrawer from '../common/CartDrawer'
import { useState } from 'react'

export default function AppLayout() {
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Main content area with bottom padding for navbar */}
      <main className="flex-1 pb-20 max-w-lg mx-auto w-full">
        <Outlet context={{ openCart: () => setCartOpen(true) }} />
      </main>

      <BottomNav onCartClick={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
