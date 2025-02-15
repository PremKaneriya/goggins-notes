"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

export default function Signup() {
  const router = useRouter();
  const [user, setUser] = useState({ phoneNumber: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong");

      toast.success("User created successfully!");
      router.push("/login");
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Toaster position="top-center" />
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-2xl font-semibold">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <input type="email" name="email" placeholder="Email" value={user.email} onChange={handleInputChange} className="input-field" required />
          <input type="password" name="password" placeholder="Password" value={user.password} onChange={handleInputChange} className="input-field" required />
          <input type="tel" name="phoneNumber" placeholder="Phone Number" value={user.phoneNumber} onChange={handleInputChange} className="input-field" required />
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        <p className="text-sm mt-4">Already have an account? <Link href="/login">Log in</Link></p>
      </div>
    </div>
  );
}
