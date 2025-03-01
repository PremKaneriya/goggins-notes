/* eslint-disable react/no-unescaped-entities */
"use client"
import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem("tab");
    
    // If token exists, redirect to dashboard
    if (token) {
      router.push("/dashboard");
    }
  }, [router]); // Add router to dependency array

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