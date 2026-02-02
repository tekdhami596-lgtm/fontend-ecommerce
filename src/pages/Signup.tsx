import { useState } from "react";
import { signUpService } from "../services/authService";
import { useNavigate } from "react-router-dom";

type UserRole = "buyer" | "seller" | "";

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}

function SignupForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<SignupFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const response = await signUpService(formData);
    localStorage.setItem("token", response.token);
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
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

        {/* First Name */}
        <div className="mb-4">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full rounded border px-3 py-2 text-sm outline-none focus:border-pink-500"
          />
        </div>

        {/* Last Name */}
        <div className="mb-4">
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full rounded border px-3 py-2 text-sm outline-none focus:border-pink-500"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full rounded border px-3 py-2 text-sm outline-none focus:border-pink-500"
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full rounded border px-3 py-2 text-sm outline-none focus:border-pink-500"
          />
        </div>

        {/* Role */}
        <div className="mb-6 text-sm text-gray-600">
          <p className="mb-2 font-medium">User Type</p>

          <label className="mr-4 inline-flex items-center gap-2">
            <input
              type="radio"
              name="role"
              value="buyer"
              checked={formData.role === "buyer"}
              onChange={handleChange}
              required
            />
            Buyer
          </label>

          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name="role"
              value="seller"
              checked={formData.role === "seller"}
              onChange={handleChange}
            />
            Seller
          </label>
        </div>

        {/* Button */}
        <button
          type="submit"
          className="w-full rounded bg-pink-500 py-2 text-white transition hover:bg-pink-600"
        >
          Sign Up
        </button>

        {/* Footer */}
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
