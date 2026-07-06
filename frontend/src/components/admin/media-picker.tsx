"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon, Search, Loader2 } from "lucide-react";

interface MediaItem {
  id: string;
  name: string;
  filename: string;
  url: string;
  type: string;
  mimeType: string | null;
  size: number | null;
  width: number | null;
  height: number | null;
}

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (item: MediaItem) => void;
  multiple?: boolean;
}

export default function MediaPicker({ open, onClose, onSelect, multiple }: MediaPickerProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = async (q?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: "image" });
      if (q) params.set("search", q);
      const res = await fetch(`/admin/api/media?${params}`);
      const json = await res.json();
      if (json.success) setItems(json.data.items || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchItems();
  }, [open]);

  useEffect(() => {
    const timer = setTimeout(() => fetchItems(search || undefined), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/admin/api/media/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success) fetchItems();
    } catch {} finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl rounded-2xl border border-border bg-paper shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="font-serif text-lg font-medium text-ink">Select Media</h2>
              <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent transition-colors">
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex items-center gap-3 border-b border-border px-6 py-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                <input
                  type="text" placeholder="Search images..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-border bg-accent py-2 pl-10 pr-4 text-sm text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
              <div>
                <input ref={fileInputRef} type="file" onChange={handleUpload} className="hidden" accept="image/*" />
                <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/90 disabled:opacity-50 transition-all active:scale-95">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} /> : <Upload className="h-4 w-4" strokeWidth={1.5} />}
                  Upload
                </button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" strokeWidth={1.5} />
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <ImageIcon className="mb-2 h-8 w-8" strokeWidth={1} />
                  <p className="text-sm">No images found</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onSelect(item)}
                      className="group relative aspect-square rounded-xl border border-border bg-accent overflow-hidden hover:ring-2 hover:ring-gold transition-all"
                    >
                      <img src={item.url} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <p className="text-[10px] text-white truncate">{item.filename}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
