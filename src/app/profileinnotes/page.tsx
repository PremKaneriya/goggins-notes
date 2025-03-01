"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

// Define a type for the user data
type UserProfile = {
  firstName: string;
  email: string;
  avatar: string;
  totalNotes: number;
  phoneNumber: string;
};

export default function Profile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("/api/user/profileinnotes");
        
        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }
        
        const data = await response.json();
        console.log("Profile data received:", data);
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
        // Redirect to login if not authenticated
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      
      toast.success("Logged out successfully!");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="h-6 w-6 border-t-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-medium text-gray-800 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4 text-sm">Please log in again to access your profile.</p>
          <Link href="/login" className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm">
            Login
          </Link>
        </div>
      </div>
    );
  }

  // Check if avatar path is valid
  const hasValidAvatar = user.avatar && user.avatar.trim() !== "" && !avatarError;

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <Toaster position="top-center" />
      
      <div className="max-w-lg mx-auto py-8 px-4">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back
          </Link>
          <button 
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-500"
          >
            Logout
          </button>
        </div>

        {/* Profile header */}
        <div className="flex items-center mb-8">
          <div className="relative h-16 w-16 rounded-full overflow-hidden bg-gray-100 mr-4">
            {hasValidAvatar ? (
              <Image 
                src={user.avatar}
                alt="User Avatar"
                width={64}
                height={64}
                className="rounded-full object-cover"
                onError={() => setAvatarError(true)}
              />


            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
              </div>
            )}
          </div>
          
          <div>
            <h1 className="text-xl font-medium text-gray-900">{user.firstName}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        
        {/* Info cards */}
        <div className="space-y-4 mb-8">
          <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Phone</span>
              <span className="text-sm font-medium">{user.phoneNumber}</span>
            </div>
          </div>
          
          <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Notes</span>
              <span className="text-sm font-medium">{user.totalNotes}</span>
            </div>
          </div>
          
          <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Status</span>
              <span className="text-sm font-medium text-green-500 flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                Active
              </span>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="space-y-3">
          <Link 
            href="/notes" 
            className="block w-full py-3 bg-blue-500 text-white text-center rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            View My Notes
          </Link>
          
          <Link 
            href="/settings" 
            className="block w-full py-3 bg-gray-100 text-gray-800 text-center rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Account Settings
          </Link>
        </div>
      </div>
      {/* Footer */}
      <footer className="border-t border-black py-4 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center">
            <div className="text-sm text-gray-500 text-center">
            © 2023 Goggins Notes. All rights reserved.
            </div>
        </div>
        </footer>
      <footer className=" py-4 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-center">
          <div className="text-sm text-gray-500 text-center">
            Contant owner : <a href="https://github.com/Abhishek-07" className="text-blue-500 hover:text-blue-600 transition-colors">pre-dev</a>
          </div>
        </div>
      </footer>
    </div>
  );
}