import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Store } from "lucide-react";
import api from "../../api/axios";

interface Seller {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  storeName?: string;
  businessAddress?: string;
  createdAt: string;
}

export default function AdminSellers() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/sellers");
      setSellers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Remove this seller from the platform?")) return;
    try {
      await api.delete(`/admin/sellers/${id}`);
      setSellers((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Manage Sellers</h1>
          <p className="mt-1 text-gray-500">
            {sellers.length} sellers on the platform
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          </div>
        ) : sellers.length === 0 ? (
          <div className="rounded-2xl bg-white py-16 text-center shadow-sm">
            <Store size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-400">No sellers registered yet</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-4 text-left">Seller</th>
                  <th className="px-6 py-4 text-left">Store</th>
                  <th className="px-6 py-4 text-left">Business Address</th>
                  <th className="px-6 py-4 text-left">Joined</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                          {seller.firstName[0]}
                          {seller.lastName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {seller.firstName} {seller.lastName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {seller.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {seller.storeName || (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {seller.businessAddress || (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(seller.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(seller.id)}
                        className="rounded-lg bg-red-50 p-2 text-red-500 transition hover:bg-red-100"
                        title="Remove seller"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
