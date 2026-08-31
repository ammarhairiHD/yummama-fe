import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { User } from '../types'
import * as authApi from '../api/auth'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { name: string; email: string; phone: string; password: string; referralCode?: string }) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('ymm_token')
    const storedUser = localStorage.getItem('ymm_user')
    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('ymm_token')
        localStorage.removeItem('ymm_user')
      }
    }
    setIsLoading(false)
  }, [])

  const persist = (token: string, user: User) => {
    localStorage.setItem('ymm_token', token)
    localStorage.setItem('ymm_user', JSON.stringify(user))
    setToken(token)
    setUser(user)
  }

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password })
    persist(res.token, res.user)
    // Caller is responsible for redirect; role is available on res.user
  }

  const register = async (data: { name: string; email: string; phone: string; password: string; referralCode?: string }) => {
    const res = await authApi.register(data)
    persist(res.token, res.user)
  }

  const logout = () => {
    localStorage.removeItem('ymm_token')
    localStorage.removeItem('ymm_user')
    setToken(null)
    setUser(null)
  }

  const updateUser = (updated: User) => {
    setUser(updated)
    localStorage.setItem('ymm_user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, isAuthenticated: !!token, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
