import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The demo renders local mock photos with a plain <img> through <SafeImage>,
  // so the image optimizer is not needed and missing files degrade gracefully.
  images: { unoptimized: true },
  // Keeps the device frame clean when the demo is shown from `npm run dev`.
  devIndicators: false,
};

export default nextConfig;
