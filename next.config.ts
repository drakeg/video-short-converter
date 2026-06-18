import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  reactCompiler: true,
  productionBrowserSourceMaps: true,
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
    };

    return config;
  },
};

export default nextConfig;
