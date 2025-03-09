"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import { Loader2, ArrowLeft, LogOut, FileText, Settings, Phone, Badge, User } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
          <p className="text-slate-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-sm p-8 rounded-xl shadow-lg border border-slate-100">
          <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Profile Not Found</h2>
          <p className="text-slate-600 mb-6">Please log in again to access your profile.</p>
          <Link href="/login" className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
            Login
          </Link>
        </div>
      </div>
    );
  }

  // Check if avatar path is valid
  const hasValidAvatar = user.avatar && user.avatar.trim() !== "" && !avatarError;

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-center" />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="flex items-center text-sm text-slate-600 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>Back</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center text-sm text-slate-600 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-1" />
            <span>Logout</span>
          </button>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left column - Profile info */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative w-24 h-24 mb-4 group">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 p-1">
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
                        <Image
                          src={`https://www.svgrepo.com/show/382106/male-avatar-boy-face-man-user-9.svg`}
                          alt="Default avatar" 
                          fill
                          className="rounded-full object-cover p-2"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-slate-800">{user.firstName}</h1>
                <p className="text-slate-500">{user.email}</p>

                {/* Status badge */}
                <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs font-medium">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  Active Account
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Details and actions */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Account Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-slate-50 rounded-lg">
                  <Phone className="w-5 h-5 text-slate-400 mr-3" />
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Phone Number</p>
                    <p className="text-sm font-medium">{user.phoneNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-slate-50 rounded-lg">
                  <FileText className="w-5 h-5 text-slate-400 mr-3" />
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Notes Created</p>
                    <p className="text-sm font-medium">{user.totalNotes}</p>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-slate-50 rounded-lg">
                  <Badge className="w-5 h-5 text-slate-400 mr-3" />
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Member Since</p>
                    <p className="text-sm font-medium">January 2023</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">  
              <Link 
                href="/account-settings" 
                className="flex items-center justify-center py-3 px-4 bg-white border border-slate-900 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                <Settings className="w-4 h-4 mr-2" />
                Account Settings
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
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