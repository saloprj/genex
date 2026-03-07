import type { Product, Order, OrderItem, ProductVariant } from '@prisma/client'

export type { Product, Order, OrderItem, ProductVariant }

export type OrderWithItems = Order & {
  items: OrderItem[]
}

export type ProductWithVariants = Product & { variants: ProductVariant[] }

export interface CartItem {
  id: string          // cartKey: product.id OR "${product.id}-${variant.id}"
  productId: string   // always the actual DB product.id
  name: string
  slug: string
  price: number
  image: string | null
  quantity: number
  productCode: string
  variantId?: string
  variantLabel?: string
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
