import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { CartProvider } from './context/CartContext'

// Layout / guard components
import ProtectedRoute from './components/layout/ProtectedRoute'
import AdminProtectedRoute from './components/layout/AdminProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import AdminLayout from './components/layout/AdminLayout'

// Customer pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import HomePage from './pages/home/HomePage'
import MenuPage from './pages/menu/MenuPage'
import OrdersPage from './pages/orders/OrdersPage'
import OrderDetailPage from './pages/orders/OrderDetailPage'
import PromoPage from './pages/promo/PromoPage'
import ProfilePage from './pages/profile/ProfilePage'
import WalletPage from './pages/wallet/WalletPage'
import CheckoutPage from './pages/menu/CheckoutPage'

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import AdminProductsPage from './pages/admin/AdminProductsPage'
import AdminPromosPage from './pages/admin/AdminPromosPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminProfilePage from './pages/admin/AdminProfilePage'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  borderRadius: '12px',
                  fontWeight: 500,
                },
              }}
            />
            <Routes>
              {/* ── Public ── */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* ── Customer routes (requires auth + role=customer) ── */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/menu" element={<MenuPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/orders/:id" element={<OrderDetailPage />} />
                  <Route path="/promo" element={<PromoPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/wallet" element={<WalletPage />} />
                </Route>
              </Route>

              {/* ── Admin routes (requires auth + role=admin) ── */}
              <Route path="/admin" element={<AdminProtectedRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="promos" element={<AdminPromosPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="profile" element={<AdminProfilePage />} />
                </Route>
              </Route>

              {/* ── Fallback ── */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
