import api from './client'
import * as mock from '../demo/mockApi'
import type { Transaction } from '../types'

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

interface WalletResponse {
  success: boolean
  walletBalance: number
  points: number
  transactions: Transaction[]
  topUpAmounts: number[]
}

export const getWallet = () =>
  DEMO
    ? mock.demoGetWallet()
    : api.get<WalletResponse>('/wallet').then((r) => r.data)

export const topUp = (amount: number) =>
  DEMO
    ? mock.demoTopUp(amount)
    : api
        .post<{ success: boolean; message: string; walletBalance: number }>('/wallet/topup', { amount })
        .then((r) => r.data)

export const getTransactions = (page = 1, limit = 20) =>
  DEMO
    ? mock.demoGetWallet().then((r) => ({ ...r, pagination: { page, limit, total: r.transactions.length, pages: 1 } }))
    : api
        .get<{ success: boolean; transactions: Transaction[]; pagination: unknown }>(
          '/wallet/transactions',
          { params: { page, limit } }
        )
        .then((r) => r.data)
