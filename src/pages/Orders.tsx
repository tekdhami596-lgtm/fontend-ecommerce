import { useEffect, useState } from "react";
import orderApi from "../api/order.api";
import notify from "../helpers/notify";
import { Loader2, Trash2 } from "lucide-react";

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  productName: string;
}

interface Order {
  id: number;
  reference: string;
  buyerName: string;
  address: string;
  notes: string;
  paymentStatus: string;
  paymentMode: string;
  createdAt: string;
  orderItems: OrderItem[];
  orderStatus: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  done: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  refund: "bg-purple-100 text-purple-700",
  cancelled: "bg-gray-100 text-gray-500",
};

const paymentModeLabel: Record<string, string> = {
  cash: "Cash on Delivery",
  esewa: "eSewa",
  khalti: "Khalti",
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [loadingCancelId, setLoadingCancelId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderApi.getAll();
      setOrders(res.data.data);
    } catch {
      notify.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // ── Cancel ─────────────────────────────────────────────────
  const handleCancelClick = (id: number) => setCancellingId(id);
  const handleCancelDismiss = () => setCancellingId(null);

  const handleCancelConfirm = async (id: number) => {
    setLoadingCancelId(id);
    try {
      await orderApi.cancel(id);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, paymentStatus: "cancelled" } : o,
        ),
      );
      notify.success("Order cancelled successfully");
    } catch {
      notify.error("Failed to cancel order");
    } finally {
      setLoadingCancelId(null);
      setCancellingId(null);
    }
  };

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await orderApi.delete(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      notify.success("Order deleted");
    } catch {
      notify.error("Failed to delete order");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Loading skeleton ───────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <div className="h-7 w-36 animate-pulse rounded-lg bg-gray-200" />
            <div className="mt-2 h-4 w-24 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 animate-pulse rounded-xl bg-gray-200" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                      <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
                    </div>
                  </div>
                  <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" />
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 px-6 py-4 sm:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="space-y-1">
                      <div className="h-3 w-12 animate-pulse rounded bg-gray-200" />
                      <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                    </div>
                  ))}
                </div>
                <div className="px-6 pb-4">
                  <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────
  if (!orders.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <svg
              className="h-10 w-10 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h2 className="mb-1 text-lg font-bold text-gray-700">
            No orders yet
          </h2>
          <p className="mb-6 text-sm text-gray-400">
            You haven't placed any orders yet.
          </p>
          <a
            href="/"
            className="inline-block rounded-xl bg-green-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700"
          >
            Start Shopping
          </a>
        </div>
      </div>
    );
  }

  // ── Orders list ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
          <p className="mt-1 text-sm text-gray-500">
            {orders.length} {orders.length === 1 ? "order" : "orders"} placed
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const isExpanded = expandedId === order.id;
            const isCancelling = cancellingId === order.id;
            const isCancelled = order.paymentStatus === "cancelled";
            const canCancel =
              ["pending", "processing"].includes(order.paymentStatus) &&
              !isCancelled;
            const orderTotal = order.orderItems.reduce(
              (sum, item) => sum + Number(item.price) * item.quantity,
              0,
            );

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                {/* ── Order header ── */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50">
                      <svg
                        className="h-5 w-5 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">
                        Order #{order.id}
                      </p>
                      <p className="font-mono text-xs text-gray-400">
                        {order.reference}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status badge */}
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase ${statusColors[order.paymentStatus] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {order.paymentStatus}
                    </span>

                    {/* Cancel button */}
                    {canCancel && (
                      <button
                        onClick={() => handleCancelClick(order.id)}
                        className="cursor-pointer rounded-xl border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-600 transition hover:bg-red-100"
                      >
                        Cancel
                      </button>
                    )}

                    {/* Delete button — only for cancelled orders */}
                    {isCancelled && (
                      <button
                        onClick={() => handleDelete(order.id)}
                        disabled={deletingId === order.id}
                        className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                      >
                        {deletingId === order.id ? (
                          <Loader2 size={11} className="animate-spin" />
                        ) : (
                          <Trash2 size={11} />
                        )}
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {/* ── Inline cancel confirmation ── */}
                {isCancelling && (
                  <div className="flex items-center justify-between gap-3 border-b border-red-100 bg-red-50 px-6 py-3">
                    <p className="text-sm font-medium text-red-700">
                      Are you sure you want to cancel this order?
                    </p>
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={handleCancelDismiss}
                        disabled={loadingCancelId === order.id}
                        className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                      >
                        No, keep it
                      </button>
                      <button
                        onClick={() => handleCancelConfirm(order.id)}
                        disabled={loadingCancelId === order.id}
                        className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                      >
                        {loadingCancelId === order.id ? (
                          <>
                            <Loader2 size={12} className="animate-spin" />
                            Cancelling…
                          </>
                        ) : (
                          "Yes, cancel"
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Order info grid ── */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 px-6 py-4 sm:grid-cols-4">
                  <div>
                    <p className="mb-0.5 text-xs font-medium text-gray-400">
                      Date
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="mb-0.5 text-xs font-medium text-gray-400">
                      Payment
                    </p>
                    <p className="text-sm font-semibold text-gray-700">
                      {paymentModeLabel[order.paymentMode] ?? order.paymentMode}
                    </p>
                  </div>
                  <div>
                    <p className="mb-0.5 text-xs font-medium text-gray-400">
                      Address
                    </p>
                    <p className="truncate text-sm font-semibold text-gray-700">
                      {order.address}
                    </p>
                  </div>
                  <div>
                    <p className="mb-0.5 text-xs font-medium text-gray-400">
                      Total
                    </p>
                    <p className="text-sm font-bold text-green-600">
                      Rs. {orderTotal}
                    </p>
                  </div>
                </div>

                {/* ── Toggle items ── */}
                <div className="px-6 pb-4">
                  <button
                    onClick={() => toggleExpand(order.id)}
                    className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-green-600 transition-colors hover:text-green-700"
                  >
                    <svg
                      className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                    {isExpanded
                      ? "Hide Items"
                      : `View Items (${order.orderItems.length})`}
                  </button>
                </div>

                {/* ── Expanded items ── */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/60 px-6 py-4">
                    <div className="flex flex-col gap-3">
                      {order.orderItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                              <svg
                                className="h-4 w-4 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">
                                {item.productName}
                              </p>
                              <p className="text-xs text-gray-400">
                                Rs. {item.price} × {item.quantity}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm font-bold text-gray-700">
                            Rs. {Number(item.price) * item.quantity}
                          </p>
                        </div>
                      ))}
                      <div className="mt-1 flex items-center justify-between border-t border-gray-200 pt-2">
                        <span className="text-sm font-semibold text-gray-600">
                          Order Total
                        </span>
                        <span className="text-base font-extrabold text-green-600">
                          Rs. {orderTotal.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
