import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { setCart, updateCart, removeFromCart } from "../redux/slice/cartSlice";
import notify from "../helpers/notify";
import cartApi from "../api/cart.api";
import NoImage from "../assets/NoImage.png";
import { Trash2, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import getImageUrl from "../helpers/imageUrl";

export default function Cart() {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await cartApi.get();
        const items = res.data.data.map((c: any) => ({
          id: c.id,
          productId: c.product.id,
          title: c.product.title,
          price: c.product.price,
          stock: c.product.stock,
          quantity: c.quantity,
          image: c.product.images?.[0]?.path || "",
        }));
        dispatch(setCart(items));
      } catch (err) {
        console.error("Failed to fetch cart", err);
        notify.error("Failed to load cart");
      }
    };
    fetchCart();
  }, [dispatch]);

  const handleQuantityChange = async (cartItem: any, quantity: number) => {
    if (quantity < 1 || quantity > cartItem.stock) return;
    try {
      await cartApi.update(cartItem.id, quantity);
      dispatch(updateCart({ id: cartItem.id, quantity }));
    } catch (err) {
      console.error("Failed to update quantity", err);
      notify.error("Failed to update quantity");
    }
  };

  const handleDelete = async (cartItem: any) => {
    try {
      await cartApi.delete(cartItem.id);
      dispatch(removeFromCart(cartItem.id));
      notify.success("Item removed from cart");
    } catch (err) {
      console.error("Failed to delete item", err);
      notify.error("Failed to remove item");
    }
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-6 lg:px-6 lg:py-8">
        {/* Page title */}
        <h1 className="mb-4 text-xl font-bold text-gray-800 sm:mb-6 sm:text-2xl">
          My Cart{" "}
          {cartItems.length > 0 && (
            <span className="ml-1 text-sm font-medium text-gray-400">
              ({cartItems.length} {cartItems.length === 1 ? "item" : "items"})
            </span>
          )}
        </h1>

        {cartItems.length === 0 ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
            <ShoppingCart className="mb-3 h-12 w-12 text-gray-300" />
            <p className="mb-1 font-semibold text-gray-500">
              Your cart is empty
            </p>
            <p className="mb-6 text-sm text-gray-400">
              Add some products to get started
            </p>
            <button
              onClick={() => navigate("/products")}
              className="rounded-xl border-2 border-blue-600 px-6 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-600 hover:text-white"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
            {/* ── Cart Items ── */}
            <div className="flex flex-col gap-3 lg:flex-1">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:gap-4 sm:p-4"
                >
                  {/* Image */}
                  <img
                    src={item.image ? getImageUrl(item.image) : NoImage}
                    alt={item.title}
                    className="h-20 w-20 flex-shrink-0 rounded-xl object-cover sm:h-24 sm:w-24"
                  />

                  {/* Content */}
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                    {/* Top row: title + delete */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-800 sm:text-base">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-blue-600">
                          Rs. {item.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          Stock: {item.stock}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(item)}
                        className="flex-shrink-0 rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Bottom row: qty controls + subtotal */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1">
                        <button
                          onClick={() =>
                            handleQuantityChange(item, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-40"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.stock}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-gray-700">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Order Summary ── */}
            <div className="lg:sticky lg:top-24 lg:w-[340px] xl:w-[380px]">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-gray-800">
                  Order Summary
                </h2>

                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Total Items</span>
                    <span className="font-medium">{totalItems}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-gray-100 pt-3 text-base font-bold text-gray-900">
                    <span>Total</span>
                    <span>Rs. {totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  disabled={cartItems.length === 0}
                  className="mt-5 w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => navigate("/products")}
                  className="mt-2 w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
