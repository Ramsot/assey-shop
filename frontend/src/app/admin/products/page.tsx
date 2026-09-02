"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, Search, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ProductItem {
  id: string; name: string; sku: string; price: number; stockQty: number;
  isActive: boolean; isFeatured: boolean;
  images: { url: string; isPrimary: boolean }[];
  category: { name: string } | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchProducts = useCallback(async (q?: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: "1", pageSize: "50" });
      if (q) params.set("search", q);
      const json = await apiFetch<{ success: boolean; data: ProductItem[] }>(`/admin/api/products?${params}`, { signal: controller.signal });
      if (json.success) setProducts(json.data);
    } catch {
      // Ignore abort errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(debouncedSearch); }, [fetchProducts, debouncedSearch]);

  useEffect(() => () => { abortRef.current?.abort(); }, []);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    setDeletingId(id);
    try {
      await apiFetch(`/admin/api/products/${id}`, { method: "DELETE" });
      fetchProducts(debouncedSearch);
    } catch {
      // handle error
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-medium text-ink">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">{products.length} products</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Add Product
          </Link>
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
        <input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-border bg-paper p-12 text-center text-muted-foreground">No products found.</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-paper">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-stone overflow-hidden">
                        {p.images.length > 0 && <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div>
                        <Link href={`/admin/products/${p.id}/edit`} className="font-medium text-ink hover:underline">{p.name}</Link>
                        {p.category && <p className="text-xs text-muted-foreground">{p.category.name}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.sku}</td>
                  <td className="px-4 py-3 font-medium text-ink">TSh {p.price.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${p.stockQty === 0 ? "text-red-600" : p.stockQty <= 3 ? "text-yellow-600" : "text-green-600"}`}>
                      {p.stockQty === 0 ? "Out" : p.stockQty}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {p.isActive && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">Active</span>}
                      {p.isFeatured && <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-medium text-gold">Featured</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/products/${p.id}/edit`} className="text-xs text-muted-foreground hover:text-ink">Edit</Link>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(p.id)} disabled={deletingId === p.id}>
                        {deletingId === p.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                        ) : (
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                        )}
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
