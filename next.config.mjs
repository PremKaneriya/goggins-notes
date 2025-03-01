// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '3000',
          pathname: '/avatars/**',
        },
      ],
    },
    // This is important! It allows Next.js to serve files from the public directory
    async rewrites() {
      return [
        {
          source: '/avatars/:path*',
          destination: '/public/avatars/:path*',
        },
      ];
    },
  };
  
  export default nextConfig;