import { useState } from "react";
import { useNavigate } from "react-router-dom";
import notify from "../helpers/notify";
import api from "../api/axios";

type Role = "buyer" | "seller";

interface BaseFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
}
interface BuyerFormData extends BaseFormData {
  role: "buyer";
  deliveryAddress: string;
}
interface SellerFormData extends BaseFormData {
  role: "seller";
  storeName: string;
  businessAddress: string;
}
type SignupFormData = BuyerFormData | SellerFormData;

interface ValidationError {
  field: string;
  message: string;
}

function SignupForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<ValidationError[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<SignupFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    role: "buyer",
    deliveryAddress: "",
  } as BuyerFormData);

  const handleRoleChange = (role: Role) => {
    const base = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
    };
    setFormData(
      role === "buyer"
        ? { ...base, role: "buyer", deliveryAddress: "" }
        : { ...base, role: "seller", storeName: "", businessAddress: "" },
    );
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined! }));
    setApiError((prev) => prev.filter((err) => err.field !== name));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.firstName.trim() || formData.firstName.length < 3)
      e.firstName = "Min 3 characters";
    if (!formData.lastName.trim() || formData.lastName.length < 3)
      e.lastName = "Min 3 characters";
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "Valid email required";
    if (!formData.password || formData.password.length < 6)
      e.password = "Min 6 characters";
    if (!formData.phone.trim()) e.phone = "Phone number is required";
    if (
      formData.role === "buyer" &&
      !(formData as BuyerFormData).deliveryAddress?.trim()
    )
      e.deliveryAddress = "Required";
    if (
      formData.role === "seller" &&
      !(formData as SellerFormData).storeName?.trim()
    )
      e.storeName = "Required";
    if (
      formData.role === "seller" &&
      !(formData as SellerFormData).businessAddress?.trim()
    )
      e.businessAddress = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError([]);
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post("/auth/signup", formData);
      notify.success("Account created! Please log in.");
      navigate("/login");
    } catch (err: any) {
      if (err.response?.data) {
        setApiError(err.response.data.errors || []);
        notify.error(err.response.data.message || "Signup failed");
      } else {
        notify.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const isSeller = formData.role === "seller";
  const Err = ({ name }: { name: string }) =>
    errors[name] ? (
      <p className="mt-1 text-xs text-red-500">{errors[name]}</p>
    ) : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
      >
        <h2 className="mb-1 text-center text-2xl font-semibold text-gray-800">
          Create Account
        </h2>
        <p className="mb-6 text-center text-sm text-gray-500">
          Please fill in the details below
        </p>

        {/* Role Toggle */}
        <div className="mb-6 flex gap-3">
          {(["buyer", "seller"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRoleChange(r)}
              className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-all ${
                formData.role === r
                  ? "border-pink-500 bg-pink-50 text-pink-600"
                  : "border-gray-200 text-gray-400 hover:border-gray-300"
              }`}
            >
              {r === "buyer" ? "🛍️ I'm a Buyer" : "🏪 I'm a Seller"}
            </button>
          ))}
        </div>

        {/* Name row */}
        <div className="mb-4 flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2 text-sm outline-none focus:border-pink-500"
            />
            <Err name="firstName" />
          </div>
          <div className="flex-1">
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2 text-sm outline-none focus:border-pink-500"
            />
            <Err name="lastName" />
          </div>
        </div>

        {/* Email */}
        <div className="mb-4">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 text-sm outline-none focus:border-pink-500"
          />
          <Err name="email" />
          {apiError.map((err) => (
            <p key={err.field} className="mt-1 text-xs text-red-500">
              {err.message}
            </p>
          ))}
        </div>

        {/* Password */}
        <div className="mb-4">
          <input
            type="password"
            name="password"
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 text-sm outline-none focus:border-pink-500"
          />
          <Err name="password" />
        </div>

        {/* Phone (both roles) */}
        <div className="mb-4">
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 text-sm outline-none focus:border-pink-500"
          />
          <Err name="phone" />
        </div>

        {/* Buyer only */}
        {!isSeller && (
          <div className="mb-4">
            <input
              type="text"
              name="deliveryAddress"
              placeholder="Delivery Address"
              value={(formData as BuyerFormData).deliveryAddress}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2 text-sm outline-none focus:border-pink-500"
            />
            <Err name="deliveryAddress" />
          </div>
        )}

        {/* Seller only */}
        {isSeller && (
          <>
            <div className="mb-4">
              <input
                type="text"
                name="storeName"
                placeholder="Store Name"
                value={(formData as SellerFormData).storeName}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2 text-sm outline-none focus:border-pink-500"
              />
              <Err name="storeName" />
            </div>
            <div className="mb-4">
              <input
                type="text"
                name="businessAddress"
                placeholder="Business Address"
                value={(formData as SellerFormData).businessAddress}
                onChange={handleChange}
                className="w-full rounded border px-3 py-2 text-sm outline-none focus:border-pink-500"
              />
              <Err name="businessAddress" />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full cursor-pointer rounded bg-pink-500 py-2 text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="cursor-pointer text-pink-500 hover:underline"
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}

export default SignupForm;
