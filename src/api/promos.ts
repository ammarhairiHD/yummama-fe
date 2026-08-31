import api from './client'
import * as mock from '../demo/mockApi'
import type { Promo } from '../types'

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

export const getPromos = () =>
  DEMO
    ? mock.demoGetPromos()
    : api.get<{ success: boolean; promos: Promo[] }>('/promos').then((r) => r.data)

export const validatePromo = (code: string, orderAmount: number) =>
  DEMO
    ? mock.demoValidatePromo(code, orderAmount)
    : api
        .post<{ success: boolean; promo: Promo; discount: number; message?: string }>(
          '/promos/validate',
          { code, orderAmount }
        )
        .then((r) => r.data)
