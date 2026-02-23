import "../index.css";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { IoCartOutline } from "react-icons/io5";
import { useState, useEffect, useRef } from "react";
import { HiMenu, HiX } from "react-icons/hi";
import {
  ChevronDown,
  ChevronRight,
  LogOut,
  User,
  LayoutDashboard,
  UserCircle,
  ShoppingBag,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import { fetchCategoryTree, CategoryTree } from "../redux/slice/categorySlice";
import { logoutUser } from "../redux/slice/userSlice";
import doko from "../assets/Doko-logo.png";

/* ─── Styles injected once ─────────────────────────────────────────────── */
const navStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

  .nav-root {
    font-family: 'DM Sans', sans-serif;
  }
  .nav-root .brand-name {
    font-family: 'Sora', sans-serif;
  }

  /* Glassmorphism dropdown */
  .nav-dropdown {
    background: rgba(255,255,255,0.96);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.6);
    box-shadow: 0 20px 60px -12px rgba(15,23,42,0.18), 0 0 0 1px rgba(0,0,0,0.04);
  }

  /* Subtle noise texture on nav */
  .nav-bg {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%);
    position: relative;
  }
  .nav-bg::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
    opacity: 0.4;
  }

  /* Active nav link glow */
  .nav-link-active {
    background: rgba(99,102,241,0.18);
    color: #a5b4fc;
    box-shadow: inset 0 0 0 1px rgba(99,102,241,0.3);
  }
  .nav-link-idle {
    color: rgba(203,213,225,0.85);
  }
  .nav-link-idle:hover {
    background: rgba(255,255,255,0.07);
    color: #e2e8f0;
  }

  /* Cart badge pulse */
  @keyframes badge-pop {
    0%   { transform: scale(1); }
    50%  { transform: scale(1.25); }
    100% { transform: scale(1); }
  }
  .cart-badge { animation: badge-pop 0.35s ease; }

  /* Search focus ring */
  .search-input:focus-within {
    box-shadow: 0 0 0 3px rgba(99,102,241,0.3), 0 1px 3px rgba(0,0,0,0.3);
  }

  /* Dropdown item hover */
  .drop-item:hover {
    background: linear-gradient(90deg, rgba(99,102,241,0.08) 0%, transparent 100%);
    color: #6366f1;
  }

  /* Stagger fade-in for mobile menu */
  @keyframes slide-down {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .mobile-menu { animation: slide-down 0.2s ease forwards; }

  /* Category dropdown animate */
  @keyframes dropdown-in {
    from { opacity: 0; transform: translateY(6px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .dropdown-animate { animation: dropdown-in 0.18s ease forwards; }

  /* Scrollbar in category list */
  .cat-scroll::-webkit-scrollbar { width: 4px; }
  .cat-scroll::-webkit-scrollbar-track { background: transparent; }
  .cat-scroll::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 4px; }

  /* Avatar ring on hover */
  .avatar-btn:hover .avatar-ring {
    box-shadow: 0 0 0 2px #6366f1;
  }

  /* Logo hover */
  .logo-icon {
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  .logo-wrap:hover .logo-icon { transform: rotate(-8deg) scale(1.1); }
`;

/* ─── Types ─────────────────────────────────────────────────────────────── */
type Role = "admin" | "seller" | "buyer" | undefined;

const navLinks: Record<NonNullable<Role>, { to: string; label: string }[]> = {
  admin: [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/products", label: "Products" },
    { to: "/admin/categories", label: "Categories" },
    { to: "/admin/banners", label: "Banners" },
  ],
  seller: [
    { to: "/seller/dashboard", label: "Dashboard" },
    { to: "/seller/products/create", label: "Create Product" },
    { to: "/seller/products", label: "My Products" },
  ],
  buyer: [
    { to: "/", label: "Home" },
    { to: "/products", label: "Shop" },
  ],
};

/* ─── Debounce ───────────────────────────────────────────────────────────── */
function useDebounce<T>(value: T, delay = 400): T {
  const [dv, setDv] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return dv;
}

/* ─── SubCategoryList ────────────────────────────────────────────────────── */
function SubCategoryList({
  items,
  onSelect,
}: {
  items: CategoryTree[];
  onSelect: (id: number) => void;
}) {
  const [openId, setOpenId] = useState<number | null>(null);
  return (
    <ul className="ml-3 border-l border-indigo-100/60 pl-2">
      {items.map((child) => (
        <li key={child.id}>
          <div className="drop-item group flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 transition-all duration-150">
            <span
              onClick={() => onSelect(child.id)}
              className="text-sm text-slate-500 group-hover:text-indigo-600"
            >
              {child.title}
            </span>
            {child.childrens && child.childrens.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenId(openId === child.id ? null : child.id);
                }}
                className="text-slate-300 transition-colors hover:text-indigo-400"
              >
                <ChevronRight
                  size={12}
                  className={`transition-transform duration-200 ${openId === child.id ? "rotate-90" : ""}`}
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

/* ─── Navbar ─────────────────────────────────────────────────────────────── */
export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((s: RootState) => s.user.data);
  const cartItems = useSelector((s: RootState) => s.cart.items);
  const { tree: categories, loading: catLoading } = useSelector(
    (s: RootState) => s.categories,
  );

  const totalQty = cartItems.reduce((a, i) => a + i.quantity, 0);
  const role = user?.role;
  const resolvedRole: NonNullable<Role> = role ?? "buyer";
  const isBuyer = !role || role === "buyer";
  const isAdmin = role === "admin";
  const isSeller = role === "seller";
  const links = navLinks[resolvedRole];

  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const debouncedSearch = useDebounce(search, 400);
  const categoryRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategoryTree());
  }, []);

  useEffect(() => {
    if (debouncedSearch.trim())
      navigate(
        `/products?search=${encodeURIComponent(debouncedSearch.trim())}`,
      );
  }, [debouncedSearch]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(e.target as Node)
      )
        setCategoryOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node))
        setUserOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCategorySelect = (id: number) => {
    navigate(`/products?categoryId=${id}`);
    setCategoryOpen(false);
    setMobileOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    setUserOpen(false);
    navigate("/login");
  };

  const getInitials = () => {
    if (!user?.firstName) return "U";
    return `${user.firstName[0]}${user.lastName?.[0] ?? ""}`.toUpperCase();
  };

  const roleBadge = isAdmin
    ? "bg-rose-500/10 text-rose-400 ring-1 ring-rose-400/30"
    : isSeller
      ? "bg-violet-500/10 text-violet-400 ring-1 ring-violet-400/30"
      : "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-400/30";

  const roleLabel = isAdmin ? "Admin" : isSeller ? "Seller" : "Buyer";

  return (
    <>
      <style>{navStyles}</style>

      <nav className="nav-root nav-bg sticky top-0 z-50 border-b border-white/5">
        <div className="relative mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <NavLink
            to="/"
            className="logo-wrap mr-2 flex shrink-0 items-center gap-2.5"
          >
            <div className="logo-icon flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-black text-white shadow-lg shadow-indigo-900/50">
              <img src={doko} />
            </div>
            <span className="brand-name text-[35px] font-extrabold tracking-tight text-white">
              Doko
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-[20px] text-transparent">
                mart
              </span>
            </span>
          </NavLink>

          <div className="hidden items-center gap-0.5 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                    isActive ? "nav-link-active" : "nav-link-idle"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="relative" ref={categoryRef}>
              <button
                onClick={() => setCategoryOpen(!categoryOpen)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                  categoryOpen ? "nav-link-active" : "nav-link-idle"
                }`}
              >
                Categories
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${categoryOpen ? "rotate-180" : ""}`}
                />
              </button>

              {categoryOpen && (
                <div className="nav-dropdown dropdown-animate cat-scroll absolute top-11 left-0 z-50 max-h-96 w-64 overflow-y-auto rounded-2xl py-2">
                  {catLoading ? (
                    <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-400">
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
                      Loading…
                    </div>
                  ) : categories.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-slate-400">
                      No categories yet
                    </p>
                  ) : (
                    <>
                      {categories.map((cat) => (
                        <div key={cat.id} className="px-2">
                          <div
                            className="drop-item group flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 transition-all duration-150"
                            onClick={() => handleCategorySelect(cat.id)}
                          >
                            <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600">
                              {cat.title}
                            </span>
                            {cat.childrens && cat.childrens.length > 0 && (
                              <ChevronRight
                                size={13}
                                className="text-slate-300 group-hover:text-indigo-400"
                              />
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
                      <div className="mt-1 border-t border-slate-100 px-4 pt-2 pb-1">
                        <button
                          onClick={() => {
                            navigate("/products");
                            setCategoryOpen(false);
                          }}
                          className="text-xs font-semibold text-indigo-500 transition-colors hover:text-indigo-700"
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

          {/* ── Search ── */}
          <form
            onSubmit={handleSearch}
            className="hidden max-w-xs flex-1 md:block lg:max-w-sm"
          >
            <div
              className={`search-input flex overflow-hidden rounded-xl border transition-all duration-200 ${
                searchFocused
                  ? "border-indigo-500/60 bg-white/10"
                  : "border-white/10 bg-white/6 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              <input
                type="text"
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="flex-1 bg-transparent px-4 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-500"
              />
              <button
                type="submit"
                className="flex items-center justify-center bg-indigo-600 px-3.5 text-white transition hover:bg-indigo-500"
              >
                <CiSearch size={18} />
              </button>
            </div>
          </form>

          {/* ── Right Actions ── */}
          <div className="ml-auto flex items-center gap-2">
            {/* Cart */}
            {isBuyer && (
              <Link
                to="/cart"
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-indigo-400/50 hover:bg-indigo-500/10 hover:text-indigo-300"
              >
                <IoCartOutline size={18} />
                {totalQty > 0 && (
                  <span className="cart-badge absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-[9px] font-bold text-white shadow shadow-pink-900/50">
                    {totalQty}
                  </span>
                )}
              </Link>
            )}

            {/* User dropdown / Login */}
            {user ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserOpen(!userOpen)}
                  className="avatar-btn flex items-center gap-2 rounded-xl border border-white/10 bg-white/6 px-2.5 py-1.5 text-sm font-medium text-slate-200 transition hover:border-indigo-400/40 hover:bg-white/10"
                >
                  <div className="avatar-ring flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-[10px] font-bold text-white transition-all duration-200">
                    {getInitials()}
                  </div>
                  <span className="hidden max-w-[80px] truncate sm:block">
                    {user.firstName}
                  </span>
                  <ChevronDown
                    size={12}
                    className={`text-slate-400 transition-transform duration-200 ${userOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {userOpen && (
                  <div className="nav-dropdown dropdown-animate absolute top-12 right-0 z-50 w-64 rounded-2xl">
                    {/* Profile header */}
                    <div className="border-b border-slate-100/70 px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-md shadow-indigo-200">
                          {getInitials()}
                        </div>
                        <div className="overflow-hidden">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="truncate text-xs text-slate-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`mt-2.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${roleBadge}`}
                      >
                        {roleLabel}
                      </span>
                    </div>

                    {/* Menu */}
                    <div className="p-1.5">
                      <Link
                        to="/my-account"
                        onClick={() => setUserOpen(false)}
                        className="drop-item flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition-all"
                      >
                        <UserCircle size={14} className="text-slate-400" /> My
                        Account
                      </Link>
                      {isBuyer && (
                        <Link
                          to="/my-orders"
                          onClick={() => setUserOpen(false)}
                          className="drop-item flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition-all"
                        >
                          <ShoppingBag size={14} className="text-slate-400" />{" "}
                          My Orders
                        </Link>
                      )}
                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserOpen(false)}
                          className="drop-item flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition-all"
                        >
                          <LayoutDashboard
                            size={14}
                            className="text-slate-400"
                          />{" "}
                          Admin Dashboard
                        </Link>
                      )}
                      {isSeller && (
                        <Link
                          to="/seller/dashboard"
                          onClick={() => setUserOpen(false)}
                          className="drop-item flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition-all"
                        >
                          <LayoutDashboard
                            size={14}
                            className="text-slate-400"
                          />{" "}
                          Seller Dashboard
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 p-1.5">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-500 transition hover:bg-rose-50"
                      >
                        <LogOut size={14} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:from-indigo-400 hover:to-violet-500 hover:shadow-indigo-700/50"
              >
                <User size={13} /> Login
              </Link>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 md:hidden"
            >
              {mobileOpen ? <HiX size={17} /> : <HiMenu size={17} />}
            </button>
          </div>
        </div>

        {/* ── Mobile Search ── */}
        <div className="border-t border-white/5 px-4 py-2.5 md:hidden">
          <form onSubmit={handleSearch}>
            <div className="flex overflow-hidden rounded-xl border border-white/10 bg-white/6">
              <input
                type="text"
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent px-4 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-500"
              />
              <button
                type="submit"
                className="flex items-center justify-center bg-indigo-600 px-4 text-white transition hover:bg-indigo-500"
              >
                <CiSearch size={18} />
              </button>
            </div>
          </form>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileOpen && (
          <div
            className="mobile-menu border-t border-white/5 px-4 py-4 md:hidden"
            style={{ background: "rgba(15,23,42,0.98)" }}
          >
            <div className="mb-3 flex flex-col gap-1">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                      isActive ? "nav-link-active" : "nav-link-idle"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            <div className="border-t border-white/5 pt-4">
              <p className="mb-2 px-1 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                Categories
              </p>
              <div className="flex flex-col gap-0.5">
                {categories.map((cat) => (
                  <div key={cat.id}>
                    <button
                      onClick={() => handleCategorySelect(cat.id)}
                      className="nav-link-idle w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-all hover:bg-white/5"
                    >
                      {cat.title}
                    </button>
                    {cat.childrens?.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => handleCategorySelect(child.id)}
                        className="nav-link-idle w-full rounded-xl py-2 pl-8 text-left text-sm transition-all hover:bg-white/5"
                        style={{ color: "rgba(148,163,184,0.7)" }}
                      >
                        └ {child.title}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
