import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

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

  const [existingImages, setExistingImages] = useState<ImageType[]>([]);
  const [deletedImages, setDeletedImages] = useState<number[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  // 🔹 Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      const res = await axios.get(
        `http://localhost:8000/api/seller/products/${id}`,
      );

      const product = res.data.data;

      setForm({
        title: product.title,
        price: product.price,
        stock: product.stock,
        shortDescription: product.shortDescription,
        description: product.description,
      });

      setExistingImages(product.images);
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files]);
  };

  const removeOldImage = (imageId: number) => {
    setDeletedImages([...deletedImages, imageId]);
    setExistingImages(existingImages.filter((img) => img.id !== imageId));
  };

  const removeNewImage = (index: number) => {
    const updated = [...newImages];
    updated.splice(index, 1);
    setNewImages(updated);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    formData.append("deleteImageIds", JSON.stringify(deletedImages));

    newImages.forEach((file) => {
      formData.append("images", file);
    });

    await axios.put(
      `http://localhost:8000/api/seller/products/${id}`,
      formData,
    );

    navigate("/seller/products");
  };

  if (loading) return <p className="mt-10 text-center">Loading...</p>;

  return (
    <div className="mx-auto mt-10 max-w-5xl rounded-2xl bg-white p-8 shadow-xl">
      <h1 className="mb-6 text-3xl font-bold">Edit Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="font-semibold">Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="mt-2 w-full rounded-lg border p-3 focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Price & Stock */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="font-semibold">Price</label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="font-semibold">Stock</label>
            <input
              name="stock"
              type="number"
              value={form.stock}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border p-3"
            />
          </div>
        </div>

        {/* Short Description */}
        <div>
          <label className="font-semibold">Short Description</label>
          <input
            name="shortDescription"
            value={form.shortDescription}
            onChange={handleChange}
            className="mt-2 w-full rounded-lg border p-3"
          />
        </div>

        {/* Description */}
        <div>
          <label className="font-semibold">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="mt-2 w-full rounded-lg border p-3"
          />
        </div>

        {/* Existing Images */}
        <div>
          <label className="font-semibold">Existing Images</label>
          <div className="mt-3 flex flex-wrap gap-4">
            {existingImages.map((img) => (
              <div key={img.id} className="relative">
                <img
                  src={`http://localhost:8000/${img.path}`}
                  className="h-28 w-28 rounded-lg object-cover shadow"
                />
                <button
                  type="button"
                  onClick={() => removeOldImage(img.id)}
                  className="absolute top-1 right-1 rounded bg-red-500 px-2 py-1 text-xs text-white"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Upload New Images */}
        <div>
          <label className="font-semibold">Add New Images</label>
          <input
            type="file"
            multiple
            onChange={handleNewImages}
            className="mt-2"
          />

          <div className="mt-4 flex flex-wrap gap-4">
            {newImages.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  className="h-28 w-28 rounded-lg object-cover shadow"
                />
                <button
                  type="button"
                  onClick={() => removeNewImage(index)}
                  className="absolute top-1 right-1 rounded bg-red-500 px-2 py-1 text-xs text-white"
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
          className="w-full rounded-xl bg-purple-600 py-3 font-semibold text-white transition hover:bg-purple-700"
        >
          Update Product
        </button>
      </form>
    </div>
  );
}

export default EditSellerProduct;
