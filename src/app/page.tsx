/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await fetch("/api/auth/token", {
          method: "GET",
          credentials: "include", // Ensures cookies are sent
        });

        const data = await res.json();
        if (data.token) {
          setToken(data.token);
          router.push("/dashboard"); // Redirect if token exists
        }
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    };

    fetchToken();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900 px-4 sm:px-0">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center space-y-6">
          <h1 className="text-2xl font-bold text-center">
            Welcome to <span className="text-blue-600">Goggins</span> Notes
          </h1>

          <p className="text-sm text-gray-600 text-center">
            Your private space to express your thoughts.
          </p>

          <div className="w-full space-y-4 mt-4">
            <Link
              href="/signup"
              className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 text-center"
            >
              Sign Up
            </Link>

            <Link
              href="/login"
              className="block w-full py-2 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 font-medium rounded-lg transition duration-200 text-center"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
