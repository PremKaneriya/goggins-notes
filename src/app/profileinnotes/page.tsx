"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import { 
  Loader2, 
  ArrowLeft, 
  LogOut, 
  User
} from "lucide-react";

// Define a type for the user data
type UserProfile = {
  id: string; 
  firstName: string;
  email: string;
  avatar: string;
  totalNotes: number;
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
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
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
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center p-6">
          <User className="w-10 h-10 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-800 mb-2">Profile Not Found</h2>
          <Link href="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </div>
      </div>
    );
  }

  // Check if avatar path is valid
  const hasValidAvatar = user.avatar && user.avatar.trim() !== "" && !avatarError;

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-center" />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with navigation */}
        <div className="flex items-center justify-between mb-10">
          <Link 
            href="/dashboard" 
            className="flex items-center text-gray-600 hover:text-blue-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Back</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="text-gray-600 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Profile content */}
        <div className="mb-10">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative w-32 h-32 mb-4">
              {hasValidAvatar ? (
                <Image 
                  src={user.avatar} 
                  alt="Profile picture" 
                  fill
                  className="rounded-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-medium text-gray-800">{user.firstName}</h1>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>

          {/* Settings link */}
          <Link 
            href="/account-settings" 
            className="block w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-center text-gray-700 transition-colors"
          >
            Account Settings
          </Link>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-100 pt-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Goggins Notes</p>
        </footer>
      </div>
    </div>
  );
}