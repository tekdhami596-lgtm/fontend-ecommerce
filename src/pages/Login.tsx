import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { loginService } from "../services/authService";
import { useDispatch } from "react-redux";
import { login } from "../redux/slice/userSlice";

const Login = () => {
  const dispatch = useDispatch();
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
    
      dispatch(login(user));
      localStorage.setItem("token", user.token);

      if (user.role === "seller") {
        navigate("/");
      }
    } catch (error) {
      console.error(error);
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
            className="rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
            className="rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <p className="cursor-pointer text-right text-sm text-gray-500 hover:underline">
          Forgot your password?
        </p>

        {/* Submit */}
        <button
          type="submit"
          className="cursor-pointer rounded-md bg-pink-500 py-2 font-medium text-white transition-colors hover:bg-pink-600"
        >
          Login
        </button>

        <p className="text-center text-sm text-gray-500">
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
