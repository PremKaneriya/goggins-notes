/* eslint-disable react/no-unescaped-entities */
import React from "react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900 px-4 sm:px-0">
      <div className="flex flex-col items-center space-y-8">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-center">
          Welcome to <span className="text-blue-600">Goggins</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 text-center">
          Your private space express your thoughts.
        </p>
        <nav className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-6">
          <Link
            href="/signup"
            className="text-white bg-blue-600 hover:bg-blue-500 focus:ring-2 focus:outline-none focus:ring-blue-400 font-medium rounded-lg text-lg px-6 py-2 transition-colors duration-200 text-center"
          >
            Sign Up
          </Link>
          <Link
            href="/login"
            className="text-gray-800 bg-gray-100 hover:bg-gray-200 focus:ring-2 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-lg px-6 py-2 transition-colors duration-200 text-center border-2 border-gray-300"
          >
            Login
          </Link>
        </nav>
      </div>
    </div>
  );
}
