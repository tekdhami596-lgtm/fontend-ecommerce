import { Link } from "react-router-dom";

export default function EsewaFailure() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-white px-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl">
        {/* Red banner */}
        <div className="bg-gradient-to-r from-red-500 to-rose-500 px-8 py-10 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <svg
                className="h-9 w-9 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-xl font-bold text-white">
            Payment Failed or Cancelled
          </h1>
          <p className="mt-1 text-sm text-red-100">
            Your eSewa payment was not completed.
          </p>
        </div>

        <div className="px-8 py-6">
          <div className="mb-5 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
            <p className="font-semibold">Your order has not been placed.</p>
            <p className="mt-1 text-xs text-amber-600">
              No money was charged. Your cart items are still saved — you can
              try again.
            </p>
          </div>

          <p className="mb-5 text-center text-sm text-gray-500">
            If you were charged but the payment failed, please contact eSewa
            support or reach out to us.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              to="/checkout"
              className="w-full rounded-xl bg-green-600 py-3.5 text-center text-sm font-bold text-white shadow-sm hover:bg-green-700"
            >
              Try Again
            </Link>
            <Link
              to="/products"
              className="w-full rounded-xl border border-gray-200 py-3.5 text-center text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
