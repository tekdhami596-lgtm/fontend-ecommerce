import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { clearCart } from "../redux/slice/cartSlice";
import cartApi from "../api/cart.api";
import orderApi, { OrderPayload } from "../api/order.api";
import notify from "../helpers/notify";
import NoImage from "../assets/NoImage.png";
import { useNavigate } from "react-router-dom";

import {
  Trash2,
  ShoppingBag,
  MapPin,
  User,
  FileText,
  CreditCard,
} from "lucide-react";
import getImageUrl from "../helpers/imageUrl";

interface CartItem {
  id: number;
  quantity: number;
  product: {
    id: number;
    title: string;
    price: number;
    stock: number;
    images?: { path: string }[];
  };
}

const PAYMENT_OPTIONS = [
  {
    id: "cash",
    label: "Cash on Delivery",
    icon: () => <span className="text-lg">💵</span>,
  },
  {
    id: "esewa",
    label: "esewa",
    icon: () => (
      <img
        src="https://esewa.com.np/common/images/esewa_logo.png"
        alt="eSewa"
        className="flex h-6 w-auto items-center justify-center object-contain text-black"
      />
    ),
  },

  {
    id: "khalti",
    label: "Khalti",
    icon: () => <span className="text-lg">🟣</span>,
  },
] as const;

