import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { fetchAdminStats } from "../../redux/slice/adminSlice ";
import { Link } from "react-router-dom";
import {
  Users,
  Store,
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
} from "lucide-react";

const paymentStatusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  done: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  refund: "bg-purple-100 text-purple-700",
};

const calcTotal = (orderItems: any[]) =>
  orderItems?.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0,
  ) || 0;

export default function AdminDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, loading } = useSelector((state: RootState) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminStats());
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Buyers",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      link: "/admin/users",
    },
    {
      label: "Total Sellers",
      value: stats.totalSellers,
      icon: Store,
      color: "bg-indigo-50 text-indigo-600",
      link: "/admin/sellers",
    },
    {
      label: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "bg-pink-50 text-pink-600",
      link: "/admin/products",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: "bg-orange-50 text-orange-600",
      link: "/admin/orders",
    },
    {
      label: "Total Revenue",
      value: `Rs ${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
      link: "/admin/orders",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="mt-1 text-gray-500">
            Welcome back! Here's what's happening on DokoMart.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {statCards.map((card) => (
            <Link
              key={card.label}
              to={card.link}
              className="group rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    {card.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-800">
                    {card.value}
                  </p>
                </div>
                <div className={`rounded-xl p-3 ${card.color}`}>
                  <card.icon size={20} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs font-medium text-indigo-500 group-hover:underline">
                <TrendingUp size={11} /> View →
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Two Panels */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Orders */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
              <Link
                to="/admin/orders"
                className="text-sm text-indigo-500 hover:underline"
              >
                View all →
              </Link>
            </div>

            {stats.recentOrders.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">
                No orders yet
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        #{order.id} — {order.buyerName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {order.buyer?.email}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        {order.paymentMode} • Ref: {order.reference}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-indigo-600">
                        Rs {calcTotal(order.orderItems).toFixed(2)}
                      </p>
                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                          paymentStatusColor[order.paymentStatus] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sellers Overview */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                Recent Sellers
              </h2>
              <Link
                to="/admin/sellers"
                className="text-sm text-indigo-500 hover:underline"
              >
                View all →
              </Link>
            </div>

            {stats.pendingSellers.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">
                No sellers yet
              </p>
            ) : (
              <div className="space-y-3">
                {stats.pendingSellers.map((seller: any) => (
                  <div
                    key={seller.id}
                    className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                      {seller.firstName[0]}
                      {seller.lastName[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-700">
                        {seller.firstName} {seller.lastName}
                      </p>
                      <p className="truncate text-xs text-gray-400">
                        {seller.email}
                      </p>
                    </div>
                    <Link
                      to="/admin/sellers"
                      className="shrink-0 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-100"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-800">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/categories"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              + Add Category
            </Link>
            <Link
              to="/admin/products"
              className="rounded-xl bg-pink-50 px-5 py-2.5 text-sm font-semibold text-pink-600 transition hover:bg-pink-100"
            >
              View All Products
            </Link>
            <Link
              to="/admin/users"
              className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
            >
              Manage Users
            </Link>
            <Link
              to="/admin/orders"
              className="rounded-xl bg-orange-50 px-5 py-2.5 text-sm font-semibold text-orange-600 transition hover:bg-orange-100"
            >
              View Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
