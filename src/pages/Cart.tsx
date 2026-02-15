import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { setCart, updateCart, removeFromCart } from "../redux/slice/cartSlice";
import notify from "../helpers/notify";
import cartApi from "../api/cart.api";

export default function Cart() {
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  // Load cart on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await cartApi.get();
        const items = res.data.data.map((c: any) => ({
          id: c.id,
          productId: c.product.id,
          title: c.product.title,
          stock: c.product.stock,
          quantity: c.quantity,
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

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4">
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        cartItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded border p-2"
          >
            <div>
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm text-gray-500">Stock: {item.stock}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleQuantityChange(item, item.quantity - 1)}
                className="border px-2"
              >
                -
              </button>
              <span>{item.quantity}</span>
              <button
                onClick={() => handleQuantityChange(item, item.quantity + 1)}
                className="border px-2"
                disabled={item.quantity >= item.stock}
              >
                +
              </button>
              <button
                onClick={() => handleDelete(item)}
                className="font-semibold text-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
