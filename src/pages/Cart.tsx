import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { setCart, updateCart, removeFromCart } from "../redux/slice/cartSlice";
import notify from "../helpers/notify";
import cartApi from "../api/cart.api";
import NoImage from "../assets/NoImage.png";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import getImageUrl from "../helpers/imageUrl";

export default function Cart() {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const navigate = useNavigate();

  // Load cart on mount
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

  // Handle quantity change
  const handleQuantityChange = async (cartItem: any, quantity: number) => {
    if (quantity < 1 || quantity > cartItem.stock) return;

    try {
      // Update backend
      await cartApi.update(cartItem.id, quantity);

      // Update Redux
      dispatch(updateCart({ id: cartItem.id, quantity }));
    } catch (err) {
      console.error("Failed to update quantity", err);
      notify.error("Failed to update quantity");
    }
  };

  // Handle delete
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
    <div className="mx-auto grid max-w-7xl gap-6 p-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        {cartItems.length === 0 ? (
          <p className="text-center text-gray-600">
            Your cart is empty.
            <br />
            <button
              onClick={() => navigate("/products")}
              className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-md border border-blue-600 px-6 py-2 font-semibold text-blue-600 transition hover:bg-blue-600 hover:text-white"
            >
              Continue Shopping
            </button>
          </p>
        ) : (
          cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded border p-2"
            >
              <div className="flex items-center gap-4">
                <div>
                  <img
                    src={item.image ? getImageUrl(item.image) : NoImage}
                    alt={item.title}
                    className="h-16 w-16 rounded border object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-gray-500">Stock: {item.stock}</p>
                </div>
              </div>

              <div>
                <p className="font-semibold">${item.price}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuantityChange(item, item.quantity - 1)}
                  className="cursor-pointer border px-2"
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item, item.quantity + 1)}
                  className="cursor-pointer border px-2"
                  disabled={item.quantity >= item.stock}
                >
                  +
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="cursor-pointer font-semibold text-red-500"
                >
                  <Trash2 />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="h-fit rounded-lg border bg-white p-5 shadow-sm lg:sticky lg:top-24">
        <h1 className="mb-2 text-xl font-bold">Order Summary</h1>

        <div className="mb-2 flex justify-between">
          <span>Total Items:</span>
          <span>{totalItems}</span>
        </div>

        <div className="mb-4 flex justify-between text-lg font-semibold">
          <span>Total Amount:</span>
          <span>${totalAmount.toFixed(2)}</span>
        </div>

        <button
          onClick={() => navigate("/checkout")}
          disabled={cartItems.length === 0}
          className="w-full cursor-pointer rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          Proceed to checkout
        </button>
      </div>
    </div>
  );
}
