import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import CategoryCheckboxes from "../../components/CategoryCheckboxes";
import notify from "../../helpers/notify";

interface ImageType {
  id: number;
  path: string;
}

function EditSellerProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    price: "",
    stock: "",
    shortDescription: "",
    description: "",
  });

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [existingImages, setExistingImages] = useState<ImageType[]>([]);
  const [deletedImages, setDeletedImages] = useState<number[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  // Fetch product + its existing categories
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8001/api/seller/products/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        const product = res.data.data;

        setForm({
          title: product.title,
          price: product.price.toString(),
          stock: product.stock.toString(),
          shortDescription: product.shortDescription,
          description: product.description,
        });

        setExistingImages(product.images || []);

        // Pre-select existing category IDs
        if (product.categories && product.categories.length > 0) {
          setSelectedCategoryIds(product.categories.map((c: any) => c.id));
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch product:", err);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setNewImages((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeOldImage = (imageId: number) => {
    setDeletedImages((prev) => [...prev, imageId]);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const removeNewImage = (index: number) => {
    const updated = [...newImages];
    updated.splice(index, 1);
    setNewImages(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedCategoryIds.length === 0) {
      alert("Please select at least one category");
      return;
    }

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    // Send updated category IDs
    selectedCategoryIds.forEach((cid) => {
      formData.append("categoryIds[]", String(cid));
    });

    formData.append("deletedImageIds", JSON.stringify(deletedImages));

    newImages.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const res = await axios.patch(
        `http://localhost:8001/api/seller/products/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      notify.success(res.data.message);
      navigate("/seller/products/");
    } catch (err: any) {
      console.error("Update failed:", err);
      notify.error(err.response?.data?.message || "Failed to update product");
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );

  return (
    <div className="mx-auto mt-10 mb-10 max-w-5xl rounded-2xl bg-white p-8 shadow-xl">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Edit Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="font-semibold text-gray-700">Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="mt-2 w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        {/* Price & Stock */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="font-semibold text-gray-700">Price</label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-gray-300 p-3 focus:outline-none"
            />
          </div>
          <div>
            <label className="font-semibold text-gray-700">Stock</label>
            <input
              name="stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-gray-300 p-3 focus:outline-none"
            />
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="mb-2 block font-semibold text-gray-700">
            Categories * — select all that apply
          </label>
          <CategoryCheckboxes
            selectedIds={selectedCategoryIds}
            onChange={setSelectedCategoryIds}
          />
          {selectedCategoryIds.length > 0 && (
            <p className="mt-1 text-xs text-green-600">
              {selectedCategoryIds.length} categor
              {selectedCategoryIds.length === 1 ? "y" : "ies"} selected
            </p>
          )}
        </div>

        {/* Short Description */}
        <div>
          <label className="font-semibold text-gray-700">
            Short Description
          </label>
          <input
            name="shortDescription"
            value={form.shortDescription}
            onChange={handleChange}
            className="mt-2 w-full rounded-lg border border-gray-300 p-3 focus:outline-none"
          />
        </div>

        {/* Description */}
        <div>
          <label className="font-semibold text-gray-700">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="mt-2 w-full rounded-lg border border-gray-300 p-3 focus:outline-none"
          />
        </div>

        {/* Existing Images */}
        <div>
          <label className="font-semibold text-gray-700">Existing Images</label>
          <div className="mt-3 flex flex-wrap gap-4">
            {existingImages.length === 0 && (
              <p className="text-sm text-gray-400">No existing images</p>
            )}
            {existingImages.map((img) => (
              <div key={img.id} className="relative">
                <img
                  src={`http://localhost:8001/${img.path}`}
                  className="h-28 w-28 rounded-lg object-cover shadow"
                  alt="product"
                />
                <button
                  type="button"
                  onClick={() => removeOldImage(img.id)}
                  className="absolute top-1 right-1 rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* New Images */}
        <div>
          <label className="font-semibold text-gray-700">Add New Images</label>
          <input
            type="file"
            multiple
            onChange={handleNewImages}
            className="mt-2 block"
          />
          <div className="mt-4 flex flex-wrap gap-4">
            {newImages.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  className="h-28 w-28 rounded-lg object-cover shadow"
                  alt="new"
                />
                <button
                  type="button"
                  onClick={() => removeNewImage(index)}
                  className="absolute top-1 right-1 cursor-pointer rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full cursor-pointer rounded-xl bg-purple-600 py-3 font-semibold text-white transition hover:bg-purple-700"
        >
          Update Product
        </button>
      </form>
    </div>
  );
}

export default EditSellerProduct;
