"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";

export default function Signup() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState({
    email: "",
    password: "",
    firstName: "",
    confirmPassword: "",
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<
    "empty" | "weak" | "medium" | "strong"
  >("empty");
  const [token, setToken] = useState<string | null>(null);

  // Added userId state to store the user ID from signup response
  const [userId, setUserId] = useState("");

  // Verification related states
  const [isVerificationStep, setIsVerificationStep] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpMessage, setOtpMessage] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // OTP input handlers
  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(parseInt(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.value && index < 5) {
      const nextInput = document.getElementById(
        `otp-${index + 1}`
      ) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace") {
      // If current input is empty and we're not at the first input, move to previous input
      if (!otp[index] && index > 0) {
        const prevInput = document.getElementById(
          `otp-${index - 1}`
        ) as HTMLInputElement;
        if (prevInput) {
          prevInput.focus();

          // Clear the previous input's value
          const newOtp = [...otp];
          newOtp[index - 1] = "";
          setOtp(newOtp);
        }
      } else if (otp[index] && index >= 0) {
        // If current input has a value, clear it
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  // Handle paste event for OTP
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    if (!/^\d+$/.test(pastedData)) return; // Only allow digits

    const pastedOtp = pastedData.slice(0, 6).split("");
    const newOtp = [...otp];

    pastedOtp.forEach((digit, i) => {
      if (i < 6) newOtp[i] = digit;
    });

    setOtp(newOtp);

    // Focus the next empty field
    for (let i = pastedOtp.length; i < 6; i++) {
      const nextInput = document.getElementById(`otp-${i}`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
        break;
      }
    }
  };

  // Verify OTP function - Updated to send userId instead of user object
  // Verify OTP function - Updated to properly handle API responses
  const verifyOTP = async () => {
    setError("");
    setOtpMessage("");

    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter all 6 digits of the OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "PUT",
        body: JSON.stringify({ userId: userId, otp: otpValue }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      // Check if response is not ok (status code outside 200-299 range)
      if (!response.ok) {
        throw new Error(data.error || "Failed to verify OTP");
      }

      setOtpMessage(data.message || "Email verified successfully!");
      toast.success("Account created successfully!");

      // Redirect to login after successful verification
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.message || "Failed to verify OTP");
      toast.error(err.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };
  // Resend OTP - Updated to include userId in the request
  const resendOTP = async () => {
    setError("");
    setOtpMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "PATCH",
        body: JSON.stringify({ email: verificationEmail, userId }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.message) {
        setOtpMessage(data.message);
      }

      toast.success("OTP resent to your email");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to resend OTP");
      toast.error(err.response?.data?.error || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // Redirect if already authenticated
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

  const checkPasswordStrength = (password: string) => {
    if (!password) {
      return "empty";
    }

    // Check for minimum length
    if (password.length < 8) {
      return "weak";
    }

    let score = 0;

    // Check for uppercase letters
    if (/[A-Z]/.test(password)) score++;

    // Check for lowercase letters
    if (/[a-z]/.test(password)) score++;

    // Check for numbers
    if (/[0-9]/.test(password)) score++;

    // Check for special characters
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score === 2) return "medium";
    if (score >= 3) return "strong";
    return "weak";
  };

  // Update password strength when password changes
  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(user.password));
  }, [user.password]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Validate file size (e.g., limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image too large. Please select an image under 5MB.");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file.");
        return;
      }

      setAvatar(file);

      // Create a preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeAvatar = () => {
    setAvatar(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password strength before submission
    if (passwordStrength !== "strong") {
      setError("Please use a strong password for better security");
      toast.error("Strong password required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Display uploading message if avatar is being uploaded
      if (avatar) {
        toast.loading("Uploading profile picture...");
      }

      // Combine the JSON and file data using FormData
      const formData = new FormData();

      // Append user data as individual fields
      Object.entries(user).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Append avatar if available
      if (avatar) {
        formData.append("avatar", avatar);
      }

      // Send the combined data to initiate signup
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        body: formData,
      });

      // Dismiss the loading toast
      toast.dismiss();

      // Try to parse JSON response
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch (err) {
          data = { message: text };
        }
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || "Something went wrong");
      }

      // Store userId from the response for later use in verification
      setUserId(data.userId || "");

      // Store email for verification purposes
      setVerificationEmail(user.email);

      // Show success message and switch to verification step
      toast.success("Account created! Please verify your email.");
      setIsVerificationStep(true);
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  // Get password strength indicator color
  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case "weak":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "strong":
        return "bg-green-500";
      default:
        return "bg-gray-200";
    }
  };

  // Get password strength message
  const getPasswordStrengthMessage = () => {
    switch (passwordStrength) {
      case "weak":
        return "Weak - Not allowed";
      case "medium":
        return "Medium - Not strong enough";
      case "strong":
        return "Strong - Good to go!";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome to <span className="text-blue-600">Goggins</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Organize your notes like never before
            </p>
          </div>

          {!isVerificationStep ? (
            /* Sign-Up Form */
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
              encType="multipart/form-data"
            >
              {/* Avatar Upload */}
              <div className="flex flex-col items-center justify-center pb-4 border-b border-gray-100">
                <div
                  className="w-24 h-24 rounded-full relative overflow-hidden border-2 border-dashed hover:border-blue-400 cursor-pointer transition-colors mb-3 group"
                  onClick={triggerFileInput}
                >
                  {avatarPreview ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={avatarPreview}
                        alt="Avatar preview"
                        fill
                        className="object-cover rounded-full"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="text-xs mt-1 text-gray-500">
                        Add photo
                      </span>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="avatar"
                  name="avatar"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="text-xs font-medium text-blue-600 hover:text-blue-500 flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"
                      />
                    </svg>
                    {avatarPreview ? "Change" : "Upload"}
                  </button>

                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="text-xs font-medium text-red-600 hover:text-red-500 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Personal Info */}
              <div className="space-y-4">
                {/* Name Input */}
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={user.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your name"
                    required
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={user.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                {/* Password Input with Strength Meter */}
                {/* Password Input with Strength Meter */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={user.password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Create a strong password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {user.password && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getPasswordStrengthColor()} transition-all duration-300 ease-in-out`}
                        style={{
                          width:
                            passwordStrength === "weak"
                              ? "33%"
                              : passwordStrength === "medium"
                              ? "66%"
                              : passwordStrength === "strong"
                              ? "100%"
                              : "0%",
                        }}
                      ></div>
                    </div>
                    <p
                      className={`text-xs mt-1 ${
                        passwordStrength === "weak"
                          ? "text-red-600"
                          : passwordStrength === "medium"
                          ? "text-yellow-600"
                          : passwordStrength === "strong"
                          ? "text-green-600"
                          : ""
                      }`}
                    >
                      {getPasswordStrengthMessage()}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={user.confirmPassword || ""}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      user.password &&
                      user.confirmPassword &&
                      user.password !== user.confirmPassword
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {user.password &&
                  user.confirmPassword &&
                  user.password !== user.confirmPassword && (
                    <p className="text-xs text-red-600 mt-1">
                      Passwords do not match
                    </p>
                  )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-2.5 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Sign-Up Button */}
              <button
                type="submit"
                disabled={loading || passwordStrength !== "strong"}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          ) : (
            /* OTP Verification Screen */
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Verify Your Email
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  We ve sent a verification code to{" "}
                  <span className="font-medium">{verificationEmail}</span>
                </p>
              </div>

              {/* OTP Input */}
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center font-bold text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ))}
              </div>

              {/* Error and success messages */}
              {error && (
                <div className="p-2.5 bg-red-50 text-red-600 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}
              {otpMessage && (
                <div className="p-2.5 bg-green-50 text-green-600 rounded-lg text-sm text-center">
                  {otpMessage}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col space-y-3">
                <button
                  type="button"
                  onClick={verifyOTP}
                  disabled={loading || otp.join("").length !== 6}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Verifying...
                    </div>
                  ) : (
                    "Verify Email"
                  )}
                </button>

                <button
                  type="button"
                  onClick={resendOTP}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  Resend Verification Code
                </button>

                <button
                  type="button"
                  onClick={() => setIsVerificationStep(false)}
                  disabled={loading}
                  className="text-gray-600 hover:text-gray-500 text-sm"
                >
                  Back to Sign Up
                </button>
              </div>
            </div>
          )}

          {/* Login Link */}
          <div className="text-center mt-6 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
