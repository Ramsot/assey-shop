"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Trash2, Star } from "lucide-react";

interface Review {
  id: string;
  author: string;
  email: string;
  rating: number;
  content: string;
  status: string;
  product: { name: string } | null;
  createdAt: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReviews = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/admin/api/reviews");
      const json = await res.json();
      if (json.success) setReviews(json.data);
      else setError(json.error || "Failed to load");
    } catch {
      setError("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleApprove = async (id: string) => {
    await fetch(`/admin/api/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved" }),
    });
    fetchReviews();
  };

  const handleReject = async (id: string) => {
    await fetch(`/admin/api/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "rejected" }),
    });
    fetchReviews();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    await fetch(`/admin/api/reviews/${id}`, { method: "DELETE" });
    fetchReviews();
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} className={`h-3.5 w-3.5 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} strokeWidth={1.5} />
    ));
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      approved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.03 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-medium text-ink">Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage customer reviews</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-xl border border-border bg-paper overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Author</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Rating</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Content</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Loading...</td></tr>
              ) : reviews.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No reviews found</td></tr>
              ) : (
                reviews.map((r, i) => (
                  <motion.tr key={r.id} variants={item}
                    className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-ink">{r.author}</p>
                        <p className="text-xs text-muted-foreground">{r.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.product?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-0.5">{renderStars(r.rating)}</div>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="truncate text-muted-foreground">{r.content}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${statusBadge(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {r.status !== "approved" && (
                          <button aria-label="Approve review" onClick={() => handleApprove(r.id)}
                            className="rounded-lg p-1.5 text-green-600 hover:bg-green-50 transition-colors"><Check className="h-4 w-4" strokeWidth={1.5} /></button>
                        )}
                        {r.status !== "rejected" && (
                          <button aria-label="Reject review" onClick={() => handleReject(r.id)}
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 transition-colors"><X className="h-4 w-4" strokeWidth={1.5} /></button>
                        )}
                        <button aria-label="Delete review" onClick={() => handleDelete(r.id)}
                          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="h-4 w-4" strokeWidth={1.5} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
