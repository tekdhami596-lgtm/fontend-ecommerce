import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, updateProfile, selectUser } from "../redux/slice/userSlice";
import api from "../api/axios";
import notify from "../helpers/notify";
import {
  User,
  ShoppingBag,
  MapPin,
  Lock,
  LogOut,
  ChevronRight,
  Package,
  Pencil,
  Plus,
  Eye,
  EyeOff,
  Bell,
} from "lucide-react";
import Orders from "./Orders";

// ── Types ──────────────────────────────────────────────
type Tab = "profile" | "orders" | "addresses" | "password" | "notifications";

// ── Helpers ────────────────────────────────────────────
const getInitials = (firstName?: string, lastName?: string) => {
  if (!firstName && !lastName) return "?";
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
};

// ── ProfileSection ─────────────────────────────────────
const ProfileSection = () => {
  const dispatch = useDispatch();
  const reduxUser = useSelector(selectUser);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    deliveryAddress: "",
    storeName: "",
    businessAddress: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/auth/profile");
        const mapped = {
          firstName: data.first_name ?? data.firstName ?? "",
          lastName: data.last_name ?? data.lastName ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          dateOfBirth: data.date_of_birth ?? data.dateOfBirth ?? "",
          gender: data.gender ?? "",
          deliveryAddress: data.delivery_address ?? data.deliveryAddress ?? "",
          storeName: data.store_name ?? data.storeName ?? "",
          businessAddress: data.business_address ?? data.businessAddress ?? "",
        };
        setForm(mapped);
        dispatch(updateProfile(mapped));
      } catch {
        notify.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleCancel = () => {
    setForm({
      firstName: reduxUser?.firstName ?? "",
      lastName: reduxUser?.lastName ?? "",
      email: reduxUser?.email ?? "",
      phone: reduxUser?.phone ?? "",
      dateOfBirth: reduxUser?.dateOfBirth ?? "",
      gender: reduxUser?.gender ?? "",
      deliveryAddress: reduxUser?.deliveryAddress ?? "",
      storeName: reduxUser?.storeName ?? "",
      businessAddress: reduxUser?.businessAddress ?? "",
    });
    setEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/auth/profile", {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || null,
        dateOfBirth: form.dateOfBirth || null,
        gender: form.gender || null,
        ...(reduxUser?.role === "buyer" && {
          deliveryAddress: form.deliveryAddress || null,
        }),
      });
      const mapped = {
        firstName: data.first_name ?? data.firstName ?? "",
        lastName: data.last_name ?? data.lastName ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        dateOfBirth: data.date_of_birth ?? data.dateOfBirth ?? "",
        gender: data.gender ?? "",
        deliveryAddress: data.delivery_address ?? data.deliveryAddress ?? "",
        storeName: data.store_name ?? data.storeName ?? "",
        businessAddress: data.business_address ?? data.businessAddress ?? "",
      };
      setForm(mapped);
      dispatch(updateProfile(mapped));
      notify.success("Profile updated successfully!");
      setEditing(false);
    } catch (err: any) {
      notify.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-gray-400">Loading profile...</p>
      </div>
    );

  const initials = getInitials(form.firstName, form.lastName);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
          <p className="text-sm text-gray-500">
            Manage your personal information
          </p>
        </div>
        <button
          onClick={editing ? handleCancel : () => setEditing(true)}
          className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
        >
          <Pencil size={14} />
          {editing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      {/* Avatar */}
      <div className="mb-8 flex items-center gap-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 text-2xl font-extrabold text-white shadow">
          {initials}
        </div>
        <div>
          <p className="font-bold text-gray-900">
            {form.firstName} {form.lastName}
          </p>
          <p className="text-sm text-gray-500">{form.email}</p>
          <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            {reduxUser?.role
              ? reduxUser.role.charAt(0).toUpperCase() + reduxUser.role.slice(1)
              : ""}
          </span>
        </div>
      </div>

      {/* Form */}
      <div className="grid gap-5 sm:grid-cols-2">
        {[
          { label: "First Name", key: "firstName" },
          { label: "Last Name", key: "lastName" },
          { label: "Email Address", key: "email", disabled: true },
          { label: "Phone Number", key: "phone" },
          { label: "Date of Birth", key: "dateOfBirth", type: "date" },
        ].map((field) => (
          <div key={field.key}>
            <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
              {field.label}
            </label>
            <input
              type={field.type || "text"}
              value={form[field.key as keyof typeof form]}
              disabled={!editing || field.disabled}
              onChange={(e) =>
                setForm({ ...form, [field.key]: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        ))}

        <div>
          <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Gender
          </label>
          <select
            value={form.gender}
            disabled={!editing}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Buyer — editable delivery address */}
        {reduxUser?.role === "buyer" && (
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Delivery Address
            </label>
            <input
              type="text"
              value={form.deliveryAddress}
              disabled={!editing}
              onChange={(e) =>
                setForm({ ...form, deliveryAddress: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        )}

        {/* Seller — read-only store info */}
        {reduxUser?.role === "seller" && (
          <>
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Store Name
              </label>
              <input
                type="text"
                value={form.storeName}
                readOnly
                onChange={() => {}}
                className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 opacity-60"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Business Address
              </label>
              <input
                type="text"
                value={form.businessAddress}
                readOnly
                onChange={() => {}}
                className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 opacity-60"
              />
            </div>
          </>
        )}
      </div>

      {editing && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 rounded-lg bg-indigo-600 px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      )}
    </div>
  );
};

// ── OrdersSection (no backend yet) ────────────────────
const OrdersSection = () => (
  <div>
    <div className="mb-6">
      <h2 className="text-xl font-bold text-gray-900">My Orders</h2>
      <p className="text-sm text-gray-500">Track and manage your orders</p>
    </div>
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <Package size={48} className="mb-3 opacity-30" />
      <p className="text-sm">No orders yet</p>
    </div>
  </div>
);

const AddressesSection = () => {
  const reduxUser = useSelector(selectUser);
  const deliveryAddress = reduxUser?.deliveryAddress ?? "";

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">My Addresses</h2>
        <p className="text-sm text-gray-500">Your saved delivery address</p>
      </div>

      {deliveryAddress ? (
        <div className="relative rounded-xl border-2 border-indigo-400 bg-indigo-50/40 p-5">
          <span className="absolute top-3 right-3 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
            Default
          </span>
          <div className="mb-3 flex items-center gap-2">
            <MapPin size={16} className="text-indigo-500" />
            <span className="text-sm font-bold text-gray-700">
              Delivery Address
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            Buyer Name: {reduxUser?.firstName} {reduxUser?.lastName}
          </p>
          <p className="text-sm text-gray-500">Address: {deliveryAddress}</p>
          {reduxUser?.phone && (
            <p className="text-sm text-gray-500">
              Contact Number: {reduxUser.phone}
            </p>
          )}
          {reduxUser?.email && (
            <p className="text-sm text-gray-500">
              Contact Number: {reduxUser.email}
            </p>
          )}
          <p className="mt-3 text-xs text-gray-400">
            To update this address, go to{" "}
            <span className="font-medium text-indigo-500">My Profile</span> and
            edit your delivery address there.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <MapPin size={48} className="mb-3 opacity-30" />
          <p className="text-sm">No saved address</p>
          <p className="mt-1 text-xs text-gray-400">
            Add a delivery address in your profile
          </p>
        </div>
      )}
    </div>
  );
};
// ── PasswordSection ────────────────────────────────────
const PasswordSection = () => {
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [form, setForm] = useState({ current: "", new: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (form.new !== form.confirm) {
      notify.error("New passwords do not match");
      return;
    }
    if (form.new.length < 6) {
      notify.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword: form.current,
        newPassword: form.new,
      });
      notify.success("Password updated successfully!");
      setForm({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      notify.error(err?.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
        <p className="text-sm text-gray-500">Keep your account secure</p>
      </div>
      <div className="max-w-md space-y-5">
        {(
          [
            { label: "Current Password", key: "current" },
            { label: "New Password", key: "new" },
            { label: "Confirm New Password", key: "confirm" },
          ] as { label: string; key: keyof typeof show }[]
        ).map((field) => (
          <div key={field.key}>
            <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-500 uppercase">
              {field.label}
            </label>
            <div className="relative">
              <input
                type={show[field.key] ? "text" : "password"}
                value={form[field.key]}
                onChange={(e) =>
                  setForm({ ...form, [field.key]: e.target.value })
                }
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 pr-10 text-sm focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  setShow({ ...show, [field.key]: !show[field.key] })
                }
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {show[field.key] ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        ))}

        <div className="rounded-lg bg-amber-50 p-4 text-xs text-amber-700">
          Password must be at least 6 characters.
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
};

// ── NotificationsSection ───────────────────────────────
const NotificationsSection = () => {
  const [prefs, setPrefs] = useState([
    {
      id: 1,
      label: "Order Updates",
      desc: "Get notified about your order status",
      on: true,
    },
    {
      id: 2,
      label: "Deals & Offers",
      desc: "Exclusive discounts and flash sales",
      on: true,
    },
    {
      id: 3,
      label: "New Arrivals",
      desc: "Latest products in your favourite categories",
      on: false,
    },
    {
      id: 4,
      label: "Account Alerts",
      desc: "Security and login notifications",
      on: true,
    },
  ]);

  const toggle = (id: number) =>
    setPrefs(prefs.map((p) => (p.id === id ? { ...p, on: !p.on } : p)));

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
        <p className="text-sm text-gray-500">Control what you hear from us</p>
      </div>
      <div className="space-y-3">
        {prefs.map((pref) => (
          <div
            key={pref.id}
            className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-4"
          >
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {pref.label}
              </p>
              <p className="text-xs text-gray-400">{pref.desc}</p>
            </div>
            <button
              onClick={() => toggle(pref.id)}
              className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
                pref.on ? "bg-indigo-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  pref.on ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────
const MyAccount = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reduxUser = useSelector(selectUser);
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const navItems: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "profile", label: "My Profile", icon: <User size={18} /> },
    { key: "orders", label: "My Orders", icon: <ShoppingBag size={18} /> },
    { key: "addresses", label: "Addresses", icon: <MapPin size={18} /> },
    { key: "password", label: "Change Password", icon: <Lock size={18} /> },
    { key: "notifications", label: "Notifications", icon: <Bell size={18} /> },
  ];

  const firstName = reduxUser?.firstName ?? "";
  const lastName = reduxUser?.lastName ?? "";
  const email = reduxUser?.email ?? "";
  const initials = getInitials(firstName, lastName);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-indigo-700 px-6 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="mb-1 text-sm text-indigo-200">Welcome back 👋</p>
          <h1 className="text-3xl font-extrabold">My Account</h1>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="w-full shrink-0 lg:w-64">
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center gap-3 bg-indigo-50 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-lg font-extrabold text-white">
                  {initials}
                </div>
                <div className="overflow-hidden">
                  <p className="truncate font-bold text-gray-900">
                    {firstName} {lastName}
                  </p>
                  <p className="truncate text-xs text-gray-500">{email}</p>
                </div>
              </div>

              <nav className="p-2">
                {navItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition ${
                      activeTab === item.key
                        ? "bg-indigo-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      {item.label}
                    </span>
                    <ChevronRight
                      size={14}
                      className={
                        activeTab === item.key ? "opacity-100" : "opacity-30"
                      }
                    />
                  </button>
                ))}

                <div className="my-2 border-t border-gray-100" />

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </nav>
            </div>
          </aside>

          <div className="flex-1 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            {activeTab === "profile" && <ProfileSection />}
            {activeTab === "orders" && <Orders />}
            {activeTab === "addresses" && <AddressesSection />}
            {activeTab === "password" && <PasswordSection />}
            {activeTab === "notifications" && <NotificationsSection />}
          </div>
        </div>
      </div>
    </main>
  );
};

export default MyAccount;
