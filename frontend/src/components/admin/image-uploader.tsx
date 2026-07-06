"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon, Star, GripVertical, Loader2 } from "lucide-react";

interface ProductImage {
  id?: string;
  url: string;
  altText?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
}

interface ImageUploaderProps {
  productId?: string;
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
}

export function ImageUploader({ productId, images, onImagesChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/admin/api/upload", { method: "POST", body: formData });
        const json = await res.json();
        if (json.success) {
          const newImage: ProductImage = {
            url: json.data.url,
            altText: "",
            isPrimary: images.length === 0,
            sortOrder: images.length,
          };
          onImagesChange([...images, newImage]);

          if (productId) {
            await fetch(`/admin/api/products/${productId}/images`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newImage),
            });
          }
        }
      }
    } catch {}
    setUploading(false);
    e.target.value = "";
  }, [images, onImagesChange, productId]);

  const removeImage = useCallback(async (index: number) => {
    const img = images[index];
    const updated = images.filter((_, i) => i !== index);
    if (index === 0 && updated.length > 0) updated[0].isPrimary = true;
    onImagesChange(updated);

    if (productId && img.id) {
      await fetch(`/admin/api/products/${productId}/images`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId: img.id }),
      });
    }
  }, [images, onImagesChange, productId]);

  const setPrimary = useCallback((index: number) => {
    const updated = images.map((img, i) => ({ ...img, isPrimary: i === index }));
    onImagesChange(updated);
  }, [images, onImagesChange]);

  const updateAltText = useCallback((index: number, altText: string) => {
    const updated = images.map((img, i) => i === index ? { ...img, altText } : img);
    onImagesChange(updated);
  }, [images, onImagesChange]);

  return (
    <div className="space-y-4">
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-ink">Images</label>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <AnimatePresence mode="popLayout">
          {images.map((img, i) => (
            <motion.div
              key={img.url}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative aspect-square rounded-xl border border-border bg-background overflow-hidden"
            >
              <img
                src={img.url}
                alt={img.altText || ""}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />

              {img.isPrimary && (
                <div className="absolute top-2 left-2 rounded-lg bg-gold px-2 py-0.5 text-[10px] font-semibold text-paper">
                  Primary
                </div>
              )}

              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!img.isPrimary && (
                  <button
                    type="button"
                    onClick={() => setPrimary(i)}
                    className="rounded-lg bg-paper/90 p-1.5 text-muted-foreground hover:text-gold transition-colors"
                    title="Set as primary"
                  >
                    <Star className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="rounded-lg bg-paper/90 p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                  title="Remove image"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </div>

              <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <input
                  type="text"
                  value={img.altText || ""}
                  onChange={(e) => updateAltText(i, e.target.value)}
                  placeholder="Alt text..."
                  className="w-full rounded-md bg-white/90 px-2 py-1 text-[11px] text-ink outline-none placeholder:text-muted-foreground/60"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <label className="relative flex aspect-square cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border hover:border-gold hover:bg-accent/50 transition-all">
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" strokeWidth={1.5} />
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
              <Upload className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-[11px] font-medium">Upload</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            disabled={uploading}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Upload PNG, JPG or WEBP. Click <Star className="inline h-3 w-3" strokeWidth={1.5} /> to set primary image.
      </p>
    </div>
  );
}
