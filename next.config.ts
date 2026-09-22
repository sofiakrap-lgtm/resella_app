import type { NextConfig } from 'next';

/**
 * Static export mode, used by the GitHub Pages workflow and by anyone who wants
 * to open the demo from a plain folder without a server:
 *
 *   NEXT_EXPORT=1 npm run build      -> writes ./out
 *   NEXT_EXPORT=1 BASE_PATH=/repo …  -> when the site is served from a subpath
 */
const isExport = process.env.NEXT_EXPORT === '1';
const basePath = process.env.BASE_PATH ?? '';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The demo renders local mock photos with a plain <img> through <SafeImage>,
  // so the image optimizer is not needed and missing files degrade gracefully.
  images: { unoptimized: true },
  // Keeps the device frame clean when the demo is shown from `npm run dev`.
  devIndicators: false,
  ...(isExport
    ? { output: 'export' as const, trailingSlash: true, basePath, assetPrefix: basePath || undefined }
    : {}),
};

export default nextConfig;
