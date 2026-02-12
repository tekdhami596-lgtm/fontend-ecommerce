import { useEffect, useState } from "react";
import axios from "axios";

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
  images: ProductImageType[]; // assuming your API returns URLs
};

function SellerProduct() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:8000/api/seller/products",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        console.log("fetched data:", res.data);
        setProducts(res.data.data); // assuming API returns an array of products
      } catch (err: unknown) {
        console.error(err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Seller Products</h1>
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              <h2>{product.title}</h2>
              <p>Price: ${product.price}</p>
              <p>Stock: {product.stock}</p>
              <p>{product.shortDescription}</p>
              {product.images && product.images.length > 0 && (
                <div>
                  {product.images.map((img, index) => (
                    <img
                      key={index}
                      src={`http://localhost:8000/${img.path}`}
                      alt={product.title}
                      width={100}
                    />
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SellerProduct;
