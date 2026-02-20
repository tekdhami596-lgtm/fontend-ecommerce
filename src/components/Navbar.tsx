import "../index.css";
import { NavLink, useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { useState, useEffect, useRef } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import { fetchCategoryTree, CategoryTree } from "../redux/slice/categorySlice";

type Role = "admin" | "seller" | "buyer" | undefined;

interface NavbarProps {
  role?: Role;
}

const navLinks: Record<NonNullable<Role>, { to: string; label: string }[]> = {
  admin: [
    { to: "/admin/dashboard", label: "Admin Dashboard" },
    { to: "/admin/users", label: "Manage Users" },
    { to: "/admin/products", label: "Manage Products" },
    { to: "/admin/categories", label: "Manage Categories" },
  ],
  seller: [
    { to: "/seller/dashboard", label: "Dashboard" },
    { to: "/seller/products/create", label: "Create Product" },
    { to: "/seller/products", label: "Seller Products" },
    { to: "/seller/categories", label: "Manage Categories" },
  ],
  buyer: [
    { to: "/", label: "Home" },
    { to: "/blog", label: "Blog" },
    { to: "/shop", label: "Shop" },
    { to: "/contact", label: "Contact" },
  ],
};

const roleBadge: Record<NonNullable<Role>, string> = {
  admin: "bg-red-100 text-red-600",
  seller: "bg-indigo-100 text-indigo-600",
  buyer: "bg-green-100 text-green-600",
};

// Recursive subcategory renderer inside dropdown
function SubCategoryList({
  items,
  onSelect,
}: {
  items: CategoryTree[];
  onSelect: (id: number) => void;
}) {
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <ul className="ml-3 border-l border-gray-100 pl-2">
      {items.map((child) => (
        <li key={child.id}>
          <div className="group flex cursor-pointer items-center justify-between rounded px-2 py-1 hover:bg-pink-50">
            <span
              onClick={() => onSelect(child.id)}
              className="text-sm text-gray-600 group-hover:text-pink-500"
            >
              {child.title}
            </span>
            {child.childrens && child.childrens.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenId(openId === child.id ? null : child.id);
                }}
                className="text-gray-400 hover:text-pink-500"
              >
                <ChevronRight
                  size={14}
                  className={`transition-transform ${openId === child.id ? "rotate-90" : ""}`}
                />
              </button>
            )}
          </div>
          {openId === child.id &&
            child.childrens &&
            child.childrens.length > 0 && (
              <SubCategoryList items={child.childrens} onSelect={onSelect} />
            )}
        </li>
      ))}
    </ul>
  );
}

export default function Navbar({ role }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const dispatch = useDispatch<AppDispatch>();
  const { tree: categories, loading: catLoading } = useSelector(
    (state: RootState) => state.categories,
  );

  const resolvedRole: NonNullable<Role> = role ?? "buyer";
  const links = navLinks[resolvedRole];

  // Fetch categories on mount
  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategoryTree());
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategorySelect = (categoryId: number) => {
    navigate(`/products?categoryId=${categoryId}`);
    setCategoryOpen(false);
    setIsOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        {/* Logo + Badge */}
        <div className="flex shrink-0 items-center gap-3">
          <NavLink to="/" className="text-2xl font-bold text-indigo-900">
            Hekto
          </NavLink>
          {role && (
            <span
              className={`hidden rounded-full px-2 py-0.5 text-xs font-semibold capitalize sm:inline-block ${roleBadge[resolvedRole]}`}
            >
              {resolvedRole}
            </span>
          )}
        </div>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-6 font-medium md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive
                  ? "font-semibold text-pink-500"
                  : "text-gray-700 transition-colors hover:text-pink-500"
              }
            >
              {link.label}
            </NavLink>
          ))}

          {/* Categories Dropdown — visible to all roles */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setCategoryOpen(!categoryOpen)}
              className="flex items-center gap-1 font-medium text-gray-700 transition-colors hover:text-pink-500"
            >
              Products
              <ChevronDown
                size={16}
                className={`transition-transform ${categoryOpen ? "rotate-180" : ""}`}
              />
            </button>

            {categoryOpen && (
              <div className="absolute top-8 left-0 max-h-96 w-56 overflow-y-auto rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
                {catLoading ? (
                  <div className="px-4 py-3 text-sm text-gray-400">
                    Loading...
                  </div>
                ) : categories.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-400">
                    No categories yet
                  </div>
                ) : (
                  <>
                    {categories.map((cat) => (
                      <div key={cat.id} className="px-2">
                        <div
                          className="group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 hover:bg-pink-50"
                          onClick={() => handleCategorySelect(cat.id)}
                        >
                          <span className="font-medium text-gray-700 group-hover:text-pink-500">
                            {cat.title}
                          </span>
                          {cat.childrens && cat.childrens.length > 0 && (
                            <ChevronRight size={14} className="text-gray-400" />
                          )}
                        </div>
                        {cat.childrens && cat.childrens.length > 0 && (
                          <SubCategoryList
                            items={cat.childrens}
                            onSelect={handleCategorySelect}
                          />
                        )}
                      </div>
                    ))}
                    <div className="mt-2 border-t px-4 pt-2">
                      <button
                        onClick={() => {
                          navigate("/products");
                          setCategoryOpen(false);
                        }}
                        className="text-sm font-medium text-pink-500 hover:underline"
                      >
                        View All Products →
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="w-full px-5 md:w-auto md:px-0">
          <div className="flex w-full overflow-hidden rounded border md:w-80 lg:w-96">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 text-sm outline-none md:text-base"
            />
            <button
              type="submit"
              className="flex items-center justify-center bg-pink-500 px-3 text-white transition-colors hover:bg-pink-600"
            >
              <CiSearch size={20} />
            </button>
          </div>
        </form>

        {/* Hamburger */}
        <div className="flex shrink-0 items-center md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-pink-500 focus:outline-none"
          >
            {isOpen ? <HiX size={28} /> : <HiMenu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 z-50 flex w-full flex-col items-center gap-4 bg-white py-6 shadow-md md:hidden">
          {role && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${roleBadge[resolvedRole]}`}
            >
              {resolvedRole}
            </span>
          )}
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive ? "font-semibold text-pink-500" : "hover:text-pink-500"
              }
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}

          {/* Mobile categories */}
          <div className="w-full px-6">
            <p className="mb-2 text-xs font-bold text-gray-400 uppercase">
              Categories
            </p>
            {categories.map((cat) => (
              <div key={cat.id}>
                <button
                  onClick={() => handleCategorySelect(cat.id)}
                  className="block w-full py-2 text-left font-medium text-gray-700 hover:text-pink-500"
                >
                  {cat.title}
                </button>
                {cat.childrens?.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => handleCategorySelect(child.id)}
                    className="block w-full py-1 pl-4 text-left text-sm text-gray-500 hover:text-pink-500"
                  >
                    └ {child.title}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
