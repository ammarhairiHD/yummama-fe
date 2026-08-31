import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Package, ChevronRight, Star, Clock, Flame } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApi } from '../../hooks/useApi'
import { getAds } from '../../api/menu'
import { getMenuItems } from '../../api/menu'
import { formatMYR } from '../../utils/format'
import clsx from 'clsx'
import type { Ad, MenuItem } from '../../types'

type FulfillmentType = 'pickup' | 'delivery'

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [fulfillment, setFulfillment] = useState<FulfillmentType>('pickup')
  const [activeSlide, setActiveSlide] = useState(0)
  const slideRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { data: adsData } = useApi(() => getAds(), [])
  const { data: featuredData } = useApi(() => getMenuItems({ featured: 'true' }), [])

  const ads: Ad[] = adsData?.ads ?? []
  const featured: MenuItem[] = featuredData?.items ?? []

  // Auto-slide
  useEffect(() => {
    if (ads.length <= 1) return
    slideRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % ads.length)
    }, 3500)
    return () => { if (slideRef.current) clearInterval(slideRef.current) }
  }, [ads.length])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-950 min-h-full">
      {/* Header */}
      <div className="bg-orange-500 px-5 pt-12 pb-6">
        <p className="text-orange-100 text-sm">{greeting()},</p>
        <h1 className="text-white text-xl font-bold mt-0.5">{user?.name?.split(' ')[0]} 👋</h1>

        {/* Fulfillment toggle */}
        <div className="mt-4 bg-orange-600/40 rounded-2xl p-1 flex gap-1">
          {(['pickup', 'delivery'] as FulfillmentType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFulfillment(type)}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition',
                fulfillment === type
                  ? 'bg-white text-orange-500 shadow'
                  : 'text-orange-100 hover:bg-orange-600/30'
              )}
            >
              {type === 'pickup' ? (
                <Package className="w-4 h-4" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {fulfillment === 'delivery' && (
          <div className="mt-3 flex items-center gap-2 bg-orange-600/30 rounded-xl px-3 py-2">
            <MapPin className="w-4 h-4 text-orange-200 shrink-0" />
            <p className="text-orange-100 text-xs truncate">
              {user?.address ?? 'Add delivery address in your profile'}
            </p>
          </div>
        )}
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Ad Banner Carousel */}
        {ads.length > 0 && (
          <div className="relative">
            <div className="overflow-hidden rounded-2xl">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${activeSlide * 100}%)` }}
              >
                {ads.map((ad) => (
                  <div key={ad._id} className="min-w-full relative">
                    <img
                      src={ad.image}
                      alt={ad.title}
                      className="w-full h-44 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white font-bold text-base leading-tight">{ad.title}</p>
                      {ad.subtitle && (
                        <p className="text-white/80 text-xs mt-0.5">{ad.subtitle}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Dots */}
            {ads.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-2.5">
                {ads.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className={clsx(
                      'rounded-full transition-all',
                      i === activeSlide
                        ? 'w-5 h-2 bg-orange-500'
                        : 'w-2 h-2 bg-gray-300 dark:bg-gray-600'
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => navigate('/wallet')}
            className="bg-white dark:bg-gray-900 rounded-2xl p-4 flex items-center gap-3 cursor-pointer active:scale-95 transition shadow-sm"
          >
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <span className="text-lg">💰</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Yummama Wallet</p>
              <p className="text-base font-bold text-gray-900 dark:text-white">
                {formatMYR(user?.walletBalance ?? 0)}
              </p>
            </div>
          </div>

          <div
            onClick={() => navigate('/profile')}
            className="bg-white dark:bg-gray-900 rounded-2xl p-4 flex items-center gap-3 cursor-pointer active:scale-95 transition shadow-sm"
          >
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
              <span className="text-lg">⭐</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Yummama Points</p>
              <p className="text-base font-bold text-gray-900 dark:text-white">
                {user?.points ?? 0} pts
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-gray-900 dark:text-white font-bold text-base">Quick Order</h2>
            <button
              onClick={() => navigate('/menu')}
              className="flex items-center gap-1 text-orange-500 text-sm font-medium"
            >
              See all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: '🍚', label: 'Rice', cat: 'rice-noodles' },
              { icon: '🍖', label: 'Grilled', cat: 'grilled-bbq' },
              { icon: '🥤', label: 'Drinks', cat: 'drinks' },
              { icon: '🍟', label: 'Snacks', cat: 'snacks-sides' },
              { icon: '🍲', label: 'Soups', cat: 'soups-stews' },
              { icon: '🍰', label: 'Desserts', cat: 'desserts' },
            ].map(({ icon, label }) => (
              <button
                key={label}
                onClick={() => navigate('/menu')}
                className="bg-white dark:bg-gray-900 rounded-2xl p-3 flex flex-col items-center gap-1.5 active:scale-95 transition shadow-sm"
              >
                <span className="text-2xl">{icon}</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured items */}
        {featured.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                <h2 className="text-gray-900 dark:text-white font-bold text-base">Popular Now</h2>
              </div>
              <button
                onClick={() => navigate('/menu')}
                className="flex items-center gap-1 text-orange-500 text-sm font-medium"
              >
                See all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {featured.slice(0, 4).map((item) => (
                <FeaturedCard key={item._id} item={item} onClick={() => navigate('/menu')} />
              ))}
            </div>
          </div>
        )}

        {/* Store info */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3">Yummama Bites</h3>
          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span>4.8 rating · 1.2k+ orders</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>Open daily · 10:00 AM – 10:00 PM</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>Jalan Ampang, Kuala Lumpur</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeaturedCard({ item, onClick }: { item: MenuItem; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-900 rounded-2xl p-3 flex gap-3 items-center cursor-pointer active:scale-[0.98] transition shadow-sm"
    >
      {item.image ? (
        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
      ) : (
        <div className="w-16 h-16 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
          <span className="text-2xl">🍽️</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{item.name}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-orange-500 font-bold text-sm">{formatMYR(item.price)}</p>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            {item.preparationTime}m
          </div>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
    </div>
  )
}
