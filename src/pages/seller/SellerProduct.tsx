import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type ProductImageType = {
  path: string;
};

type Product = {
  id: number;
  title: string;
  price: number;
  stock: number;
  shortDescription: string;
  description: string;
  images: ProductImageType[];
};

function SellerProduct() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter((product) =>
      product.title.toLowerCase().includes(search.toLowerCase()),
    );
    setFilteredProducts(filtered);
  }, [search, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:8000/api/seller/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts(res.data.data);
      setFilteredProducts(res.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?",
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8000/api/seller/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Products</h1>
            <p className="text-gray-500">
              Total Products: {filteredProducts.length}
            </p>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />

            <button
              onClick={() => navigate("/seller/products/create")}
              className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700"
            >
              + Add Product
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-100 p-4 text-red-600">{error}</div>
        )}

        {/* Product Grid */}
        {!loading && filteredProducts.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-md">
            <p className="text-lg text-gray-500">No products found.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group rounded-xl bg-white shadow-md transition hover:shadow-xl"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden rounded-t-xl bg-gray-200">
                  {product.images?.length > 0 ? (
                    <img
                      src={`http://localhost:8000/${product.images[0].path}`}
                      alt={product.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-2 p-4">
                  <h2 className="truncate text-lg font-semibold text-gray-800">
                    {product.title}
                  </h2>

                  <p className="line-clamp-2 text-sm text-gray-500">
                    {product.shortDescription}
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-bold text-indigo-600">
                      ${product.price}
                    </span>

                    <span
                      className={`text-sm font-medium ${
                        product.stock > 0 ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {product.stock > 0
                        ? `In Stock (${product.stock})`
                        : "Out of Stock"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3">
                    <button
                      onClick={() =>
                        navigate(`/seller/products/edit/${product.id}`)
                      }
                      className="flex-1 cursor-pointer rounded-lg bg-blue-500 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 cursor-pointer rounded-lg bg-red-500 py-2 text-sm font-medium text-white transition hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerProduct;
