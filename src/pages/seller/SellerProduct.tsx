import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import notify from "../../helpers/notify";
import api from "../../api/axios";

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
      const res = await api.get("/seller/products");
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
      await api.delete(`/seller/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      console.error(err);
      notify.error(err.response?.data?.message || "Failed to delete product");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-3 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:gap-4">
          {/* Title row */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                My Products
              </h1>
              <p className="text-sm text-gray-500">
                Total: {filteredProducts.length} products
              </p>
            </div>
            <button
              onClick={() => navigate("/seller/products/create")}
              className="shrink-0 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 sm:px-4 sm:text-base"
            >
              + Add Product
            </button>
          </div>

          {/* Search — full width on all sizes */}
          <input
            type="text"
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none sm:max-w-sm"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <div className="rounded-xl bg-white p-10 text-center shadow-md">
            <p className="text-lg text-gray-500">No products found.</p>
            <button
              onClick={() => navigate("/seller/products/create")}
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Create your first product
            </button>
          </div>
        )}

        {/* Product Grid */}
        {!loading && filteredProducts.length > 0 && (
          <div className="xs:grid-cols-2 grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group flex flex-col rounded-xl bg-white shadow-md transition hover:shadow-xl"
              >
                {/* Image */}
                <div className="relative h-40 overflow-hidden rounded-t-xl bg-gray-200 sm:h-44 md:h-48">
                  {product.images?.length > 0 ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL}/${product.images[0].path}`}
                      alt={product.title}
                      className="object-fit h-full w-full transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-1.5 p-3 sm:gap-2 sm:p-4">
                  <h2 className="truncate text-sm font-semibold text-gray-800 sm:text-base">
                    {product.title}
                  </h2>

                  {/* Description — hidden on mobile */}
                  <p className="line-clamp-2 hidden text-sm text-gray-500 sm:block">
                    {product.shortDescription}
                  </p>

                  {/* Price + Stock */}
                  <div className="mt-auto flex items-center justify-between pt-1 sm:pt-2">
                    <span className="text-sm font-bold text-indigo-600 sm:text-lg">
                      ${product.price}
                    </span>
                    <span
                      className={`text-xs font-medium sm:text-sm ${
                        product.stock > 0 ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {product.stock > 0 ? (
                        <>
                          <span className="sm:hidden">
                            Stock: {product.stock}
                          </span>
                          <span className="hidden sm:inline">
                            In Stock ({product.stock})
                          </span>
                        </>
                      ) : (
                        "Out of Stock"
                      )}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() =>
                        navigate(`/seller/products/edit/${product.id}`)
                      }
                      className="flex-1 cursor-pointer rounded-lg bg-blue-500 py-1.5 text-xs font-medium text-white transition hover:bg-blue-600 sm:py-2 sm:text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 cursor-pointer rounded-lg bg-red-500 py-1.5 text-xs font-medium text-white transition hover:bg-red-600 sm:py-2 sm:text-sm"
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
