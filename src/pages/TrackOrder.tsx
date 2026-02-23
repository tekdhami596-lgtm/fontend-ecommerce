import { useState } from "react";
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
  paymentMode: string;
  paymentStatus: string;
  orderStatus: OrderStatus;
  orderItems: OrderItem[];
  createdAt: string;
}

const STATUS_STEPS: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
];

const STATUS_META: Record<
  OrderStatus,
  { label: string; color: string; bg: string; icon: string }
> = {
  pending: {
    label: "Pending",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    icon: "⏳",
  },
  processing: {
    label: "Processing",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    icon: "⚙️",
  },
  shipped: {
    label: "Shipped",
    color: "text-violet-600",
    bg: "bg-violet-50 border-violet-200",
    icon: "🚚",
  },
  delivered: {
    label: "Delivered",
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    icon: "✅",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    icon: "✖",
  },
};

export default function TrackOrder() {
  const [reference, setReference] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async () => {
    if (!reference.trim()) {
      setError("Please enter an order reference.");
      return;
    }
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await api.get(`/orders/track/${reference.trim()}`);
      setOrder(res.data.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Order not found. Please check your reference.",
      );
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = order
    ? order.orderStatus === "cancelled"
      ? -1
      : STATUS_STEPS.indexOf(order.orderStatus)
    : -1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-16">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 shadow-lg">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Track Your Order
          </h1>
          <p className="mt-2 text-slate-500">
            Enter your order reference to see the latest status
          </p>
        </div>

        {/* Search Box */}
        <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-6">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Order Reference
            </label>
            <div className="flex gap-3">
              <input
                value={reference}
                onChange={(e) => {
                  setReference(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                placeholder="e.g. ORD-2025-1234567890"
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-800 placeholder-slate-400 transition outline-none focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
              />
              <button
                onClick={handleTrack}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 active:scale-95 disabled:opacity-60"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
                      d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                    />
                  </svg>
                )}
                Track
              </button>
            </div>

            {error && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
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
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Order Result */}
        {order && (
          <div className="animate-[fadeIn_0.4s_ease-out] space-y-4">
            {/* Status Banner */}
            <div
              className={`flex items-center justify-between rounded-2xl border p-5 ${STATUS_META[order.orderStatus].bg}`}
            >
              <div>
                <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
                  Current Status
                </p>
                <p
                  className={`mt-1 text-xl font-bold ${STATUS_META[order.orderStatus].color}`}
                >
                  {STATUS_META[order.orderStatus].icon}{" "}
                  {STATUS_META[order.orderStatus].label}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Reference</p>
                <p className="mt-1 font-mono text-sm font-bold text-slate-700">
                  {order.reference}
                </p>
              </div>
            </div>

            {/* Progress Tracker */}
            {order.orderStatus !== "cancelled" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="mb-5 text-sm font-semibold tracking-widest text-slate-500 uppercase">
                  Order Progress
                </p>
                <div className="relative flex items-center justify-between">
                  {/* connecting line */}
                  <div className="absolute top-5 right-0 left-0 h-0.5 bg-slate-100" />
                  <div
                    className="absolute top-5 left-0 h-0.5 bg-slate-900 transition-all duration-700"
                    style={{
                      width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%`,
                    }}
                  />
                  {STATUS_STEPS.map((step, i) => {
                    const done = i <= currentStepIndex;
                    const active = i === currentStepIndex;
                    return (
                      <div
                        key={step}
                        className="relative z-10 flex flex-col items-center gap-2"
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${done ? "border-slate-900 bg-slate-900" : "border-slate-200 bg-white"} ${active ? "ring-4 ring-slate-900/10" : ""}`}
                        >
                          {done ? (
                            <svg
                              className="h-4 w-4 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-slate-200" />
                          )}
                        </div>
                        <span
                          className={`text-xs font-semibold capitalize ${done ? "text-slate-900" : "text-slate-400"}`}
                        >
                          {STATUS_META[step].label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Order Details */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                <p className="text-sm font-semibold tracking-widest text-slate-400 uppercase">
                  Order Details
                </p>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { label: "Buyer", value: order.buyerName },
                  { label: "Delivery Address", value: order.address },
                  { label: "Payment Mode", value: order.paymentMode },
                  {
                    label: "Payment Status",
                    value: (
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold tracking-wide uppercase ${
                          order.paymentStatus === "done"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {order.paymentStatus === "done" ? "Paid" : "Pending"}
                      </span>
                    ),
                  },
                  {
                    label: "Ordered On",
                    value: new Date(order.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    ),
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between px-6 py-3.5"
                  >
                    <span className="text-sm text-slate-400">{label}</span>
                    <span className="text-sm font-semibold text-slate-800">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items */}
            {order.orderItems?.length > 0 && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                  <p className="text-sm font-semibold tracking-widest text-slate-400 uppercase">
                    Items Ordered
                  </p>
                </div>
                <div className="divide-y divide-slate-100">
                  {order.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-6 py-4"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {item.productName}
                        </p>
                        <p className="text-xs text-slate-400">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
                  <span className="text-sm font-bold text-slate-700">
                    Total
                  </span>
                  <span className="text-base font-extrabold text-slate-900">
                    Rs.{" "}
                    {order.orderItems
                      .reduce((sum, i) => sum + i.price * i.quantity, 0)
                      .toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
