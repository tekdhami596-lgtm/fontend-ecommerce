import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Clock,
  AlertTriangle,
  Plus,
  List,
} from "lucide-react";

type LowStockProduct = {
  id: number;
  title: string;
  stock: number;
  price: number;
  images: { path: string }[];
};

type TopProduct = {
  productId: number;
  totalSold: number;
  totalRevenue: number;
  product: {
    id: number;
    title: string;
    price: number;
    images: { path: string }[];
  };
};

type RecentOrder = {
  id: number;
  paymentStatus: string;
  createdAt: string;
  buyer: { firstName: string; lastName: string; email: string };
  orderItems: { product: { title: string }; quantity: number; price: number }[];
};

type DashboardStats = {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: LowStockProduct[];
  topProducts: TopProduct[];
  recentOrders: RecentOrder[];
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  done: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  refund: "bg-purple-100 text-purple-700",
};

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-md">
      <div className={`rounded-full p-3 ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function SellerDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get("/seller/dashboard/stats");
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="rounded-xl bg-white p-8 text-center shadow-md">
          <p className="text-red-500">{error ?? "No data available"}</p>
          <button
            onClick={fetchStats}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Seller Dashboard
            </h1>
            <p className="text-gray-500">
              Welcome back! Here's your store overview.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/seller/products/create")}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
            >
              <Plus size={16} />
              New Product
            </button>
            <button
              onClick={() => navigate("/seller/products")}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-indigo-600 px-4 py-2 font-medium text-indigo-600 hover:bg-indigo-50"
            >
              <List size={16} />
              My Products
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Package size={22} className="text-indigo-600" />}
            label="Total Products"
            value={stats.totalProducts}
            color="bg-indigo-100"
          />
          <StatCard
            icon={<ShoppingCart size={22} className="text-green-600" />}
            label="Total Orders"
            value={stats.totalOrders}
            color="bg-green-100"
          />
          <StatCard
            icon={<DollarSign size={22} className="text-yellow-600" />}
            label="Total Revenue"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            color="bg-yellow-100"
          />
          <StatCard
            icon={<Clock size={22} className="text-red-500" />}
            label="Pending Payments"
            value={stats.pendingOrders}
            color="bg-red-100"
          />
        </div>

        {/* Recent Orders */}
        <div className="rounded-xl bg-white shadow-md">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="px-6 py-8 text-center text-gray-400">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-500">
                  <tr>
                    <th className="px-6 py-3">Order ID</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Payment</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-indigo-600">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4">
                        {order.buyer.firstName} {order.buyer.lastName}
                      </td>
                      <td className="px-6 py-4">
                        {order.orderItems[0]?.product?.title ?? "—"}
                        {order.orderItems.length > 1 &&
                          ` +${order.orderItems.length - 1} more`}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        $
                        {order.orderItems
                          .reduce((sum, item) => sum + Number(item.price), 0)
                          .toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusColors[order.paymentStatus] ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Bottom Section: Low Stock + Top Products */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Low Stock Alerts */}
          <div className="rounded-xl bg-white shadow-md">
            <div className="flex items-center gap-2 border-b px-6 py-4">
              <AlertTriangle size={18} className="text-yellow-500" />
              <h2 className="text-lg font-bold text-gray-800">
                Low Stock Alerts
              </h2>
            </div>
            {stats.lowStockProducts.length === 0 ? (
              <p className="px-6 py-8 text-center text-gray-400">
                All products are well stocked
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {stats.lowStockProducts.map((product) => (
                  <li
                    key={product.id}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-lg bg-gray-100">
                        {product.images?.[0] ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL}/${product.images[0].path}`}
                            alt={product.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-gray-400">
                            N/A
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {product.title}
                        </p>
                        <p className="text-sm text-gray-400">
                          ${product.price}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
                        {product.stock} left
                      </span>
                      <button
                        onClick={() =>
                          navigate(`/seller/products/edit/${product.id}`)
                        }
                        className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                      >
                        Restock
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Top Selling Products */}
          <div className="rounded-xl bg-white shadow-md">
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-bold text-gray-800">
                Top Selling Products
              </h2>
            </div>
            {stats.topProducts.length === 0 ? (
              <p className="px-6 py-8 text-center text-gray-400">
                No sales data yet
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {stats.topProducts.map((item, index) => (
                  <li
                    key={item.productId}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                        {index + 1}
                      </span>
                      <div className="h-10 w-10 overflow-hidden rounded-lg bg-gray-100">
                        {item.product?.images?.[0] ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL}/${item.product.images[0].path}`}
                            alt={item.product.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-gray-400">
                            N/A
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {item.product?.title}
                        </p>
                        <p className="text-sm text-gray-400">
                          {item.totalSold} sold
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-green-600">
                      ${Number(item.totalRevenue).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellerDashboard;
