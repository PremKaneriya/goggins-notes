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
  Settings, 
  User, 
  Shield, 
  FileText, 
  ChevronRight 
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
          <p className="text-gray-600">Loading your Profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <div className="text-center max-w-sm p-8 rounded-2xl shadow-xl border border-slate-100 bg-white">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Profile Not Found</h2>
          <p className="text-slate-500 mb-6">Please log in again to access your profile.</p>
          <Link href="/login" className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm font-medium shadow-md hover:shadow-lg">
            Login
          </Link>
        </div>
      </div>
    );
  }

  // Check if avatar path is valid
  const hasValidAvatar = user.avatar && user.avatar.trim() !== "" && !avatarError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Toaster position="top-center" />
      
      <div className="max-w-5xl mx-auto px-4 py-4">
        {/* Header with navigation */}
        <div className="flex items-center justify-between mb-4">
          <Link 
            href="/dashboard" 
            className="flex items-center text-slate-600 hover:text-indigo-600 transition-colors group"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 mr-2 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-medium">Dashboard</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="font-medium">Logout</span>
          </button>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Profile card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              {/* Card header with gradient */}
              <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
              
              {/* Profile info */}
              <div className="px-6 pt-0 pb-6 -mt-12">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full bg-white p-1 shadow-lg">
                    {hasValidAvatar ? (
                      <Image 
                        src={user.avatar} 
                        alt="Profile picture" 
                        fill
                        className="rounded-full object-cover"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                        <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center">
                          <User className="w-12 h-12 text-slate-400" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-slate-800 mb-1">{user.firstName}</h2>
                  <p className="text-slate-500 mb-4">{user.email}</p>

                  {/* Status badge */}
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs font-medium">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    Active Account
                  </div>
                </div>
              </div>
            </div>``
          </div>

          {/* Right column - Account details and actions */}
          <div className="lg:col-span-2">
            {/* Account info card */}
            <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Account Information</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50">
                    <p className="text-xs text-slate-500 font-medium mb-1">FULL NAME</p>
                    <p className="text-slate-800 font-medium">{user.firstName}</p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-slate-50">
                    <p className="text-xs text-slate-500 font-medium mb-1">EMAIL</p>
                    <p className="text-slate-800 font-medium">{user.email}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actions card */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Account Management</h3>
                <p className="text-slate-500 mb-6">Manage your account settings and preferences</p>
              </div>
              
              <div className="border-t border-slate-100">
                <Link 
                  href="/account-settings" 
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                      <Settings className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="text-slate-800 font-medium">Account Settings</h4>
                      <p className="text-slate-500 text-sm">Update your profile information</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </Link>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-10 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-11">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-sm text-slate-500 mb-4 md:mb-0">
              © 2023 Goggins Notes. All rights reserved.
            </div>
            <div className="text-sm text-slate-500">
              Contact owner: <a href="https://github.com/PremKaneriya" className="text-indigo-600 hover:text-indigo-700 transition-colors">pre-dev</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}