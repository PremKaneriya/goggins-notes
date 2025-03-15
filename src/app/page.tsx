/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
    <div className="min-h-screen bg-blue-50 text-gray-900">
      {/* Header/Navigation */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-blue-700">Goggins NoteBook</h1>
          </div>
          <div className="flex space-x-4">
            <Link
              href="/login"
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-gray-800"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                The harder
                <br />
                workspace
              </h2>
              <p className="text-lg md:text-xl text-gray-600">
                Write. Plan. Collaborate. With a little help from the toughest mindset.
              </p>
              <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex">
                <Link
                  href="/signup"
                  className="block sm:inline-block px-6 py-3 bg-blue-700 text-white font-medium rounded-md hover:bg-gray-800 text-center" 
                >
                  Sign up
                </Link>
              </div>
              <div className="pt-6">
                <p className="text-sm text-gray-600">Trusted by the mentally tough at</p>
                <div className="flex flex-wrap items-center gap-6 mt-4">
                  <div className="h-6 w-20 bg-gray-200 rounded"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
            <div className="relative h-80 md:h-96 lg:h-[500px]">
              <div className="absolute inset-0 flex items-center justify-center">
                {/* David Goggins image from provided URL */}
                <div className="relative w-full h-full">
                  <img
                    src="https://www.gogginsnoexcuses.com/img/Goggins_Head.png"
                    alt="David Goggins"
                    className="object-contain w-full h-full rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold">Stay Hard. Stay Productive.</h2>
              <p className="mt-4 text-lg text-gray-600">
                No excuses, just results. Our workspace helps you push through mental barriers.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="h-12 w-12 bg-black rounded-full flex items-center justify-center text-white mb-4">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold">Mental Toughness</h3>
                <p className="mt-2 text-gray-600">
                  Build your workspace with the same discipline David Goggins applies to his training.
                </p>
              </div>
              {/* Feature 2 */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="h-12 w-12 bg-black rounded-full flex items-center justify-center text-white mb-4">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold">No Compromise</h3>
                <p className="mt-2 text-gray-600">
                  Your notes and plans without shortcuts or excuses. Be uncommon amongst uncommon.
                </p>
              </div>
              {/* Feature 3 */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="h-12 w-12 bg-black rounded-full flex items-center justify-center text-white mb-4">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold">Accountable Writing</h3>
                <p className="mt-2 text-gray-600">
                  Track your progress, face your own truth, and push beyond your perceived limits.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-600">Stay hard, stay disciplined.</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900">
                About
              </Link>
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
                Terms
              </Link>
              <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}