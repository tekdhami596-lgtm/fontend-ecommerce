import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { Pencil, Trash2, Plus, ChevronDown, ChevronRight } from "lucide-react";

interface Category {
  id: number;
  title: string;
  parentId: number | null;
  createdBy: number | null;
}

interface Props {
  // "admin" sees all; "seller" sees only own
  viewMode: "admin" | "seller";
}

export default function ManageCategories({ viewMode }: Props) {
  const user = useSelector((state: RootState) => state.user.data);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formParentId, setFormParentId] = useState<number | "">("");
  const [formLoading, setFormLoading] = useState(false);

  // Collapse state for tree view
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  const token = localStorage.getItem("token");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8001/api/categories/flat");
      let data: Category[] = res.data.data;

      // Sellers only see their own
      if (viewMode === "seller") {
        data = data.filter((c) => c.createdBy === user?.id);
      }

      setCategories(data);
    } catch (err) {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setFormTitle("");
    setFormParentId("");
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setFormTitle(cat.title);
    setFormParentId(cat.parentId ?? "");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim()) return;
    setFormLoading(true);

    try {
      if (editingId) {
        // Update
        await axios.patch(
          `http://localhost:8001/api/categories/${editingId}`,
          { title: formTitle },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } else {
        // Create
        await axios.post(
          "http://localhost:8001/api/categories",
          {
            title: formTitle,
            parentId: formParentId || null,
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      }

      setShowForm(false);
      setFormTitle("");
      setFormParentId("");
      setEditingId(null);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save category");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        "Delete this category? Products using it won't be deleted.",
      )
    )
      return;

    try {
      await axios.delete(`http://localhost:8001/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete");
    }
  };

  const toggleCollapse = (id: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Build tree for display
  const parents = categories.filter((c) => c.parentId === null);
  const childrenOf = (parentId: number) =>
    categories.filter((c) => c.parentId === parentId);

  const canDelete = (cat: Category) => {
    if (viewMode === "admin") return true;
    return cat.createdBy === user?.id;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {viewMode === "admin" ? "All Categories" : "My Categories"}
            </h1>
            <p className="mt-1 text-gray-500">
              {categories.length} categor{categories.length === 1 ? "y" : "ies"}
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 font-medium text-white transition hover:bg-purple-700"
          >
            <Plus size={18} />
            Add Category
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {/* Inline Create/Edit Form */}
        {showForm && (
          <div className="mb-6 rounded-xl border border-purple-100 bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              {editingId ? "Edit Category" : "New Category"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Electronics"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {/* Parent category selector — only when creating */}
              {!editingId && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Parent Category (optional)
                  </label>
                  <select
                    value={formParentId}
                    onChange={(e) =>
                      setFormParentId(
                        e.target.value ? Number(e.target.value) : "",
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="">None (top-level category)</option>
                    {categories
                      .filter((c) => c.parentId === null)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={formLoading || !formTitle.trim()}
                  className="flex-1 rounded-lg bg-purple-600 py-2 font-medium text-white transition hover:bg-purple-700 disabled:opacity-50"
                >
                  {formLoading ? "Saving..." : editingId ? "Update" : "Create"}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-lg bg-gray-100 py-2 font-medium text-gray-700 transition hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Category Tree */}
        {categories.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-md">
            <p className="text-lg text-gray-400">No categories yet.</p>
            <p className="mt-1 text-sm text-gray-400">
              Click "Add Category" to create your first one.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow-md">
            {parents.map((parent, idx) => {
              const subs = childrenOf(parent.id);
              const isCollapsed = collapsed.has(parent.id);

              return (
                <div
                  key={parent.id}
                  className={idx !== 0 ? "border-t border-gray-100" : ""}
                >
                  {/* Parent Row */}
                  <div className="group flex items-center justify-between px-5 py-4 hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      {subs.length > 0 && (
                        <button
                          onClick={() => toggleCollapse(parent.id)}
                          className="text-gray-400 hover:text-purple-500"
                        >
                          {isCollapsed ? (
                            <ChevronRight size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </button>
                      )}
                      <span className="font-semibold text-gray-800">
                        {parent.title}
                      </span>
                      {subs.length > 0 && (
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-600">
                          {subs.length} sub
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => openEdit(parent)}
                        className="rounded-lg p-1.5 text-blue-500 hover:bg-blue-50"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      {canDelete(parent) && (
                        <button
                          onClick={() => handleDelete(parent.id)}
                          className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Children */}
                  {!isCollapsed &&
                    subs.map((child) => (
                      <div
                        key={child.id}
                        className="group flex items-center justify-between border-t border-gray-100 bg-gray-50 px-5 py-3 pl-12 hover:bg-purple-50"
                      >
                        <span className="text-sm text-gray-600">
                          └ {child.title}
                        </span>
                        <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => openEdit(child)}
                            className="rounded-lg p-1.5 text-blue-500 hover:bg-blue-50"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          {canDelete(child) && (
                            <button
                              onClick={() => handleDelete(child.id)}
                              className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              );
            })}

            {/* Orphan categories (parentId set but parent not visible) */}
            {categories
              .filter(
                (c) =>
                  c.parentId !== null &&
                  !categories.find((p) => p.id === c.parentId),
              )
              .map((cat) => (
                <div
                  key={cat.id}
                  className="group flex items-center justify-between border-t border-gray-100 px-5 py-4 hover:bg-gray-50"
                >
                  <span className="text-gray-700">{cat.title}</span>
                  <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => openEdit(cat)}
                      className="rounded-lg p-1.5 text-blue-500 hover:bg-blue-50"
                    >
                      <Pencil size={15} />
                    </button>
                    {canDelete(cat) && (
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
