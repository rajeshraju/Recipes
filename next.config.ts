import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow blob: URLs for local preview in ImageUpload component
    remotePatterns: [],
    // Local /uploads/ directory is served as static files — no configuration needed
  },
  // Ensure uploads directory is excluded from static optimization
  experimental: {},
};

export default nextConfig;
