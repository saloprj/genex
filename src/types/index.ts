import type { Product, Order, OrderItem } from '@prisma/client'

export type { Product, Order, OrderItem }

export type OrderWithItems = Order & {
  items: OrderItem[]
}

export interface CartItem {
  id: string
  name: string
  slug: string
  price: number
  image: string | null
  quantity: number
  productCode: string
}

export interface ShippingInfo {
  name: string
  email: string
  address1: string
  address2?: string
  city: string
  state?: string
  postalCode: string
  country: string
}
