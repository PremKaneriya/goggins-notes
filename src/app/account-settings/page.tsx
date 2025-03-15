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
  User,
  Mail,
  Save,
  Camera,
  HelpCircle,
  Trash2,
  AlertTriangle,
} from "lucide-react";

// Define a type for the user data
type UserProfile = {
  id: string;
  firstName: string;
  email: string;
  avatar: string;
};

export default function AccountSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    avatar: "",
  });

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
        setFormData({
          firstName: data.user.firstName,
          email: data.user.email,
          avatar: data.user.avatar || "",
        });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData((prev) => ({
            ...prev,
            avatar: event.target?.result as string,
          }));
          setAvatarError(false);
        }
      };
      reader.readAsDataURL(file);

      toast.success("Avatar updated for preview. Save changes to confirm.");
    } catch (error) {
      console.error("Failed to update avatar:", error);
      toast.error("Failed to update avatar");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setUpdating(true);

      const response = await fetch("/api/profile/account-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      // Update user state with new data
      setUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          firstName: formData.firstName,
          email: formData.email,
          avatar: formData.avatar,
        };
      });

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteConfirmationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDeleteConfirmation(e.target.value);
  };

  const handleInitiateDelete = () => {
    setShowDeleteConfirmation(true);
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (deleteConfirmation !== "DELETE") {
      toast.error("Please type DELETE to confirm account deletion");
      return;
    }

    try {
      setIsDeleting(true);

      const response = await fetch(
        "/api/profile/account-settings/delete-account",
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      toast.success("Your account has been successfully deleted");

      // Redirect to logout after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error("Failed to delete account. Please try again later.");
    } finally {
      setIsDeleting(false);
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
          <h2 className="text-xl font-medium text-gray-800 mb-2">
            Profile Not Found
          </h2>
          <Link href="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </div>
      </div>
    );
  }

  // Check if avatar path is valid
  const hasValidAvatar =
    formData.avatar && formData.avatar.trim() !== "" && !avatarError;

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-center" />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with navigation */}
        <div className="flex items-center justify-between mb-10">
          <Link
            href="/profileinnotes"
            className="flex items-center text-gray-600 hover:text-blue-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Back to Profile</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              {/* User profile card */}
              <div className="px-6 py-6 border-b border-gray-100">
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="relative group mb-4">
                    <div className="w-24 h-24 rounded-full relative overflow-hidden border-4 border-white shadow-sm">
                      {hasValidAvatar ? (
                        <Image
                          src={formData.avatar}
                          alt="Profile picture"
                          fill
                          className="object-cover"
                          onError={() => setAvatarError(true)}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera className="w-6 h-6" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-1 truncate max-w-full">
                    {user.firstName}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3 truncate max-w-full">
                    {user.email}
                  </p>

                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-600 text-xs font-medium">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    Active Account
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-4">
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => setActiveTab("profile")}
                      className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === "profile"
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="flex-shrink-0 mr-3">
                        <User className="w-5 h-5" />
                      </span>
                      <span className="truncate">Profile</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("help")}
                      className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === "help"
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="flex-shrink-0 mr-3">
                        <HelpCircle className="w-5 h-5" />
                      </span>
                      <span className="truncate">Help & Support</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveTab("delete-account")}
                      className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === "delete-account"
                          ? "bg-red-50 text-red-700"
                          : "text-red-600 hover:bg-red-50"
                      }`}
                    >
                      <span className="flex-shrink-0 mr-3">
                        <Trash2 className="w-5 h-5" />
                      </span>
                      <span className="truncate">Delete Account</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <form onSubmit={handleSubmit}>
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-6">
                  <div className="px-6 py-5 border-b border-gray-100">
                    <h2 className="text-lg font-medium text-gray-800">
                      Profile Information
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Update your account profile information and email address.
                    </p>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <label
                        htmlFor="firstName"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Full Name
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors text-gray-900"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                    </div>

                    {/* Email Field */}
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Email Address
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors text-gray-900"
                          placeholder="Enter your email address"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        This will be used for account recovery and important
                        notifications.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end space-x-4">
                  <Link
                    href="/profileinnotes"
                    className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none"
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "delete-account" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-sm font-medium text-gray-800">
                    Delete Account
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Permanently delete your account and all associated data.
                  </p>
                </div>

                <div className="p-6">
                  <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <AlertTriangle
                          className="h-5 w-5 text-red-500"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Warning: This action cannot be undone
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>
                            When you delete your account, all of your notes,
                            personal information, and account history will be
                            permanently removed from our system.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {!showDeleteConfirmation ? (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-6">
                        Are you sure you want to delete your account? This
                        action is permanent and cannot be reversed.
                      </p>
                      <button
                        type="button"
                        onClick={handleInitiateDelete}
                        className="inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
                      >
                        Delete My Account
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleDeleteAccount}>
                      <p className="text-sm text-gray-700 mb-4">
                        To confirm deletion, please type <strong>DELETE</strong>{" "}
                        in the field below:
                      </p>
                      <div className="mb-6">
                        <input
                          type="text"
                          value={deleteConfirmation}
                          onChange={handleDeleteConfirmationChange}
                          className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-500 transition-colors text-gray-900"
                          placeholder="Type DELETE to confirm"
                          required
                        />
                      </div>

                      <div className="flex justify-between">
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirmation(false)}
                          className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none"
                          disabled={
                            isDeleting || deleteConfirmation !== "DELETE"
                          }
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            "Permanently Delete Account"
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            {activeTab === "help" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 text-center">
                <div className="py-12">
                  <div className="bg-gray-50 inline-flex p-4 rounded-full mb-4">
                    <HelpCircle className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    Help & Support
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Need help with your account? Check our help center or
                    contact support for assistance.
                  </p>
                  <button
                    onClick={() =>
                      window.open("mailto:support@gogginnotes.com", "_blank")
                    }
                    className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-100 pt-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Goggins Notes</p>
        </footer>
      </div>
    </div>
  );
}
