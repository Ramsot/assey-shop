"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { ImageUploader } from "@/components/admin/image-uploader";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<{ url: string; altText?: string | null; isPrimary?: boolean; sortOrder?: number }[]>([]);
  const [form, setForm] = useState({
    name: "", sku: "", subtitle: "", description: "", price: "",
    compareAtPrice: "", costPrice: "", material: "", size: "",
    stockQty: "0", isActive: true, isFeatured: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/admin/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        const productId = json.data.id;
        if (images.length > 0) {
          await Promise.all(
            images.map((img, i) =>
              fetch(`/admin/api/products/${productId}/images`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...img, isPrimary: i === 0, sortOrder: i }),
              })
            )
          );
        }
        router.push("/admin/products");
        router.refresh();
      } else {
        alert(json.error || "Failed to create product");
      }
    } catch { alert("Error creating product"); }
    finally { setLoading(false); }
  };

  const input = (label: string, key: string, opts?: { required?: boolean; type?: string; span?: boolean; step?: string }) => (
    <div className={opts?.span ? "sm:col-span-2" : ""}>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">{label}{opts?.required && " *"}</label>
      <input type={opts?.type || "text"} step={opts?.step} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required={opts?.required}
        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
    </div>
  );

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="rounded-xl p-2 text-muted-foreground hover:bg-accent transition-colors">
          <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
        </Link>
        <div>
          <h1 className="font-serif text-3xl font-medium text-ink">New Product</h1>
          <p className="text-sm text-muted-foreground">Add a new product to your catalog</p>
        </div>
      </div>

      <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit}
        className="rounded-xl border border-border bg-paper p-6 space-y-6">
        
        <ImageUploader images={images} onImagesChange={setImages} />

        <div className="grid gap-6 sm:grid-cols-2">
          {input("Name", "name", { required: true, span: true })}
          {input("SKU", "sku")}
          {input("Price", "price", { required: true, type: "number", step: "0.01" })}
          {input("Compare At Price", "compareAtPrice", { type: "number", step: "0.01" })}
          {input("Cost Price", "costPrice", { type: "number", step: "0.01" })}
          {input("Stock Qty", "stockQty", { type: "number" })}
          {input("Material", "material")}
          {input("Size", "size")}
          {input("Subtitle", "subtitle")}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Description</label>
          <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold" />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded border-border text-ink focus:ring-gold" />
            <span className="text-sm text-ink">Active</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
              className="rounded border-border text-ink focus:ring-gold" />
            <span className="text-sm text-ink">Featured</span>
          </label>
        </div>

        <div className="flex gap-3 pt-4 border-t border-border">
          <button type="submit" disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-50 transition-colors">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} /> : <Save className="h-4 w-4" strokeWidth={1.5} />}
            {loading ? "Saving..." : "Save Product"}
          </button>
          <Link href="/admin/products"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-2.5 text-sm font-medium text-ink hover:bg-accent transition-colors">
            Cancel
          </Link>
        </div>
      </motion.form>
    </div>
  );
}
