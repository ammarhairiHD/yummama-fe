import api from './client'
import * as mock from '../demo/mockApi'
import type { Order, CartItem, FulfillmentType } from '../types'

const DEMO = import.meta.env.VITE_DEMO_MODE === 'true'

interface PlaceOrderPayload {
  items: {
    menuItem: string
    name: string
    price: number
    quantity: number
    selectedAddons: { groupName: string; addonName: string; price: number }[]
    note: string
  }[]
  fulfillmentType: FulfillmentType
  deliveryAddress?: string
  promoCode?: string
  paymentMethod: 'wallet' | 'online'
  note?: string
}

export const getOrders = (status?: string) =>
  DEMO
    ? mock.demoGetOrders(status)
    : api
        .get<{ success: boolean; orders: Order[] }>('/orders', { params: status ? { status } : {} })
        .then((r) => r.data)

export const getOrder = (id: string) =>
  DEMO
    ? mock.demoGetOrder(id)
    : api.get<{ success: boolean; order: Order }>(`/orders/${id}`).then((r) => r.data)

export const placeOrder = (payload: PlaceOrderPayload) =>
  DEMO
    ? mock.demoPlaceOrder(payload)
    : api.post<{ success: boolean; order: Order }>('/orders', payload).then((r) => r.data)

export const cancelOrder = (id: string) =>
  DEMO
    ? mock.demoCancelOrder(id)
    : api.patch<{ success: boolean; order: Order }>(`/orders/${id}/cancel`).then((r) => r.data)

export const cartToOrderItems = (cartItems: CartItem[]) =>
  cartItems.map((ci) => ({
    menuItem: ci.menuItem._id,
    name: ci.menuItem.name,
    price: ci.menuItem.price,
    quantity: ci.quantity,
    selectedAddons: ci.selectedAddons,
    note: ci.note,
  }))
