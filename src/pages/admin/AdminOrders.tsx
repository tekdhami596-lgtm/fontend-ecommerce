import { useEffect, useState } from "react";
import axios from "axios";
import { ShoppingBag } from "lucide-react";

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: { id: number; title: string; price: number };
}

interface Order {
  id: number;
  reference: string;
  paymentStatus: string;
  paymentMode: string;
  buyerName: string;
  address: string;
  notes?: string;
  createdAt: string;
  buyer: { id: number; firstName: string; lastName: string; email: string };
  orderItems: OrderItem[];
}

const PAYMENT_STATUS_OPTIONS = ["pending", "done", "failed", "refund"];

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  done: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  refund: "bg-purple-100 text-purple-700",
};

const calcTotal = (items: OrderItem[]) =>
  items?.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0,
  ) || 0;

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const token = localStorage.getItem("token");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8001/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
        params: { paymentStatus: statusFilter },
      });
      setOrders(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleStatusChange = async (id: number, paymentStatus: string) => {
    try {
      await axios.patch(
        `http://localhost:8001/api/admin/orders/${id}/status`,
        { paymentStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, paymentStatus } : o)),
      );
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">All Orders</h1>
            <p className="mt-1 text-gray-500">{orders.length} orders found</p>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="all">All Payment Status</option>
            {PAYMENT_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl bg-white py-16 text-center shadow-sm">
            <ShoppingBag size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-400">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                {/* Order Row */}
                <div
                  className="flex cursor-pointer flex-wrap items-center justify-between gap-4 px-6 py-5 hover:bg-gray-50"
                  onClick={() =>
                    setExpandedId(expandedId === order.id ? null : order.id)
                  }
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      Order #{order.id}
                      <span className="ml-2 text-xs text-gray-400">
                        Ref: {order.reference}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.buyerName} — {order.buyer?.email}
                    </p>
                    <p className="text-xs text-gray-400">
                      {order.address} • {order.paymentMode} •{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    {order.notes && (
                      <p className="mt-1 text-xs text-gray-400 italic">
                        Note: {order.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="text-lg font-bold text-indigo-600">
                      ${calcTotal(order.orderItems).toFixed(2)}
                    </p>

                    {/* Payment Status Dropdown */}
                    <select
                      value={order.paymentStatus}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value)
                      }
                      className={`cursor-pointer rounded-full border-0 px-3 py-1.5 text-xs font-semibold capitalize focus:ring-2 focus:ring-indigo-500 focus:outline-none ${statusColor[order.paymentStatus] || "bg-gray-100 text-gray-600"}`}
                    >
                      {PAYMENT_STATUS_OPTIONS.map((s) => (
                        <option
                          key={s}
                          value={s}
                          className="bg-white text-gray-800 capitalize"
                        >
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Expanded Order Items */}
                {expandedId === order.id && (
                  <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                    <p className="mb-3 text-xs font-bold text-gray-400 uppercase">
                      Items
                    </p>
                    <div className="space-y-2">
                      {order.orderItems?.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-lg bg-white px-4 py-3"
                        >
                          <p className="text-sm font-medium text-gray-700">
                            {item.product?.title}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Qty: {item.quantity}</span>
                            <span>× ${Number(item.price).toFixed(2)}</span>
                            <span className="font-semibold text-indigo-600">
                              = $
                              {(Number(item.price) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-end px-4 pt-2">
                        <p className="text-sm font-bold text-gray-700">
                          Total: ${calcTotal(order.orderItems).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
