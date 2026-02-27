import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import { fetchCategoryFlat } from "../redux/slice/categorySlice";
import { ChevronDown, ChevronRight, FolderOpen } from "lucide-react";

interface Props {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

function IndeterminateCheckbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      onClick={(e) => e.stopPropagation()}
      className="h-4 w-4 accent-pink-500"
    />
  );
}

function normalizeParent(val: any): number | null {
  if (
    val === null ||
    val === undefined ||
    val === 0 ||
    val === "null" ||
    val === "0"
  )
    return null;
  return Number(val);
}

export default function CategoryCheckboxes({ selectedIds, onChange }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { flat: categories, loading } = useSelector(
    (state: RootState) => state.categories,
  );

  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (categories.length > 0) {
      const parentIds = categories
        .filter((c) =>
          categories.some((ch) => normalizeParent(ch.parentId) === c.id),
        )
        .map((c) => c.id);
      setCollapsed((prev) => {
        const next = { ...prev };
        parentIds.forEach((id) => {
          if (next[id] === undefined) next[id] = true; 
        });
        return next;
      });
    }
  }, [categories]);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategoryFlat());
    }
  }, [categories.length, dispatch]);


  const getChildren = (parentId: number | null) =>
    categories.filter((c) => normalizeParent(c.parentId) === parentId);

  const getAllDescendantIds = (id: number): number[] => {
    const children = getChildren(id);
    return children.flatMap((child) => [
      child.id,
      ...getAllDescendantIds(child.id),
    ]);
  };

  const getAllAncestorIds = (id: number): number[] => {
    const node = categories.find((c) => c.id === id);
    if (!node) return [];
    const parentId = normalizeParent(node.parentId);
    if (parentId === null) return [];
    return [parentId, ...getAllAncestorIds(parentId)];
  };


  const isChecked = (id: number) => selectedIds.includes(id);

  const isIndeterminate = (id: number): boolean => {
    const descendants = getAllDescendantIds(id);
    if (descendants.length === 0) return false;
    const selectedCount = descendants.filter((d) =>
      selectedIds.includes(d),
    ).length;
    return selectedCount > 0 && selectedCount < descendants.length;
  };


  const toggle = (id: number) => {
    const descendants = getAllDescendantIds(id);
    const ancestors = getAllAncestorIds(id);
    let next: number[];

    if (selectedIds.includes(id)) {

      const toRemove = new Set([id, ...descendants]);
      const afterRemove = selectedIds.filter((cid) => !toRemove.has(cid));

      const ancestorsToRemove = ancestors.filter((aid) =>
        getAllDescendantIds(aid).every((d) => !afterRemove.includes(d)),
      );

      next = afterRemove.filter((cid) => !ancestorsToRemove.includes(cid));
    } else {

      const merged = Array.from(new Set([...selectedIds, id, ...descendants]));

      const ancestorsToAdd = ancestors.filter((aid) =>
        getAllDescendantIds(aid).every((d) => merged.includes(d)),
      );

      next = Array.from(new Set([...merged, ...ancestorsToAdd]));
    }

    onChange(next);
  };

  const toggleCollapse = (id: number) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));


  const renderNode = (category: any, level = 0) => {
    const children = getChildren(category.id);
    const hasChildren = children.length > 0;

    const isCollapsedNow = collapsed[category.id] === true;
    const checked = isChecked(category.id);
    const indeterminate = !checked && isIndeterminate(category.id);

    return (
      <div key={category.id}>
        <div
          className="flex cursor-pointer items-center gap-2 py-2.5 hover:bg-pink-50"
          style={{ paddingLeft: 16 + level * 18, paddingRight: 16 }}
          onClick={() =>
            hasChildren ? toggleCollapse(category.id) : toggle(category.id)
          }
        >
          <IndeterminateCheckbox
            checked={checked}
            indeterminate={indeterminate}
            onChange={() => toggle(category.id)}
          />

          {hasChildren && (
            <FolderOpen size={14} className="shrink-0 text-indigo-400" />
          )}

          <span
            className={`flex-1 text-sm ${
              checked
                ? "font-semibold text-pink-600"
                : indeterminate
                  ? "font-medium text-pink-400"
                  : "text-gray-700"
            }`}
          >
            {category.title}
          </span>

          {hasChildren && (
            <span className="text-gray-400 hover:text-gray-600">
              {isCollapsedNow ? (
                <ChevronRight size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </span>
          )}
        </div>

        {hasChildren && !isCollapsedNow && (
          <div>{children.map((child) => renderNode(child, level + 1))}</div>
        )}
      </div>
    );
  };

  const rootCategories = getChildren(null);

  if (loading) {
    return <p className="text-sm text-gray-400">Loading categories…</p>;
  }

  if (categories.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        No categories available. Ask an admin to create some first.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2.5">
        <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
          Select Categories
        </span>
        {selectedIds.length > 0 && (
          <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-semibold text-pink-600">
            {selectedIds.length} selected
          </span>
        )}
      </div>

      {/* Tree */}
      <div className="max-h-64 divide-y divide-gray-50 overflow-y-auto">
        {rootCategories.map((cat) => renderNode(cat))}
      </div>

      {/* Footer */}
      {selectedIds.length > 0 && (
        <div className="border-t border-gray-100 bg-pink-50 px-4 py-2">
          <p className="text-xs text-pink-600">
            <span className="font-semibold">
              {selectedIds.length} categor
              {selectedIds.length !== 1 ? "ies" : "y"}
            </span>{" "}
            selected:{" "}
            {selectedIds
              .map((id) => categories.find((c) => c.id === id)?.title)
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}
