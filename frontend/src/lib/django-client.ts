const DJANGO_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api";

interface DjangoProduct {
  id: number;
  name: string;
  slug: string;
  sku: string;
  subtitle: string;
  price: string;
  description: string;
  material: string;
  size: string;
  stock_qty: number;
  is_active: boolean;
  is_featured: boolean;
  image_url: string;
  display_image_url: string;
  colors: { name: string; hex: string }[];
  tags: string[];
  category: { name: string; slug: string } | null;
  collections: { key: string; name: string }[];
  created_at: string;
  updated_at: string;
}

interface DjangoOrder {
  order_number: string;
  email: string;
  status: string;
  payment_status: string;
  subtotal: string;
  shipping_cost: string;
  tax: string;
  total: string;
  shipping_method: string;
  tracking_number: string;
  tracking_url: string;
  notes: string;
  created_at: string;
  shipping_address: {
    first_name: string;
    last_name: string;
    email: string;
    address1: string;
    address2: string;
    city: string;
    postal_code: string;
    country: string;
    phone: string;
  } | null;
  items: {
    product_sku: string;
    product_name: string;
    product_price: string;
    color: string;
    quantity: number;
    line_total: string;
  }[];
}

export async function fetchDjango(endpoint: string, options?: RequestInit) {
  const url = `${DJANGO_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getDjangoProducts(params?: Record<string, string>) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  const data = await fetchDjango(`/catalog/products/${qs}`);
  return data as { results: DjangoProduct[]; count: number } | null;
}

export async function getDjangoProduct(slug: string) {
  const data = await fetchDjango(`/catalog/products/${slug}/`);
  return data as DjangoProduct | null;
}

export async function getDjangoOrders(params?: Record<string, string>) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  const data = await fetchDjango(`/checkout/orders/${qs}`);
  return data as { results: DjangoOrder[]; count: number } | null;
}

export async function getDjangoOrder(orderNumber: string) {
  const data = await fetchDjango(`/checkout/orders/${orderNumber}/`);
  return data as DjangoOrder | null;
}

export async function getDjangoCollections() {
  const data = await fetchDjango("/catalog/collections/");
  return data as { key: string; name: string; caption: string; title: string; description: string; image_url: string }[] | null;
}

export type { DjangoProduct, DjangoOrder };

export function mapDjangoProduct(d: DjangoProduct) {
  return {
    id: String(d.id),
    name: d.name,
    slug: d.slug,
    sku: d.sku,
    subtitle: d.subtitle,
    price: parseFloat(d.price),
    description: d.description,
    material: d.material,
    size: d.size,
    stockQty: d.stock_qty,
    isActive: d.is_active,
    isFeatured: d.is_featured,
    imageUrl: d.display_image_url || d.image_url,
    colors: d.colors,
    tags: d.tags,
    category: d.category?.name || "",
    collections: d.collections.map((c) => c.name),
    createdAt: d.created_at,
  };
}

export function mapDjangoOrder(d: DjangoOrder) {
  return {
    orderNumber: d.order_number,
    email: d.email,
    status: d.status,
    paymentStatus: d.payment_status,
    subtotal: parseFloat(d.subtotal),
    shippingCost: parseFloat(d.shipping_cost),
    tax: parseFloat(d.tax),
    total: parseFloat(d.total),
    shippingMethod: d.shipping_method,
    trackingNumber: d.tracking_number,
    trackingUrl: d.tracking_url,
    notes: d.notes,
    customer: d.shipping_address
      ? { name: `${d.shipping_address.first_name} ${d.shipping_address.last_name}`, email: d.shipping_address.email, phone: d.shipping_address.phone }
      : null,
    items: d.items.map((i) => ({
      productSku: i.product_sku,
      productName: i.product_name,
      productPrice: parseFloat(i.product_price),
      color: i.color,
      quantity: i.quantity,
      lineTotal: parseFloat(i.line_total),
    })),
    createdAt: d.created_at,
  };
}
