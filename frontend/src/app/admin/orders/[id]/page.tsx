"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock, RefreshCw, Printer, MessageSquare, Send, ExternalLink, User, MapPin, CreditCard, StickyNote, Loader2 } from "lucide-react";
import Link from "next/link";

interface OrderData {
  id: string; orderNumber: string; email: string;
  subtotal: number; shippingCost: number; tax: number; discount: number; total: number;
  currency: string; status: string; paymentStatus: string; paymentMethod: string; transactionId: string;
  shippingMethod: string; trackingNumber: string; trackingUrl: string;
  notes: string; adminNotes: string; customerNotes: string;
  source: string; createdAt: string; paidAt: string; shippedAt: string;
  deliveredAt: string; cancelledAt: string; refundedAt: string;
  customer: { id: string; firstName: string; lastName: string; email: string; phone: string } | null;
  shippingAddress: { id: string; firstName: string; lastName: string; company: string; address1: string; address2: string; city: string; state: string; postalCode: string; country: string; phone: string } | null;
  billingAddress: { id: string; firstName: string; lastName: string; company: string; address1: string; address2: string; city: string; state: string; postalCode: string; country: string; phone: string } | null;
  items: { id: string; productId: string; productSku: string; productName: string; productPrice: number; color: string; size: string; quantity: number }[];
  timeline: { id: string; status: string; note: string; createdBy: string; createdAt: string }[];
}

