import React, { useState } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../redux/slice/userSlice";
import api from "../api/axios";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // response shape: { token, user: { id, role, firstName, ... } }
      const { data } = await api.post("/auth/login", formData);

      dispatch(login(data.user));
      localStorage.setItem("token", data.token);

      // Role-based redirect
      if (data.user.role === "seller") {
        navigate("/seller/dashboard", { replace: true });
      } else if (data.user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate(from !== "/login" ? from : "/", { replace: true });
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col gap-6 rounded-xl bg-white p-8 shadow-lg"
      >
        <h2 className="text-center text-2xl font-bold">Login</h2>
        <p className="text-center text-sm text-gray-500">
          Please login using account detail below.
        </p>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex flex-col">
          <label htmlFor="email" className="mb-2 text-gray-600">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
            className="rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="password" className="mb-2 text-gray-600">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              className="w-full rounded-md border border-gray-300 p-2 pr-10 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <p className="cursor-pointer text-right text-sm text-gray-500 hover:underline">
          Forgot your password?
        </p>

        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer rounded-md bg-pink-500 py-2 font-medium text-white transition-colors hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm text-gray-500">
          Don't have an Account?{" "}
          <NavLink to="/signup" className="text-indigo-500 hover:underline">
            Create account
          </NavLink>
        </p>
      </form>
    </div>
  );
};

export default Login;
