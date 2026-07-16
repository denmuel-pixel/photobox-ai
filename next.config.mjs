/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from Fal AI and external sources
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.fal.ai",
      },
      {
        protocol: "https",
        hostname: "v5-edit.seedream.io",
      },
      {
        protocol: "https",
        hostname: "**.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "**.storage.googleapis.com",
      },
    ],
  },
  // Allow larger body size for image uploads (10MB)
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  devIndicators: false,
};

export default nextConfig;
