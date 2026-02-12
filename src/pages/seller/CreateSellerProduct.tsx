import axios from "axios";
import { useState, type FormEvent, type ChangeEvent } from "react";

type ProductForm = {
  title: string;
  price: string;
  stock: string;
  shortDescription: string;
  description: string;
  images: File[];
};

function CreateSellerProduct() {
  const [form, setForm] = useState<ProductForm>({
    title: "",
    price: "",
    stock: "",
    shortDescription: "",
    description: "",
    images: [],
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return; // early return if null

    setForm((prev) => ({
      ...prev,
      images: Array.from(files), // now TypeScript knows it's not null
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

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

      await axios.post("http://localhost:8000/api/seller/products", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Product created successfully");
    } catch (error) {
      console.error(error);
      alert("Error creating product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Create Product</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Title *</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Price</label>
          <input
            type="number"
            step="0.01"
            name="price"
            value={form.price}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Stock</label>
          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Short Description</label>
          <input
            type="text"
            name="shortDescription"
            value={form.shortDescription}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
          />
        </div>

        <div>
          <label>Images</label>
          <input
            type="file"
            multiple
            onChange={handleImageChange} // <-- important!
          />
        </div>

        <div>
          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateSellerProduct;
