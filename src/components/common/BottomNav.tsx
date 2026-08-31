import { NavLink } from 'react-router-dom'
import { Home, UtensilsCrossed, ClipboardList, Tag, User } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import clsx from 'clsx'

interface Props {
  onCartClick: () => void
}

const NAV = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/menu', icon: UtensilsCrossed, label: 'Menu' },
  { to: '/orders', icon: ClipboardList, label: 'Orders' },
  { to: '/promo', icon: Tag, label: 'Promo' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function BottomNav({ onCartClick: _onCartClick }: Props) {
  const { totalItems } = useCart()
  void totalItems // available for cart badge on menu tab if desired

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 max-w-lg mx-auto">
      <div className="flex items-center">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex-1 flex flex-col items-center gap-0.5 py-2.5 transition relative',
                isActive
                  ? 'text-orange-500'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon className={clsx('w-5 h-5', isActive && 'stroke-[2.5px]')} />
                  {label === 'Menu' && totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {totalItems > 9 ? '9+' : totalItems}
                    </span>
                  )}
                </div>
                <span className={clsx('text-[10px] font-medium', isActive && 'font-semibold')}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
      {/* Safe area for iPhone home bar */}
      <div className="h-safe-area-inset-bottom bg-white dark:bg-gray-900" />
    </nav>
  )
}
