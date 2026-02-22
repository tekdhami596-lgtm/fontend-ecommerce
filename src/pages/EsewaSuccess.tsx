import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { clearCart } from "../redux/slice/cartSlice";
import api from "../api/axios";

type VerifyState = "verifying" | "success" | "failed";

export default function EsewaSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [state, setState] = useState<VerifyState>("verifying");
  const [orderData, setOrderData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const encodedData = searchParams.get("data");

    if (!encodedData) {
      setState("failed");
      setErrorMsg("No payment data received from eSewa.");
      return;
    }

    verifyPayment(encodedData);
  }, []);

  const verifyPayment = async (encodedData: string) => {
    try {
      // Send the raw base64 data to your backend for verification
      // Your backend will: decode it, verify HMAC signature, update order paymentStatus to "done"
      const res = await api.post("/orders/verify-esewa", { data: encodedData });

      if (res.data.success) {
        // Clear cart after confirmed payment
        dispatch(clearCart());
        setOrderData(res.data.order);
        setState("success");
      } else {
        setState("failed");
        setErrorMsg(res.data.message || "Payment verification failed.");
      }
    } catch (err: any) {
      console.error("eSewa verify error:", err);
      setState("failed");
      setErrorMsg(
        err?.response?.data?.message ||
          "Could not verify payment. Please contact support.",
      );
    }
  };

  // ── Verifying ──────────────────────────────────────────────
  if (state === "verifying") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-white">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
          <p className="text-base font-semibold text-gray-600">
            Verifying your eSewa payment…
          </p>
          <p className="text-sm text-gray-400">
            Please do not close this page.
          </p>
        </div>
      </div>
    );
  }

  // ── Failed ─────────────────────────────────────────────────
  if (state === "failed") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-white px-4">
        <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl">
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
              Payment Verification Failed
            </h1>
            <p className="mt-1 text-sm text-red-100">
              Your order has not been confirmed.
            </p>
          </div>
          <div className="px-8 py-6">
            <div className="mb-5 rounded-xl border border-red-100 bg-red-50 p-4 text-center text-sm text-red-600">
              {errorMsg}
            </div>
            <p className="mb-5 text-center text-sm text-gray-500">
              If money was deducted from your eSewa account, please contact
              support with your transaction details.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                to="/cart"
                className="w-full rounded-xl bg-red-500 py-3 text-center text-sm font-bold text-white hover:bg-red-600"
              >
                Back to Cart
              </Link>
              <Link
                to="/"
                className="w-full rounded-xl border border-gray-200 py-3 text-center text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Success ────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4 py-12">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-xl">
        {/* Green banner */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-10 text-center">
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
            Payment Successful!
          </h1>
          <p className="mt-1 text-sm text-green-100">
            Your eSewa payment has been verified and your order is confirmed.
          </p>
        </div>

        {/* Details */}
        <div className="px-8 py-6">
          {/* eSewa badge */}
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-semibold text-green-700">
              <img
                src="https://esewa.com.np/common/images/esewa_logo.png"
                alt="eSewa"
                className="h-4 w-4 object-contain"
              />
              Paid via eSewa
            </span>
          </div>

          {orderData && (
            <div className="mb-6 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100">
              <div className="flex items-center justify-between bg-gray-50/60 px-5 py-3.5">
                <span className="text-sm font-medium text-gray-500">
                  Order ID
                </span>
                <span className="text-sm font-bold text-gray-800">
                  #{orderData.id}
                </span>
              </div>
              <div className="flex items-center justify-between px-5 py-3.5">
                <span className="text-sm font-medium text-gray-500">
                  Reference
                </span>
                <span className="font-mono text-sm font-semibold text-gray-800">
                  {orderData.reference}
                </span>
              </div>
              <div className="flex items-center justify-between bg-gray-50/60 px-5 py-3.5">
                <span className="text-sm font-medium text-gray-500">Buyer</span>
                <span className="text-sm font-semibold text-gray-800">
                  {orderData.buyerName}
                </span>
              </div>
              <div className="flex items-center justify-between px-5 py-3.5">
                <span className="text-sm font-medium text-gray-500">
                  Payment Status
                </span>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold tracking-wide text-green-700 uppercase">
                  Paid
                </span>
              </div>
              <div className="flex items-center justify-between bg-gray-50/60 px-5 py-4">
                <span className="text-base font-bold text-gray-700">
                  Total Paid
                </span>
                <span className="text-lg font-extrabold text-green-600">
                  Rs. {orderData.totalAmount?.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Link
              to="/my-orders"
              className="w-full rounded-xl bg-green-600 py-3.5 text-center text-sm font-bold text-white shadow-sm hover:bg-green-700"
            >
              View My Orders
            </Link>
            <Link
              to="/"
              className="w-full rounded-xl border border-gray-200 py-3.5 text-center text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes drawCircle { to { stroke-dashoffset: 0; } }
        @keyframes drawCheck  { to { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  );
}
