import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

interface OrderSuccessState {
  orderId: string | number;
  BuyerName: string;
  Address: string;
  reference: string;
  total: number;
}

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as OrderSuccessState | null;

  useEffect(() => {
    if (!state?.orderId) {
      navigate("/", { replace: true });
    }
  }, [state, navigate]);

  if (!state?.orderId) return null;

  const { orderId, BuyerName, Address, reference, total } = state;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
          {/* Top green banner */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-10 text-center">
            {/* Animated SVG checkmark */}
            <div className="mb-5 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
                <svg viewBox="0 0 100 100" className="h-12 w-12">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="white"
                    strokeWidth="6"
                    strokeDasharray="283"
                    strokeDashoffset="283"
                    strokeLinecap="round"
                    style={{
                      animation: "drawCircle 0.6s ease-out 0.1s forwards",
                    }}
                  />
                  <polyline
                    points="25,52 42,68 75,35"
                    fill="none"
                    stroke="white"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="80"
                    strokeDashoffset="80"
                    style={{
                      animation: "drawCheck 0.4s ease-out 0.65s forwards",
                    }}
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Order Placed Successfully!
            </h1>
            <p className="mt-1 text-sm text-green-100">
              Your order is confirmed and being processed.
            </p>
          </div>

          {/* Order details */}
          <div className="px-8 py-6">
            {/* Reference badge */}
            <div className="mb-6 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-semibold tracking-wide text-green-700">
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                {reference}
              </span>
            </div>

            {/* Info rows */}
            <div className="mb-6 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100">
              <div className="flex items-center justify-between bg-gray-50/60 px-5 py-3.5">
                <span className="text-sm font-medium text-gray-500">
                  Order ID
                </span>
                <span className="text-sm font-bold text-gray-800">
                  #{orderId}
                </span>
              </div>

              <div className="flex items-center justify-between px-5 py-3.5">
                <span className="text-sm font-medium text-gray-500">
                  Buyer Name
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {BuyerName}
                </span>
              </div>

              <div className="flex items-center justify-between bg-gray-50/60 px-5 py-3.5">
                <span className="text-sm font-medium text-gray-500">
                  Delivery Address
                </span>
                <span className="max-w-[200px] text-right text-sm font-semibold text-gray-800">
                  {Address}
                </span>
              </div>

              <div className="flex items-center justify-between px-5 py-3.5">
                <span className="text-sm font-medium text-gray-500">
                  Payment Method
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                  Cash on Delivery
                </span>
              </div>

              <div className="flex items-center justify-between bg-gray-50/60 px-5 py-3.5">
                <span className="text-sm font-medium text-gray-500">
                  Status
                </span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold tracking-wide text-amber-700 uppercase">
                  Pending
                </span>
              </div>

              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-base font-bold text-gray-700">
                  Total Amount
                </span>
                <span className="text-lg font-extrabold text-green-600">
                  Rs. {total}
                </span>
              </div>
            </div>

            {/* Info note */}
            <div className="mb-6 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <svg
                className="mt-0.5 h-5 w-5 shrink-0 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm leading-relaxed text-blue-700">
                Please keep the exact cash amount ready at delivery. Our team
                will reach out to you shortly.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <Link
                to="/my-orders"
                className="w-full rounded-xl bg-green-600 py-3.5 text-center text-sm font-bold text-white shadow-sm shadow-green-200 transition-colors duration-150 hover:bg-green-700 active:bg-green-800"
              >
                View My Orders
              </Link>
              <Link
                to="/"
                className="w-full rounded-xl border border-gray-200 py-3.5 text-center text-sm font-semibold text-gray-600 transition-colors duration-150 hover:bg-gray-50 active:bg-gray-100"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes drawCircle {
          to { stroke-dashoffset: 0; }
        }
        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
