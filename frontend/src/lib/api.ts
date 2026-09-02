import { type Collection, type Product } from "@/types";
import { fallbackCollections, fallbackProducts } from "@/lib/fallback-data";
import { type ApiResponse, type AdminUser } from "@/lib/admin-types";
import {
  getCollections as getLocalCollections,
  getProducts as getLocalProducts,
  getFeaturedProducts as getLocalFeatured,
  getProduct as getLocalProduct,
  getProductsByCollection as getLocalProductsByCollection,
} from "@/lib/public-data";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/api";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export function normalizeCollection(raw: Record<string, unknown>): Collection {
  return {
    key: String(raw.key ?? ""),
    name: String(raw.name ?? ""),
    caption: String(raw.caption ?? ""),
    title: String(raw.title ?? ""),
    description: String(raw.description ?? ""),
    imageUrl: raw.image_url ? String(raw.image_url) : undefined,
    sortOrder: Number(raw.sort_order ?? 0),
    isActive: Boolean(raw.is_active ?? true),
  };
}

export function normalizeProduct(raw: Record<string, unknown>): Product {
  return {
    id: Number(raw.id ?? 0),
    name: String(raw.name ?? ""),
    slug: String(raw.slug ?? ""),
    sku: String(raw.sku ?? ""),
    subtitle: String(raw.subtitle ?? ""),
    description: String(raw.description ?? ""),
    price: Number(raw.price ?? 0),
    material: String(raw.material ?? ""),
    size: String(raw.size ?? ""),
    stockQty: Number(raw.stock_qty ?? 0),
    isActive: Boolean(raw.is_active ?? true),
    isFeatured: Boolean(raw.is_featured ?? false),
    imageUrl: raw.image_url ? String(raw.image_url) : "",
    displayImageUrl: raw.display_image_url
      ? String(raw.display_image_url)
      : raw.image_url
        ? String(raw.image_url)
        : "",
    colors: Array.isArray(raw.colors) ? (raw.colors as ColorOption[]) : [],
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : [],
    collections: Array.isArray(raw.collections)
      ? (raw.collections as Record<string, unknown>[]).map(normalizeCollection)
      : [],
    category: raw.category ? normalizeCategory(raw.category as Record<string, unknown>) : null,
    createdAt: String(raw.created_at ?? ""),
  };
}

function normalizeCategory(raw: Record<string, unknown>): { name: string; slug: string } {
  return {
    name: String(raw.name ?? ""),
    slug: String(raw.slug ?? ""),
  };
}

export async function getCollections(): Promise<Collection[]> {
  try {
    return await getLocalCollections();
  } catch {
    return fallbackCollections;
  }
}

export async function getProducts(params?: Record<string, string>): Promise<Product[]> {
  try {
    return await getLocalProducts({
      isFeatured: params?.is_featured === "true" ? true : undefined,
      collection: params?.collection,
      pageSize: params?.page_size ? Number(params.page_size) : undefined,
    });
  } catch {
    return fallbackProducts;
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    return await getLocalFeatured();
  } catch {
    return fallbackProducts;
  }
}

export async function getProduct(slug: string): Promise<Product | null> {
  try {
    return await getLocalProduct(slug);
  } catch {
    return null;
  }
}

export async function getProductsByCollection(collection: string): Promise<Product[]> {
  try {
    return await getLocalProductsByCollection(collection);
  } catch {
    return fallbackProducts;
  }
}

export async function createOrder(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  try {
    const res = await fetch("/api/public/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `API request failed: ${res.status}`);
    }
    return await res.json();
  } catch {
    throw new Error("Failed to create order");
  }
}

export async function createAddress(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  try {
    const res = await fetch("/api/public/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `API request failed: ${res.status}`);
    }
    return await res.json();
  } catch {
    throw new Error("Failed to create address");
  }
}

export async function getOrderSummary(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  try {
    const res = await fetch("/api/public/orders/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `API request failed: ${res.status}`);
    }
    return await res.json();
  } catch {
    throw new Error("Failed to get order summary");
  }
}

export async function getOrderByNumber(orderNumber: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`/api/public/orders/${encodeURIComponent(orderNumber)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  roleId?: string;
  isActive?: boolean;
  avatar?: string;
  password?: string;
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<AdminUser> {
  const res = await fetch(`/admin/api/users/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  let json: ApiResponse<AdminUser>;
  try {
    json = (await res.json()) as ApiResponse<AdminUser>;
  } catch {
    throw new Error(`Failed to update user: ${res.status} ${res.statusText}`);
  }
  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.error || `Failed to update user: ${res.status} ${res.statusText}`);
  }
  return json.data;
}

interface ColorOption {
  name: string;
  hex: string;
}
