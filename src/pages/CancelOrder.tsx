import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  reference: string;
  buyerName: string;
  address: string;
  orderStatus: OrderStatus;
  paymentMode: string;
  paymentStatus: string;
  orderItems: OrderItem[];
  createdAt: string;
}

const CANCELLABLE: OrderStatus[] = ["pending", "processing"];

export default function CancelOrder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [cancelled, setCancelled] = useState(false);
  const [reason, setReason] = useState("");

  const CANCEL_REASONS = [
    "Changed my mind",
    "Found a better price elsewhere",
    "Ordered by mistake",
    "Delivery time too long",
    "Other",
  ];

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.data);
      } catch (err: any) {
        setFetchError(err?.response?.data?.message || "Order not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    if (!reason) {
      setCancelError("Please select a reason for cancellation.");
      return;
    }
    setCancelling(true);
    setCancelError("");
    try {
      await api.patch(`/orders/${id}/cancel`, { reason });
      setCancelled(true);
      setOrder((prev) => (prev ? { ...prev, orderStatus: "cancelled" } : prev));
    } catch (err: any) {
      setCancelError(
        err?.response?.data?.message ||
          "Could not cancel order. Please try again.",
      );
    } finally {
      setCancelling(false);
    }
  };

  const subtotal =
    order?.orderItems.reduce((s, i) => s + i.price * i.quantity, 0) ?? 0;
  const canCancel = order && CANCELLABLE.includes(order.orderStatus);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-slate-800" />
          <p className="text-sm font-medium text-slate-400">Loading order…</p>
        </div>
      </div>
    );
  }

  // ── Fetch Error ──────────────────────────────────────────────────────────────
  if (fetchError || !order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-slate-50 px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
          <svg
            className="h-8 w-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-center font-semibold text-slate-700">
          {fetchError || "Order not found."}
        </p>
        <Link
          to="/my-orders"
          className="cursor-pointer rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
        >
          ← Back to Orders
        </Link>
      </div>
    );
  }

  // ── Success State ────────────────────────────────────────────────────────────
  if (cancelled) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-white px-4">
        <div className="w-full max-w-md animate-[fadeIn_0.4s_ease-out] overflow-hidden rounded-3xl bg-white shadow-xl">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">Order Cancelled</h1>
            <p className="mt-1 text-sm text-slate-300">
              Your order has been successfully cancelled.
            </p>
          </div>
          <div className="space-y-4 px-8 py-6">
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50">
              <div className="flex justify-between px-4 py-3">
                <span className="text-sm text-slate-500">Reference</span>
                <span className="font-mono text-sm font-bold text-slate-800">
                  {order.reference}
                </span>
              </div>
              <div className="flex justify-between px-4 py-3">
                <span className="text-sm text-slate-500">Status</span>
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold tracking-wide text-red-700 uppercase">
                  Cancelled
                </span>
              </div>
              <div className="flex justify-between px-4 py-3">
                <span className="text-sm text-slate-500">Reason</span>
                <span className="text-sm font-semibold text-slate-700">
                  {reason}
                </span>
              </div>
            </div>
            <p className="text-center text-xs text-slate-400">
              Stock has been restored. If you were charged, please contact
              support.
            </p>
            <div className="flex flex-col gap-3 pt-1">
              <Link
                to="/my-orders"
                className="w-full cursor-pointer rounded-xl bg-slate-900 py-3 text-center text-sm font-bold text-white hover:bg-slate-700"
              >
                View My Orders
              </Link>
              <Link
                to="/"
                className="w-full cursor-pointer rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-500 hover:bg-slate-50"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Already Cancelled / Cannot Cancel ────────────────────────────────────────
  if (!canCancel) {
    const statusMessages: Partial<
      Record<OrderStatus, { title: string; desc: string }>
    > = {
      shipped: {
        title: "Order Already Shipped",
        desc: "Your order is on its way and can no longer be cancelled. Please contact support if you need help.",
      },
      delivered: {
        title: "Order Already Delivered",
        desc: "This order has been delivered and cannot be cancelled.",
      },
      cancelled: {
        title: "Already Cancelled",
        desc: "This order has already been cancelled.",
      },
    };
    const msg = statusMessages[order.orderStatus] ?? {
      title: "Cannot Cancel",
      desc: "This order cannot be cancelled at this time.",
    };

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md animate-[fadeIn_0.35s_ease-out] overflow-hidden rounded-3xl bg-white shadow-xl">
          <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-8 py-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">{msg.title}</h1>
            <p className="mt-1 text-sm text-amber-100">{msg.desc}</p>
          </div>
          <div className="flex flex-col gap-3 px-8 py-6">
            <Link
              to="/my-orders"
              className="w-full rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-500 hover:bg-slate-50"
            >
              ← Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Cancel Form ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10">
      <div className="mx-auto max-w-lg animate-[fadeIn_0.35s_ease-out] space-y-5">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        {/* Header */}
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 px-6 py-6 text-white shadow-lg">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold">Cancel Order</h1>
              <p className="mt-0.5 font-mono text-sm text-red-100">
                {order.reference}
              </p>
              <p className="mt-1 text-xs text-red-200">
                Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
              Order Summary
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {order.orderItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-6 py-3.5"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {item.productName}
                  </p>
                  <p className="text-xs text-slate-400">
                    Qty: {item.quantity} × Rs. {item.price.toLocaleString()}
                  </p>
                </div>
                <p className="text-sm font-bold text-slate-900">
                  Rs. {(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
            <span className="text-sm font-bold text-slate-700">Total</span>
            <span className="text-base font-extrabold text-slate-900">
              Rs. {subtotal.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
              Shipping To
            </p>
          </div>
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <svg
                className="h-4 w-4 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {order.buyerName}
              </p>
              <p className="text-xs text-slate-400">{order.address}</p>
            </div>
          </div>
        </div>

        {/* Reason Selector */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
              Reason for Cancellation <span className="text-red-400">*</span>
            </p>
          </div>
          <div className="divide-y divide-slate-100 px-4 py-2">
            {CANCEL_REASONS.map((r) => (
              <label
                key={r}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-3.5 transition hover:bg-slate-50"
              >
                <input
                  type="radio"
                  name="reason"
                  value={r}
                  checked={reason === r}
                  onChange={() => {
                    setReason(r);
                    setCancelError("");
                  }}
                  className="h-4 w-4 accent-slate-800"
                />
                <span className="text-sm font-medium text-slate-700">{r}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Warning Notice */}
        <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <svg
            className="mt-0.5 h-5 w-5 shrink-0 text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Before you cancel
            </p>
            <p className="mt-0.5 text-xs text-amber-600">
              This action is irreversible. Stock will be restored automatically.
              If payment was made via eSewa, please contact support for a
              refund.
            </p>
          </div>
        </div>

        {/* Error */}
        {cancelError && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <svg
              className="h-4 w-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {cancelError}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 pb-8">
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-500 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-red-600 active:scale-95 disabled:opacity-60"
          >
            {cancelling ? (
              <span className="h-4 w-4 animate-spin cursor-pointer rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
            {cancelling ? "Cancelling…" : "Confirm Cancellation"}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full cursor-pointer rounded-xl border border-slate-200 py-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Keep My Order
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
