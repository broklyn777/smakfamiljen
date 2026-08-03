import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vinext's local preview worker does not provide Cloudflare's ASSETS
  // binding. Keep using next/image, but skip the remote optimizer locally so
  // repository WebP files are served directly during development.
  images: {
    unoptimized: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
