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
  serverExternalPackages: ['sharp', 'essentia.js', '@napi-rs/canvas', 'pdf-to-png-converter'],
  transpilePackages: ['@leresearch-org/brand'],
  turbopack: {
    resolveAlias: {
      fs: { browser: './node_modules/next/dist/compiled/empty' },
      path: { browser: './node_modules/next/dist/compiled/empty' },
      crypto: { browser: './node_modules/next/dist/compiled/empty' },
    },
  },
};

export default nextConfig;
