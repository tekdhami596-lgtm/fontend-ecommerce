import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { loginService } from "../services/authService";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await loginService(formData);
      localStorage.setItem("token", user.token);

      if (user.role === "seller") {
        navigate("/product");
      } else {
        navigate("/product");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg flex flex-col gap-6"
      >
        <h2 className="text-2xl font-bold text-center">Login</h2>
        <p className="text-center text-gray-500 text-sm">
          Please login using account detail below.
        </p>

        {/* Email */}
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
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col">
          <label htmlFor="password" className="mb-2 text-gray-600">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <p className="text-sm text-right text-gray-500 cursor-pointer hover:underline">
          Forgot your password?
        </p>

        {/* Submit */}
        <button
          type="submit"
          className="bg-pink-500 text-white py-2 rounded-md font-medium hover:bg-pink-600 transition-colors"
        >
           Login
        </button>

        <p className="text-center text-gray-500 text-sm">
          Don’t have an Account?{" "}
          <NavLink to="/signup" className="text-indigo-500 hover:underline">
            Create account
          </NavLink>
        </p>
      </form>
    </div>
  );
};

export default Login;