const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string; next: string[] }> = {
  pending:    { label: "Pending",    icon: Clock,        color: "text-yellow-700", bg: "bg-yellow-100", next: ["processing", "cancelled"] },
  processing: { label: "Processing", icon: RefreshCw,    color: "text-blue-700",   bg: "bg-blue-100",   next: ["shipped", "cancelled"] },
  shipped:    { label: "Shipped",    icon: Truck,        color: "text-purple-700", bg: "bg-purple-100", next: ["delivered", "cancelled"] },
  delivered:  { label: "Delivered",  icon: CheckCircle,  color: "text-green-700",  bg: "bg-green-100",  next: ["refunded"] },
  cancelled:  { label: "Cancelled",  icon: XCircle,      color: "text-red-700",    bg: "bg-red-100",    next: [] },
  refunded:   { label: "Refunded",   icon: RefreshCw,    color: "text-gray-700",   bg: "bg-gray-100",   next: [] },
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [orderId, setOrderId] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [timelineNote, setTimelineNote] = useState("");
  const [showTimelineInput, setShowTimelineInput] = useState(false);

  useEffect(() => { params.then((p) => setOrderId(p.id)); }, [params]);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      const res = await fetch(`/admin/api/orders/${orderId}`);
      const json = await res.json();
      if (json.success) {
        setOrder(json.data);
        setAdminNotes(json.data.adminNotes || "");
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [orderId]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const updateOrder = async (data: Record<string, unknown>) => {
    setUpdating(true);
    try {
      const res = await fetch(`/admin/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) setOrder(json.data);
    } catch (err) { console.error(err); }
    finally { setUpdating(false); }
  };

  const handleStatusChange = async (newStatus: string) => {
    const note = timelineNote.trim() || `Status changed to ${newStatus}`;
    await updateOrder({ status: newStatus, timelineNote: note });
    setTimelineNote("");
    setShowTimelineInput(false);
  };

  const handleAddTimelineNote = async () => {
    if (!timelineNote.trim()) return;
    await updateOrder({ timelineNote: timelineNote.trim() });
    setTimelineNote("");
    setShowTimelineInput(false);
  };

  const saveAdminNotes = async () => {
    setSavingNotes(true);
    await updateOrder({ adminNotes });
    setSavingNotes(false);
  };

  const StatusIcon = (cfg: typeof statusConfig[keyof typeof statusConfig]) => {
    const Icon = cfg.icon;
    return <Icon className="h-5 w-5" strokeWidth={1.5} />;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-ink" /></div>;
  if (!order) return <div className="text-center py-12 text-muted-foreground">Order not found</div>;

  const cfg = statusConfig[order.status] || statusConfig.pending;
  const StatusIconComponent = cfg.icon;

  const statusRingColor: Record<string, string> = {
    pending: "ring-gray-500/30",
    processing: "ring-blue-500/30",
    shipped: "ring-purple-500/30",
    delivered: "ring-green-500/30",
    cancelled: "ring-red-500/30",
    refunded: "ring-gray-500/30",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="rounded-xl p-2 text-muted-foreground hover:bg-accent transition-colors">
            <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-3xl font-medium text-ink">Order {order.orderNumber}</h1>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                <StatusIconComponent className="h-3.5 w-3.5" strokeWidth={2} />
                {cfg.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {new Date(order.createdAt).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              {order.source !== "website" && <span className="ml-2 rounded bg-accent px-2 py-0.5 text-[10px]">{order.source}</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs font-medium text-ink hover:bg-accent transition-colors">
            <Printer className="h-3.5 w-3.5" strokeWidth={1.5} />
            Print
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-paper p-6">
            <h2 className="font-serif text-xl text-ink mb-4">Status</h2>
            <div className="flex flex-wrap items-center gap-2">
              {["pending", "processing", "shipped", "delivered", "cancelled", "refunded"].map((s) => {
                const sc = statusConfig[s];
                const Icon = sc.icon;
                const isCurrent = order.status === s;
                const isAllowed = order.status === s || statusConfig[order.status]?.next.includes(s);
                return (
                  <button key={s} onClick={() => isAllowed && handleStatusChange(s)}
                    disabled={!isAllowed || updating}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-medium transition-all ${
                      isCurrent
                        ? `${sc.bg} ${sc.color} ring-2 ring-offset-2 ${statusRingColor[s] || "ring-gray-500/30"}`
                        : isAllowed
                          ? "border border-border text-muted-foreground hover:bg-accent hover:text-ink"
                          : "border border-border/50 text-muted-foreground/30 cursor-not-allowed"
                    }`}>
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                    {sc.label}
                  </button>
                );
              })}
              {updating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" strokeWidth={1.5} />}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-paper p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl text-ink">Order Items</h2>
              <span className="text-xs text-muted-foreground">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="h-14 w-14 flex-shrink-0 rounded-lg bg-stone flex items-center justify-center overflow-hidden">
                    <Package className="h-6 w-6 text-muted-foreground" strokeWidth={1} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink truncate">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      SKU: {item.productSku}
                      {item.color && <span className="ml-2">· {item.color}</span>}
                      {item.size && <span className="ml-2">· {item.size}</span>}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-medium text-ink">{item.quantity} × TSh {item.productPrice.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">TSh {(item.productPrice * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-paper p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl text-ink">Timeline</h2>
              <button onClick={() => setShowTimelineInput(!showTimelineInput)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-gold hover:underline">
                <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
                Add Note
              </button>
            </div>

            <AnimatePresence>
              {showTimelineInput && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
                  <div className="rounded-xl border border-border bg-background p-3 space-y-2">
                    <textarea value={timelineNote} onChange={(e) => setTimelineNote(e.target.value)}
                      placeholder="Add a note to the timeline..."
                      rows={2}
                      className="w-full rounded-lg border-0 bg-transparent text-sm text-ink outline-none placeholder:text-muted-foreground/60 resize-none" />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setShowTimelineInput(false); setTimelineNote(""); }}
                        className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent">Cancel</button>
                      <button onClick={handleAddTimelineNote} disabled={!timelineNote.trim()}
                        className="inline-flex items-center gap-1 rounded-lg bg-ink px-3 py-1.5 text-xs text-paper hover:bg-ink/90 disabled:opacity-50">
                        <Send className="h-3 w-3" strokeWidth={1.5} />
                        Add Note
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-0">
              {order.timeline.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No timeline entries yet</p>
              ) : (
                order.timeline.map((entry, i) => {
                  const sc = statusConfig[entry.status] || statusConfig.pending;
                  const Icon = sc.icon;
                  return (
                    <div key={entry.id} className="flex gap-3 pb-4 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full ${sc.bg} ${sc.color}`}>
                          <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                        </div>
                        {i < order.timeline.length - 1 && <div className="w-px flex-1 bg-border" />}
                      </div>
                      <div className="flex-1 pt-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-ink capitalize">{entry.status}</span>
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(entry.createdAt).toLocaleString()}
                            {entry.createdBy ? ` by ${entry.createdBy}` : ""}
                          </span>
                        </div>
                        {entry.note && entry.note !== `Status changed to ${entry.status}` && (
                          <p className="text-sm text-muted-foreground mt-0.5">{entry.note}</p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-paper p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl text-ink">Admin Notes</h2>
              <button onClick={saveAdminNotes} disabled={savingNotes}
                className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-paper hover:bg-ink/90 disabled:opacity-50">
                {savingNotes ? "Saving..." : "Save"}
              </button>
            </div>
            <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Internal notes about this order..."
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold placeholder:text-muted-foreground/60 resize-none" />
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-paper p-6">
            <h2 className="font-serif text-xl text-ink mb-4">Order Summary</h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-ink font-medium">TSh {order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-ink font-medium">
                  {order.shippingCost === 0 ? "Free" : `TSh ${order.shippingCost.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="text-ink font-medium">TSh {order.tax.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-red-600 font-medium">-TSh {order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-2.5 mt-2.5">
                <span className="font-semibold text-ink">Total</span>
                <span className="font-semibold text-ink">TSh {order.total.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-paper p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              <h2 className="font-serif text-xl text-ink">Payment</h2>
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="text-ink">{order.paymentMethod || "—"}</span>
              </div>
              {order.transactionId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction</span>
                  <span className="text-ink font-mono text-[11px]">{order.transactionId}</span>
                </div>
              )}
              {order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid at</span>
                  <span className="text-ink text-xs">{new Date(order.paidAt).toLocaleString()}</span>
                </div>
              )}
              <div className="pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <button onClick={() => updateOrder({ paymentStatus: order.paymentStatus === "paid" ? "pending" : "paid" })}
                    disabled={updating}
                    className="w-full rounded-lg border border-border px-3 py-2 text-xs font-medium text-ink hover:bg-accent transition-colors disabled:opacity-50">
                    Mark as {order.paymentStatus === "paid" ? "Unpaid" : "Paid"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-paper p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              <h2 className="font-serif text-xl text-ink">Customer</h2>
            </div>
            {order.customer ? (
              <div className="text-sm space-y-1.5">
                <p className="font-medium text-ink">{order.customer.firstName} {order.customer.lastName}</p>
                <p className="text-muted-foreground">{order.customer.email}</p>
                {order.customer.phone && <p className="text-muted-foreground">{order.customer.phone}</p>}
                <Link href={`/admin/customers/${order.customer.id}`}
                  className="inline-flex items-center gap-1 text-xs text-gold hover:underline mt-1">
                  <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                  View Customer
                </Link>
              </div>
            ) : (
              <div className="text-sm space-y-1">
                <p className="text-muted-foreground">{order.email}</p>
                <p className="text-[11px] text-muted-foreground/60">No registered customer</p>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-paper p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              <h2 className="font-serif text-xl text-ink">Shipping</h2>
            </div>
            {order.shippingAddress ? (
              <div className="text-sm space-y-1">
                <p className="font-medium text-ink">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                {order.shippingAddress.company && <p className="text-muted-foreground">{order.shippingAddress.company}</p>}
                <p className="text-muted-foreground">{order.shippingAddress.address1}</p>
                {order.shippingAddress.address2 && <p className="text-muted-foreground">{order.shippingAddress.address2}</p>}
                <p className="text-muted-foreground">{order.shippingAddress.city}{order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""} {order.shippingAddress.postalCode}</p>
                <p className="text-muted-foreground">{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && <p className="text-muted-foreground">{order.shippingAddress.phone}</p>}
              </div>
            ) : <p className="text-sm text-muted-foreground">No shipping address</p>}

            <div className="mt-4 pt-4 border-t border-border space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Method</span>
                <span className="text-ink">{order.shippingMethod || "—"}</span>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Tracking Number</label>
                <input type="text" defaultValue={order.trackingNumber || ""}
                  placeholder="Add tracking number..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-ink outline-none focus:border-gold"
                  onBlur={(e) => { const v = e.target.value; if (v !== (order.trackingNumber || "")) updateOrder({ trackingNumber: v }); }}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Tracking URL</label>
                <input type="url" defaultValue={order.trackingUrl || ""}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-ink outline-none focus:border-gold"
                  onBlur={(e) => { const v = e.target.value; if (v !== (order.trackingUrl || "")) updateOrder({ trackingUrl: v }); }}
                />
              </div>
              {order.trackingUrl && (
                <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-gold hover:underline">
                  <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                  Track Package
                </a>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-paper p-6">
            <h2 className="font-serif text-xl text-ink mb-4">Dates</h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span className="text-ink">{new Date(order.createdAt).toLocaleString()}</span></div>
              {order.paidAt && <div className="flex justify-between"><span className="text-muted-foreground">Paid</span><span className="text-ink">{new Date(order.paidAt).toLocaleString()}</span></div>}
              {order.shippedAt && <div className="flex justify-between"><span className="text-muted-foreground">Shipped</span><span className="text-ink">{new Date(order.shippedAt).toLocaleString()}</span></div>}
              {order.deliveredAt && <div className="flex justify-between"><span className="text-muted-foreground">Delivered</span><span className="text-ink">{new Date(order.deliveredAt).toLocaleString()}</span></div>}
              {order.cancelledAt && <div className="flex justify-between"><span className="text-muted-foreground">Cancelled</span><span className="text-ink">{new Date(order.cancelledAt).toLocaleString()}</span></div>}
              {order.refundedAt && <div className="flex justify-between"><span className="text-muted-foreground">Refunded</span><span className="text-ink">{new Date(order.refundedAt).toLocaleString()}</span></div>}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
