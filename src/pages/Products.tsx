import axios from "axios";
import { useEffect, useState } from "react";
import NoImageFound from "../assets/NoImage.png";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart as addToCartRedux } from "../redux/slice/cartSlice";
import cartApi from "../api/cart.api";
import notify from "../helpers/notify";

type ProductImage = {
  path: string;
};

type Product = {
  id: number;
  title: string;
  shortDescription: string;
  price: number;
  stock: number;
  images: ProductImage[];
};

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/products/?limit=100",
      );
      setProducts(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = async (product:Product) => {
    try {
      // Call your API to add the product
    const res = await  cartApi.create({ productId:product.id });
    const cartData = res.data.data
    const cartItem = {
      id: cartData.id, // ✅ use cart id from backend (NOT product.id)
      productId: product.id,
      title: product.title,
      price: product.price,
      stock: product.stock,
      quantity: cartData.quantity ?? 1,
      
      image: product.images?.[0]?.path || "", // ✅ REQUIRED FIELD
    };
    
    // Update Redux cart state
    dispatch(addToCartRedux(cartItem));
    notify.success("Item added to cart successfully");
    } catch (err) {
      console.error("Failed to add to cart", err);
      notify.error("Failed to add to cart")
    }
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="group rounded-xl bg-white shadow-md transition hover:shadow-xl"
        >
          <div className="relative h-48 overflow-hidden rounded-t-xl bg-gray-200">
            {product.images?.length > 0 ? (
              <img
                src={`http://localhost:8000/${product.images[0].path}`}
                alt={product.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <img
                  src={NoImageFound}
                  alt="No image"
                  className="h-12 opacity-50"
                />
              </div>
            )}
          </div>

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
            {/* Add to cart button */}
            <button
              disabled={product.stock === 0}
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(product);
              }}
              className={`mt-2 w-full cursor-pointer rounded bg-indigo-600 px-3 py-1 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400`}
            >
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
            <button
              onClick={() => navigate(`/products/${product.id}`)}
              className="mt-1 w-full cursor-pointer rounded border border-indigo-600 px-3 py-1 text-indigo-600 hover:bg-indigo-50"
            >
              View Product Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Products;
