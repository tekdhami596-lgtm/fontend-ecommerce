import { useEffect, useState } from "react";
import { Trash2, Upload, Image } from "lucide-react";
import api from "../../api/axios";
import getImageUrl from "../../helpers/imageUrl";
import notify from "../../helpers/notify";

interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  ctaLink?: string;
  ctaText?: string;
  imagePath: string;
  order: number;
}

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    ctaText: "",
    ctaLink: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/banners");
      setBanners(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) return alert("Please select an image");
    if (!form.title.trim()) return alert("Title is required");

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("title", form.title);
      formData.append("subtitle", form.subtitle);
      formData.append("ctaText", form.ctaText);
      formData.append("ctaLink", form.ctaLink);

      await api.post("/admin/banners", formData);

      setForm({ title: "", subtitle: "", ctaText: "", ctaLink: "" });
      setImageFile(null);
      setPreview(null);
      fetchBanners();
      notify.success("Banner Uploaded Successfully");
    } catch (err: any) {
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this banner?")) return;
    try {
      await api.delete(`/admin/banners/${id}`);
      setBanners((prev) => prev.filter((b) => b.id !== id));
      notify.success("Banner deleted successfully");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Carousel Banners</h1>
          <p className="mt-1 text-gray-500">
            Upload and manage homepage banner slides
          </p>
        </div>

        {/* Upload Form */}
        <div className="mb-10 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-gray-700">
            Upload New Banner
          </h2>
          <form onSubmit={handleUpload} className="space-y-4">
            {/* Image Upload Area */}
            <div
              className="relative flex h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 transition hover:border-indigo-400 hover:bg-indigo-50"
              onClick={() =>
                document.getElementById("bannerImageInput")?.click()
              }
            >
              {preview ? (
                <img
                  src={preview}
                  className="h-full w-full rounded-xl object-cover"
                  alt="preview"
                />
              ) : (
                <>
                  <Image size={36} className="mb-2 text-gray-300" />
                  <p className="text-sm text-gray-400">
                    Click to upload banner image
                  </p>
                  <p className="text-xs text-gray-300">
                    Recommended: 1400×500px
                  </p>
                </>
              )}
              <input
                id="bannerImageInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Summer Sale"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) =>
                    setForm({ ...form, subtitle: e.target.value })
                  }
                  placeholder="e.g. Up to 50% off"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Button Text
                </label>
                <input
                  type="text"
                  value={form.ctaText}
                  onChange={(e) =>
                    setForm({ ...form, ctaText: e.target.value })
                  }
                  placeholder="e.g. Shop Now"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Button Link
                </label>
                <input
                  type="text"
                  value={form.ctaLink}
                  onChange={(e) =>
                    setForm({ ...form, ctaLink: e.target.value })
                  }
                  placeholder="e.g. /products"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              <Upload size={18} />
              {uploading ? "Uploading..." : "Upload Banner"}
            </button>
          </form>
        </div>

        {/* Existing Banners */}
        <h2 className="mb-4 text-lg font-bold text-gray-700">
          Current Banners ({banners.length})
        </h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          </div>
        ) : banners.length === 0 ? (
          <div className="rounded-2xl bg-white py-12 text-center shadow-sm">
            <Image size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="text-gray-400">No banners uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm"
              >
                <div className="h-20 w-36 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  <img
                    src={getImageUrl(banner.imagePath)}
                    className="h-full w-full object-cover"
                    alt={banner.title}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{banner.title}</p>
                  {banner.subtitle && (
                    <p className="text-sm text-gray-500">{banner.subtitle}</p>
                  )}
                  {banner.ctaLink && (
                    <p className="mt-1 text-xs text-indigo-400">
                      → {banner.ctaLink}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="cursor-pointer rounded-xl bg-red-50 p-2.5 text-red-500 transition hover:bg-red-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
