import { useEffect, useState } from "react";
import axios from "axios";
import { Search, Trash2, Users } from "lucide-react";
import api from "../../api/axios";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

const roleColor: Record<string, string> = {
  buyer: "bg-green-100 text-green-700",
  seller: "bg-indigo-100 text-indigo-700",
  admin: "bg-red-100 text-red-700",
};

const TABS = ["all", "buyer", "seller", "admin"] as const;
type Tab = (typeof TABS)[number];

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("all");

  const fetchUsers = async (role: string = activeTab, q: string = search) => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users", {
        params: { search: q, role: role === "all" ? undefined : role },
      });
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(activeTab, search);
  }, [activeTab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(activeTab, search);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this user permanently?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  const tabLabel: Record<Tab, string> = {
    all: "All Users",
    buyer: "Buyers",
    seller: "Sellers",
    admin: "Admins",
  };

  const tabCount = (tab: Tab) => {
    if (tab === "all") return users.length;
    return users.filter((u) => u.role === tab).length;
  };

  const roles: Tab[] =
    activeTab === "all" ? ["admin", "seller", "buyer"] : [activeTab];

  const getUsersByRole = (role: Tab) =>
    activeTab === "all" ? users.filter((u) => u.role === role) : users;

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>
            <p className="mt-1 text-gray-500">{users.length} users found</p>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
              <Search size={16} />
            </button>
          </form>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`-mb-px border-b-2 px-5 py-2.5 text-sm font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tabLabel[tab]}
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                  activeTab === tab
                    ? "bg-indigo-100 text-indigo-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {tabCount(tab)}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {roles.map((role) => {
              const roleUsers = getUsersByRole(role);
              return (
                <div key={role}>
                  {activeTab === "all" && (
                    <div className="mb-3 flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${roleColor[role] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {role}s
                      </span>
                      <span className="text-sm text-gray-400">
                        {roleUsers.length}{" "}
                        {roleUsers.length === 1 ? "user" : "users"}
                      </span>
                    </div>
                  )}

                  <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                        <tr>
                          <th className="px-6 py-4 text-left">User</th>
                          <th className="px-6 py-4 text-left">Role</th>
                          <th className="px-6 py-4 text-left">Joined</th>
                          <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {roleUsers.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="py-12 text-center text-gray-400"
                            >
                              <Users
                                size={36}
                                className="mx-auto mb-2 text-gray-200"
                              />
                              No {role}s found
                            </td>
                          </tr>
                        ) : (
                          roleUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <p className="font-semibold text-gray-800">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {user.email}
                                </p>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${roleColor[user.role] || "bg-gray-100 text-gray-600"}`}
                                >
                                  {user.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-500">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-right">
                                {user.role !== "admin" && (
                                  <button
                                    onClick={() => handleDelete(user.id)}
                                    className="rounded-lg bg-red-50 p-2 text-red-500 transition hover:bg-red-100"
                                    title="Delete user"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
