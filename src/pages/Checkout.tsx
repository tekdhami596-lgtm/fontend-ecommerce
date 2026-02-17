import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { clearCart } from "../redux/slice/cartSlice";
import cartApi from "../api/cart.api";
import orderApi, { OrderPayload } from "../api/order.api";
import notify from "../helpers/notify";
import NoImage from "../assets/NoImage.png";
import { useNavigate } from "react-router-dom";

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
  });
  const [paymentMode, setPaymentMode] = useState<"cash" | "esewa" | "khalti">(
    "cash",
  );

  // Fetch cart from backend
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

  const deleteCartItem = (id: number) =>
    cartApi.delete(id).then(fetchCartItems);

  // Place order
  const placeOrder = async () => {
    if (!userProfile?.id) return notify.error("User not logged in");
    if (!userInfo.name || !userInfo.address)
      return notify.error("Name & address required");
    if (!cartItems.length) return notify.error("Cart is empty");

    // setLoading(true);
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
      console.log("Order created:", res.data);
      const response = res.data.data;

      notify.success("Order created successfully");
      dispatch(clearCart());

      if (paymentMode === "cash") {
        navigate(`/order-success/${response.id}`, {
          state: {
            orderId: response.id,
            BuyerName: response.buyerName,
            Address: userInfo.address,
            reference: response.reference,
            total: totalAmount,
          },
        });
      }

      // eSewa payment
      else if (paymentMode === "esewa") {
        const esewa = res.data.esewa;
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

        const createField = (name: string, value: string | number) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = name;
          input.value = String(value);
          form.appendChild(input);
        };

        createField("amount", esewa.total_amount);
        createField("tax_amount", esewa.tax_amount);
        createField("total_amount", esewa.total_amount);
        createField("transaction_uuid", esewa.transaction_uuid);
        createField("product_code", esewa.product_code);
        createField("product_service_charge", 0);
        createField("product_delivery_charge", 0);
        createField("success_url", esewa.success_url);
        createField("failure_url", esewa.failure_url);
        createField("signed_field_names", esewa.signed_field_names);
        createField("signature", esewa.signature);

        document.body.appendChild(form);
        form.submit();
      }
    } catch (err) {
      // @ts-ignore
      console.error("Order error:", err.response || err);
      notify.error("Order failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container grid grid-cols-2 gap-6 p-4">
      <div className="flex flex-col gap-4">
        {cartItems.map((el) => (
          <div key={el.id} className="flex justify-between border p-4 shadow">
            <div className="flex items-center gap-4">
              <img
                src={
                  el.product.images?.[0]?.path
                    ? `http://localhost:8000/${el.product.images[0].path}`
                    : NoImage
                }
                alt={el.product.title}
                className="h-20 w-20 rounded object-cover"
              />
              <div>
                <p className="font-semibold">{el.product.title}</p>
                <p>Rs. {el.product.price}</p>
                <p>Stock: {el.product.stock}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  updateCartItemCount(el.id, el.quantity - 1, el.product.stock)
                }
              ></button>
              <span>{el.quantity}</span>
              <button
                onClick={() =>
                  updateCartItemCount(el.id, el.quantity + 1, el.product.stock)
                }
              >
                +
              </button>
              <button onClick={() => deleteCartItem(el.id)}>🗑</button>
            </div>
          </div>
        ))}
        <h2 className="text-xl font-bold">Total: Rs. {totalAmount}</h2>
      </div>

      <div className="flex flex-col gap-4">
        <input
          className="border p-3"
          placeholder="Name"
          value={userInfo.name}
          onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
        />
        <input
          className="border p-3"
          placeholder="Address"
          value={userInfo.address}
          onChange={(e) =>
            setUserInfo({ ...userInfo, address: e.target.value })
          }
        />
        <textarea
          className="border p-3"
          placeholder="Notes"
          value={userInfo.notes}
          onChange={(e) => setUserInfo({ ...userInfo, notes: e.target.value })}
        />

        {["cash", "esewa", "khalti"].map((mode) => (
          <label key={mode} className="flex gap-2">
            <input
              type="radio"
              checked={paymentMode === mode}
              onChange={() =>
                setPaymentMode(mode as "cash" | "esewa" | "khalti")
              }
            />
            {mode}
          </label>
        ))}

        <button
          onClick={placeOrder}
          disabled={
            loading ||
            cartItems.some((item) => item.quantity > item.product.stock)
          }
          className="rounded bg-green-600 p-3 text-white"
        >
          {loading ? "Processing..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}