export default function Checkout() {
  const dispatch = useDispatch();
  const userProfile = useSelector((state: RootState) => state.user.data);
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "",
    address: "",
    notes: "",
    contact: "",
  });
  const [paymentMode, setPaymentMode] = useState<"cash" | "esewa" | "khalti">(
    "cash",
  );

  const fetchCartItems = async () => {
    try {
      const res = await cartApi.get();
      setCartItems(res.data.data);
    } catch {
      notify.error("Failed to load cart");
    }
  };

  useEffect(() => {
    fetchCartItems();
    if (userProfile) {
      setUserInfo((prev) => ({
        ...prev,
        name: `${userProfile.firstName} ${userProfile.lastName}`,
        address: `${userProfile.deliveryAddress}`,
        contact: `${userProfile.phone}`,
      }));
    }
  }, [userProfile]);

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  const updateCartItemCount = (id: number, quantity: number, stock: number) => {
    if (quantity < 1 || quantity > stock)
      return notify.error("Invalid quantity");
    cartApi.update(id, quantity).then(fetchCartItems);
  };

  const deleteCartItem = (id: number) => {
    cartApi.delete(id).then(fetchCartItems);
    notify.success("Item deleted successfully");
  };

  const placeOrder = async () => {
    if (!userProfile?.id) return notify.error("User not logged in");
    if (!userInfo.name || !userInfo.address)
      return notify.error("Name & address required");
    if (!cartItems.length) return notify.error("Cart is empty");

    setLoading(true);

    try {
      const orderItems = cartItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const payload: OrderPayload = {
        userId: userProfile.id,
        userInfo,
        paymentMode,
        orderItems,
      };

      const res = await orderApi.create(payload);
      const response = res.data.data;

      if (paymentMode === "cash") {
        // ── Cash: clear cart immediately, go to success page ──────────────
        await Promise.all(cartItems.map((item) => cartApi.delete(item.id)));
        dispatch(clearCart());
        setCartItems([]);

        notify.success("Order placed successfully");
        navigate(`/order-success/${response.id}`, {
          state: {
            orderId: response.id,
            BuyerName: response.buyerName,
            Address: userInfo.address,
            reference: response.reference,
            total: totalAmount,
            paymentMode: "cash",
          },
        });
      } else if (paymentMode === "esewa") {
        // ── eSewa: do NOT clear cart yet — only clear after verified payment ─
        // Cart will be cleared in EsewaSuccess.tsx after backend verification
        const esewa = res.data.esewa;

        // Build the form and POST to eSewa
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

        const field = (name: string, value: string | number) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = name;
          input.value = String(value);
          form.appendChild(input);
        };

        field("amount", esewa.total_amount);
        field("tax_amount", esewa.tax_amount ?? 0);
        field("total_amount", esewa.total_amount);
        field("transaction_uuid", esewa.transaction_uuid);
        field("product_code", esewa.product_code);
        field("product_service_charge", 0);
        field("product_delivery_charge", 0);
        // ✅ These must point to your frontend routes for EsewaSuccess / EsewaFailure
        field("success_url", `${window.location.origin}/esewa/success`);
        field("failure_url", `${window.location.origin}/esewa/failure`);
        field("signed_field_names", esewa.signed_field_names);
        field("signature", esewa.signature);

        document.body.appendChild(form);
        form.submit();
      } else if (paymentMode === "khalti") {
        // Khalti integration placeholder — wire similarly when ready
        notify.error("Khalti integration coming soon");
      }
    } catch (err: any) {
      console.error("Order error:", err?.response || err);
      notify.error("Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const hasStockIssue = cartItems.some(
    (item) => item.quantity > item.product.stock,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4">
          <ShoppingBag className="h-5 w-5 text-green-600" />
          <h1 className="text-lg font-bold tracking-tight text-gray-900">
            Checkout
          </h1>
          <span className="ml-auto text-sm text-gray-500">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          {/* LEFT: Cart Items */}
          <div className="flex flex-col gap-4 lg:flex-1">
            <h2 className="text-sm font-semibold tracking-widest text-gray-500 uppercase">
              Your Items
            </h2>

            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-gray-400">
                <ShoppingBag className="mb-3 h-10 w-10 opacity-40" />
                <p className="text-sm">Your cart is empty</p>
              </div>
            ) : (
              <>
                {cartItems.map((el) => (
                  <div
                    key={el.id}
                    className="flex gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-shadow hover:shadow-md sm:gap-4 sm:p-4"
                  >
                    <img
                      src={
                        el.product.images?.[0]?.path
                          ? getImageUrl(el.product.images[0].path)
                          : NoImage
                      }
                      alt={el.product.title}
                      className="h-16 w-16 flex-shrink-0 rounded-xl bg-gray-100 object-cover sm:h-20 sm:w-20"
                    />

                    <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                            {el.product.title}
                          </p>
                          <p className="mt-0.5 text-sm font-bold text-green-600">
                            Rs. {el.product.price.toLocaleString()}
                          </p>
                          {el.quantity > el.product.stock && (
                            <p className="mt-0.5 text-xs text-red-500">
                              Only {el.product.stock} in stock
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => deleteCartItem(el.id)}
                          className="flex-shrink-0 cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1">
                          <button
                            onClick={() =>
                              updateCartItemCount(
                                el.id,
                                el.quantity - 1,
                                el.product.stock,
                              )
                            }
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-white text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-40"
                            disabled={el.quantity <= 1}
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-gray-800">
                            {el.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCartItemCount(
                                el.id,
                                el.quantity + 1,
                                el.product.stock,
                              )
                            }
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-white text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-40"
                            disabled={el.quantity >= el.product.stock}
                          >
                            +
                          </button>
                        </div>
                        <p className="text-sm font-semibold text-gray-700">
                          Rs.{" "}
                          {(el.product.price * el.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <span className="font-medium text-gray-600">Total</span>
                  <span className="text-xl font-bold text-gray-900">
                    Rs. {totalAmount.toLocaleString()}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* RIGHT: Order Details */}
          <div className="flex flex-col gap-4 lg:w-80 xl:w-96">
            <h2 className="text-sm font-semibold tracking-widest text-gray-500 uppercase">
              Delivery & Payment
            </h2>

            <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  <User className="h-3.5 w-3.5" /> Full Name
                </label>
                <input
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none"
                  placeholder="Your full name"
                  value={userInfo.name}
                  onChange={(e) =>
                    setUserInfo({ ...userInfo, name: e.target.value })
                  }
                />
              </div>

              {/* Address */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  <MapPin className="h-3.5 w-3.5" /> Delivery Address
                </label>
                <input
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none"
                  placeholder="Street, City, District"
                  value={userInfo.address}
                  onChange={(e) =>
                    setUserInfo({ ...userInfo, address: e.target.value })
                  }
                />
              </div>

              {/* Contact */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  <MapPin className="h-3.5 w-3.5" /> Delivery Address
                </label>
                <input
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none"
                  placeholder="Street, City, District"
                  value={userInfo.contact}
                  onChange={(e) =>
                    setUserInfo({ ...userInfo, contact: e.target.value })
                  }
                />
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  <FileText className="h-3.5 w-3.5" /> Notes (optional)
                </label>
                <textarea
                  className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-transparent focus:ring-2 focus:ring-green-500 focus:outline-none"
                  placeholder="Any special instructions?"
                  rows={3}
                  value={userInfo.notes}
                  onChange={(e) =>
                    setUserInfo({ ...userInfo, notes: e.target.value })
                  }
                />
              </div>

              {/* Payment method */}
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                  <CreditCard className="h-3.5 w-3.5" /> Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setPaymentMode(option.id)}
                        className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 px-2 py-3 text-xs font-semibold transition-all ${
                          paymentMode === option.id
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <Icon />
                        <span className="text-center leading-tight">
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* eSewa info banner */}
                {paymentMode === "esewa" && (
                  <div className="rounded-xl border border-green-100 bg-green-50 px-3 py-2 text-xs text-green-700">
                    You'll be redirected to eSewa to complete payment. Your
                    order will be confirmed after verification.
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <h3 className="mb-3 text-xs font-semibold tracking-widest text-gray-500 uppercase">
                Summary
              </h3>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>Rs. {totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="mt-1 flex justify-between border-t border-gray-100 pt-2 text-base font-bold text-gray-900">
                  <span>Total</span>
                  <span>Rs. {totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Place Order */}
            <button
              onClick={placeOrder}
              disabled={loading || hasStockIssue || cartItems.length === 0}
              className="w-full cursor-pointer rounded-2xl bg-green-600 py-4 text-base font-bold text-white shadow-md transition-all duration-150 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                    />
                  </svg>
                  {paymentMode === "esewa"
                    ? "Redirecting to eSewa…"
                    : "Processing…"}
                </span>
              ) : paymentMode === "esewa" ? (
                `Pay Rs. ${totalAmount.toLocaleString()} via eSewa`
              ) : (
                `Place Order · Rs. ${totalAmount.toLocaleString()}`
              )}
            </button>

            {hasStockIssue && (
              <p className="-mt-2 text-center text-xs text-red-500">
                Some items exceed available stock. Please adjust quantities.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
