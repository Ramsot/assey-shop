export interface ColorOption {
  name: string;
  hex: string;
}

export interface Collection {
  key: string;
  name: string;
  caption: string;
  title: string;
  description: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Category {
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  subtitle: string;
  description: string;
  price: number;
  material: string;
  size: string;
  stockQty: number;
  isActive: boolean;
  isFeatured: boolean;
  imageUrl: string;
  displayImageUrl: string;
  colors: ColorOption[];
  tags: string[];
  collections: Collection[];
  category: Category | null;
  createdAt: string;
}

export interface CartItem {
  sku: string;
  name: string;
  price: number;
  color: string;
  quantity: number;
  imageUrl: string;
  material?: string;
}

export interface Cart {
  items: CartItem[];
  count: number;
  total: number;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  address1: string;
  address2?: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface OrderSummary {
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
}

export interface Order {
  orderNumber: string;
  email: string;
  total: number;
  status: string;
  createdAt: string;
  notes?: string;
}
