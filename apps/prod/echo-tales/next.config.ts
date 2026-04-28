import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
    ],
  },
  serverExternalPackages: ['sharp', 'node-lame', 'oauth-1.0a', '@napi-rs/canvas'],
};

export default nextConfig;
