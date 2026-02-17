import { useState } from "react";
import { useNavigate } from "react-router-dom";
import notify from "../helpers/notify";
import { useDispatch } from "react-redux";
import { login } from "../redux/slice/userSlice";
import axios from "axios";

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isSeller: boolean;
}

function SignupForm() {
  const [errors, setErrors] = useState<Partial<SignupFormData>>({});
  const [apiError, setApiError] = useState<ValidationError[]>([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState<SignupFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    isSeller: false,
  });

  interface ValidationError {
    field: string;
    message: string;
  }

  const validate = () => {
    const newErrors: Partial<SignupFormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.length < 3) {
      newErrors.firstName = "First name must be at least 3 characters";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.length < 3) {
      newErrors.lastName = "Last name must be at least 3 characters"; // fixed typo
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear frontend validation error
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));

    // Clear backend validation error for this field
    setApiError((prev) => prev.filter((err) => err.field !== name));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError([]);

    if (!validate()) return;

    axios
      .post("http://localhost:8000/api/auth/signup", formData)

      .then((res) => {
        dispatch(login(res.data));
        localStorage.setItem("token", res.data.token);
        notify.success("Login Successful");
        navigate("/");
      })
      .catch((err) => {
        if (err.response && err.response.data) {
          const backendErrors: ValidationError[] =
            err.response.data.errors || [];
          console.log({ backendErrors });
          setApiError(backendErrors); // store backend validation errors
          notify.error(err.response.data.message); // optional toast
        } else {
          notify.error("Something went wrong");
        }
      });
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
            className="w-full rounded border px-3 py-2 text-sm outline-none focus:border-pink-500"
          />
          {/* frontend validation error */}
          {errors?.firstName && (
            <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="mb-4">
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 text-sm outline-none focus:border-pink-500"
          />

          {/* frontend validation error */}
          {errors?.lastName && (
            <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>
          )}
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

          {/* frontend validation error */}
          {errors?.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
          )}

          {/* backend validation error */}
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
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 text-sm outline-none focus:border-pink-500"
          />

          {/* frontend validation error */}
          {errors?.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password}</p>
          )}
        </div>

        {/* Role */}
        <div>
          <label htmlFor="isSeller">Signup as both Buyer and Seller</label>
          <input
            id="isSeller"
            type="checkbox"
            name="isSeller"
            className="h-5 w-5 rounded border border-slate-200 bg-white px-4 text-sm text-slate-900 transition outline-none focus:border-pink-400 focus:ring-4 focus:ring-pink-100"
          />
        </div>

        {/* Button */}
        <button
          type="submit"
          className="w-full cursor-pointer rounded bg-pink-500 py-2 text-white transition hover:bg-pink-600"
        >
          Sign Up
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
