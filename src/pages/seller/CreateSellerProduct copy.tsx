import axios from "axios";
import { useState, type FormEvent, type ChangeEvent } from "react";
import notify from "../../helpers/notify";
import { useNavigate } from "react-router-dom";

type ProductForm = {
  title: string;
  price: string;
  stock: string;
  shortDescription: string;
  description: string;
  images: File[];
};

function CreateSellerProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState<ProductForm>({
    title: "",
    price: "",
    stock: "",
    shortDescription: "",
    description: "",
    images: [],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    price?: string;
    stock?: string;
  }>({});

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setForm((prev) => ({
      ...prev,
      images: Array.from(files),
    }));
  };

  const validate = () => {
    const newErrors: { title?: string; price?: string; stock?: string } = {};

    if (!form.title.trim()) {
      newErrors.title = "Title is required";
    } else if (form.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!form.price) {
      newErrors.price = "Price is required";
    } else if (Number(form.price) <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (!form.stock) {
      newErrors.stock = "Stock is required";
    } else if (Number(form.stock) < 0) {
      newErrors.stock = "Stock cannot be negative";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("price", form.price);
      formData.append("stock", form.stock);
      formData.append("shortDescription", form.shortDescription);
      formData.append("description", form.description);

      form.images.forEach((file) => {
        formData.append("images[]", file);
      });

      await axios.post("http://localhost:8001/api/seller/products", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setForm({
        title: "",
        price: "",
        stock: "",
        shortDescription: "",
        description: "",
        images: [],
      });
      notify.success("Product created successfully");
      navigate("/seller/products");
    } catch (error) {
      console.error(error);
      alert("Error creating product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">
          Create New Product
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Price & Stock Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-500">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              {errors.stock && (
                <p className="mt-1 text-sm text-red-500">{errors.stock}</p>
              )}
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Short Description
            </label>
            <input
              type="text"
              name="shortDescription"
              value={form.shortDescription}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Images */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Product Images
            </label>
            <input
              type="file"
              multiple
              onChange={handleImageChange}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer rounded-lg bg-indigo-600 py-3 font-semibold text-white transition duration-300 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateSellerProduct;
