/* eslint-disable react/no-unescaped-entities */
"use client";

// pages/login.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { type } from "os";
import {
  div,
  h1,
  form,
  label,
  input,
  a,
  button,
  p,
} from "framer-motion/client";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [user, setUser] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => {
      const updatedUser = { ...prev, [name]: value };
      console.log("Updated user inside setUser:", updatedUser);
      return updatedUser;
    });
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      localStorage.setItem("tab", "tab");

      toast.success("User logged in successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      setError(error.message);
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-0">
    <Toaster position="top-center" reverseOrder={false} />
    <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-200">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">
        Welcome Back to <span className="text-blue-600">Goggins</span>
      </h1>
      <p className="text-sm text-gray-600 text-center mt-2">Login to continue</p>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={user.email}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors"
            placeholder="you@example.com"
            required
          />
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={user.password}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-colors"
            placeholder="••••••••"
            required
          />
        </div>

        {/* Forgot Password */}
        <div className="text-right">
          <a href="#" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
            Forgot password?
          </a>
        </div>

        {/* Error Message */}
        {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      {/* Sign Up & Home Links */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
            Sign up
          </Link>
        </p>
        <Link href="/" className="inline-block text-xs text-gray-600 hover:text-gray-800 transition-colors mt-2">
          Back to Home
        </Link>
      </div>
    </div>
  </div>
  );
}