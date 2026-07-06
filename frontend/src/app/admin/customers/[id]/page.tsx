"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, ShoppingBag, Star, Heart, AlertTriangle } from "lucide-react";

interface CustomerDetail {
  id: string; email: string; firstName: string; lastName: string; phone: string;
  notes: string; isSuspended: boolean; rewardPoints: number; totalSpent: number; ordersCount: number;
  createdAt: string;
  orders: { id: string; orderNumber: string; total: number; status: string; createdAt: string; items: { id: string }[] }[];
  addresses: { id: string; firstName: string; address1: string; city: string; country: string; isDefault: boolean; type: string }[];
  reviews: { id: string; rating: number; title: string; product: { name: string } }[];
  wishlist: { id: string; productName: string; productPrice: number }[];
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState("");

  useEffect(() => { params.then((p) => setCustomerId(p.id)); }, [params]);
  useEffect(() => {
    if (!customerId) return;
    fetch(`/admin/api/customers/${customerId}`)
      .then((r) => r.json())
      .then((res) => { if (res.success) setCustomer(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [customerId]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-ink" /></div>;
  if (!customer) return <div className="text-center py-12 text-muted-foreground">Customer not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/customers" className="rounded-xl p-2 text-muted-foreground hover:bg-accent transition-colors">
          <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
        </Link>
        <div className="flex items-center gap-4 flex-1">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-lg font-medium text-ink">
            {(customer.firstName?.[0] || customer.email[0]).toUpperCase()}
          </div>
          <div>
            <h1 className="font-serif text-3xl font-medium text-ink">{customer.firstName} {customer.lastName}</h1>
            <p className="text-sm text-muted-foreground">{customer.email}</p>
          </div>
          {customer.isSuspended && (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Suspended
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-paper p-6">
            <h2 className="font-serif text-xl text-ink mb-4">Contact</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><span className="text-ink">{customer.email}</span></div>
              {customer.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span className="text-ink">{customer.phone}</span></div>}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-paper p-6">
            <h2 className="font-serif text-xl text-ink mb-4">Stats</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg bg-background p-3"><span className="text-muted-foreground">Orders</span><p className="font-medium text-ink">{customer.ordersCount}</p></div>
              <div className="rounded-lg bg-background p-3"><span className="text-muted-foreground">Spent</span><p className="font-medium text-ink">TSh {customer.totalSpent.toLocaleString()}</p></div>
              <div className="rounded-lg bg-background p-3"><span className="text-muted-foreground">Points</span><p className="font-medium text-ink">{customer.rewardPoints}</p></div>
              <div className="rounded-lg bg-background p-3"><span className="text-muted-foreground">Joined</span><p className="font-medium text-ink">{new Date(customer.createdAt).toLocaleDateString()}</p></div>
            </div>
          </motion.div>

          {customer.addresses?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-paper p-6">
              <h2 className="font-serif text-xl text-ink mb-4">Addresses</h2>
              <div className="space-y-3">
                {customer.addresses.map((addr) => (
                  <div key={addr.id} className="rounded-lg bg-background p-3 text-sm">
                    <p className="font-medium text-ink">{addr.firstName}</p>
                    <p className="text-muted-foreground">{addr.address1}, {addr.city}</p>
                    <p className="text-muted-foreground">{addr.country}</p>
                    <div className="flex gap-1.5 mt-1">
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] text-muted-foreground">{addr.type}</span>
                      {addr.isDefault && <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] text-gold">Default</span>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-paper p-6">
            <h2 className="font-serif text-xl text-ink mb-4">Order History</h2>
            {customer.orders?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {customer.orders?.slice(0, 10).map((order) => (
                  <Link key={order.id} href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between rounded-lg bg-background p-4 hover:bg-accent transition-colors">
                    <div>
                      <p className="font-medium text-ink">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()} · {order.items?.length || 0} items</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-ink">TSh {order.total.toLocaleString()}</p>
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] text-muted-foreground">{order.status}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>

          {customer.reviews?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-paper p-6">
              <h2 className="font-serif text-xl text-ink mb-4">Reviews</h2>
              <div className="space-y-3">
                {customer.reviews.map((review) => (
                  <div key={review.id} className="rounded-lg bg-background p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex">{Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-border"}`} strokeWidth={1.5} />
                      ))}</div>
                      <span className="text-sm font-medium text-ink">{review.title}</span>
                    </div>
                    {review.product && <p className="text-xs text-muted-foreground mt-1">on {review.product.name}</p>}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {customer.wishlist?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-paper p-6">
              <h2 className="font-serif text-xl text-ink mb-4">Wishlist</h2>
              <div className="space-y-3">
                {customer.wishlist.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg bg-background p-4">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-400" strokeWidth={1.5} />
                      <span className="text-sm text-ink">{item.productName}</span>
                    </div>
                    {item.productPrice && <span className="text-sm font-medium text-ink">TSh {item.productPrice.toLocaleString()}</span>}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
