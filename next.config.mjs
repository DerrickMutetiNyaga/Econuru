/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add empty turbopack config to silence the warning
  // The webpack config below will still be used when webpack is explicitly enabled
  turbopack: {},
  // Improve chunk loading reliability
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ensure proper handling of dynamic imports
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
}

export default nextConfig
