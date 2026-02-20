import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Search, Package } from "lucide-react";

interface Product {
  id: number;
  title: string;
  price: number;
  stock: number;
  seller: { id: number; firstName: string; lastName: string };
  images: { path: string }[];
  categories: { id: number; title: string }[];
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const token = localStorage.getItem("token");

  const fetchProducts = async (q = "") => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8001/api/admin/products", {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: q },
      });
      setProducts(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(search);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Remove this product from the platform?")) return;
    try {
      await axios.delete(`http://localhost:8001/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">All Products</h1>
            <p className="mt-1 text-gray-500">
              {products.length} products on the platform
            </p>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search products..."
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

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl bg-white py-16 text-center shadow-sm">
            <Package size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-400">No products found</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-4 text-left">Product</th>
                  <th className="px-6 py-4 text-left">Seller</th>
                  <th className="px-6 py-4 text-left">Categories</th>
                  <th className="px-6 py-4 text-left">Price</th>
                  <th className="px-6 py-4 text-left">Stock</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
                          {product.images?.[0] ? (
                            <img
                              src={`http://localhost:8001/${product.images[0].path}`}
                              className="h-full w-full object-cover"
                              alt={product.title}
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-gray-300">
                              No img
                            </div>
                          )}
                        </div>
                        <span className="max-w-[180px] truncate font-medium text-gray-800">
                          {product.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {product.seller?.firstName} {product.seller?.lastName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {product.categories?.slice(0, 2).map((c) => (
                          <span
                            key={c.id}
                            className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600"
                          >
                            {c.title}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-indigo-600">
                      ${product.price}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-medium ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}
                      >
                        {product.stock > 0 ? product.stock : "Out"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="rounded-lg bg-red-50 p-2 text-red-500 transition hover:bg-red-100"
                        title="Remove product"
                      >
                        <Trash2 size={15} />
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
