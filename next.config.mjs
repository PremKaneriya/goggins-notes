/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "goggins.vercel.app",
        pathname: "/avatars/**", // Ensure it matches the correct image path
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/avatars/**",
      },
    ],
  },
};

export default nextConfig;
