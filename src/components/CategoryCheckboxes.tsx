import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import { fetchCategoryFlat } from "../redux/slice/categorySlice";

interface Props {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

export default function CategoryCheckboxes({ selectedIds, onChange }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { flat: categories, loading } = useSelector(
    (state: RootState) => state.categories,
  );

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategoryFlat());
    }
  }, []);

  const toggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((cid) => cid !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  // Group by parentId to show parent → children structure
  const parents = categories.filter((c) => c.parentId === null);
  const children = (parentId: number) =>
    categories.filter((c) => c.parentId === parentId);

  if (loading) {
    return <p className="text-sm text-gray-400">Loading categories...</p>;
  }

  if (categories.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        No categories available. Ask an admin or create one first.
      </p>
    );
  }

  return (
    <div className="space-y-2 max-h-48 overflow-y-auto rounded-lg border border-gray-200 p-3">
      {parents.map((parent) => {
        const subs = children(parent.id);
        return (
          <div key={parent.id}>
            {/* Parent label — not selectable if it has children */}
            {subs.length > 0 ? (
              <p className="text-xs font-bold uppercase text-gray-400 mb-1">
                {parent.title}
              </p>
            ) : (
              <label className="flex items-center gap-2 cursor-pointer hover:text-pink-500">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(parent.id)}
                  onChange={() => toggle(parent.id)}
                  className="accent-pink-500 w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">
                  {parent.title}
                </span>
              </label>
            )}

            {/* Children */}
            {subs.map((child) => (
              <label
                key={child.id}
                className="flex items-center gap-2 pl-4 cursor-pointer hover:text-pink-500 mt-1"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(child.id)}
                  onChange={() => toggle(child.id)}
                  className="accent-pink-500 w-4 h-4"
                />
                <span className="text-sm text-gray-600">{child.title}</span>
              </label>
            ))}
          </div>
        );
      })}

      {/* Standalone categories with no parent grouping */}
      {categories
        .filter(
          (c) =>
            c.parentId !== null &&
            !categories.find((p) => p.id === c.parentId),
        )
        .map((cat) => (
          <label
            key={cat.id}
            className="flex items-center gap-2 cursor-pointer hover:text-pink-500"
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(cat.id)}
              onChange={() => toggle(cat.id)}
              className="accent-pink-500 w-4 h-4"
            />
            <span className="text-sm text-gray-600">{cat.id}</span>
          </label>
        ))}
    </div>
  );
}