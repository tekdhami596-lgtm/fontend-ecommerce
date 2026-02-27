import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import NoImage from "../assets/NoImage.png";
import api from "../api/axios";
import cartApi from "../api/cart.api";
import notify from "../helpers/notify";
import { useDispatch, useSelector } from "react-redux";
import { addToCart as addToCartRedux } from "../redux/slice/cartSlice";
import { RootState } from "../redux/store";
import getImageUrl from "../helpers/imageUrl";
import ProductGridSkeleton from "../components/ProductGridSkeleton";

type ProductImage = { path: string };

type Seller = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  storeName?: string;
};

type Category = {
  id: number;
  title: string;
};

type Product = {
  id: number;
  title: string;
  price: number;
  stock: number;
  shortDescription: string;
  description: string;
  images: ProductImage[];
  seller: Seller;
  categories: Category[];
};

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.user.data);
  const isSeller = user?.role === "seller";

  const [product, setProduct] = useState<Product | null>(null);
  const [mainImage, setMainImage] = useState<string>(NoImage);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isNaN(productId)) {
      setLoading(false);
      return;
    }
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${productId}`);
        setProduct(res.data.data);
        setMainImage(res.data.data.images[0]?.path || NoImage);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      notify.error("Please login first");
      // navigate("/login", { state: { from: location.pathname } });
      return;
    }
    if (isSeller) {
      notify.error("Sellers cannot add items to cart");
      return;
    }
    try {
      const res = await cartApi.create({ productId: product.id });
      const cartData = res.data.data;
      dispatch(
        addToCartRedux({
          id: cartData.id,
          productId: product.id,
          title: product.title,
          price: product.price,
          stock: product.stock,
          quantity: cartData.quantity ?? 1,
          image: product.images?.[0]?.path || "",
        }),
      );
      notify.success("Item added to cart successfully");
    } catch (err) {
      console.error("Failed to add to cart", err);
      notify.error("Failed to add to cart");
    }
  };

  if (loading)
    return (
      <p className="mt-20 text-center">
        <ProductGridSkeleton />
      </p>
    );
  if (!product) return <p className="mt-20 text-center">Product not found</p>;

  return (
    <div className="mx-auto max-w-6xl p-4">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="md:w-1/2">
          <img
            src={getImageUrl(mainImage)}
            alt={product.title}
            className="object-fit r h-100 w-full"
          />
          <div className="mt-4 flex gap-2">
            {product.images.map((img, idx) => (
              <img
                key={idx}
                src={getImageUrl(img.path)}
                alt={`Thumbnail ${idx}`}
                onClick={() => setMainImage(img.path)}
                className={`h-20 w-20 cursor-pointer object-contain ${
                  mainImage === img.path ? "border-blue-500" : ""
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between md:w-1/2">
          <div>
            {product.categories?.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {product.categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600"
                  >
                    Category: {cat.title}
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-3xl font-bold">{product.title}</h1>
            <p className="mt-2 text-xl text-green-600">Rs {product.price}</p>
            <p className="mt-2 text-gray-600">Stock: {product.stock}</p>
            <p className="mt-4">{product.shortDescription}</p>
            <p className="mt-4">{product.description}</p>

            <div className="mt-6 rounded border bg-gray-50 p-4">
              <h2 className="text-xl font-semibold">Seller Details</h2>
              {product.seller.storeName && (
                <p className="font-medium text-indigo-600">
                  Store Name: {product.seller.storeName}
                </p>
              )}
              <p>
                Seller Name: {product.seller.firstName}{" "}
                {product.seller.lastName}
              </p>
              <p>Seller email: {product.seller.email}</p>
            </div>
          </div>

          {!isSeller ? (
            <div className="mt-6 flex gap-4">
              <button
                disabled={product.stock === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(product);
                }}
                className="flex-1 cursor-pointer rounded bg-blue-600 py-3 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
              <button
                onClick={() => navigate("/checkout")}
                className="flex-1 cursor-pointer rounded bg-green-600 py-3 text-white transition hover:bg-green-700"
              >
                Buy Now
              </button>
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              You're viewing as a seller. Switch to a buyer account to purchase
              items.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
