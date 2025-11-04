// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable Turbopack for now to use Webpack
  experimental: {
    webpackBuildWorker: true,
    // Explicitly opt-out of Turbopack
    turbo: false
  },
  webpack: (config, { isServer }) => {
    // Enable WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Add fallbacks for Node.js modules
    if (!isServer) {
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
    }
    return config;
  },

  // External packages that should be processed by webpack
  serverExternalPackages: ['@ffmpeg/ffmpeg', '@ffmpeg/core'],
  
  // Security headers for FFmpeg
  async headers() {
    const headers = [];
    
    // Only add CORS headers in development
    if (process.env.NODE_ENV === 'development') {
      headers.push({
        source: '/_next/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
        ],
      });
    }

    // Add security headers for all environments
    headers.push({
      source: '/:path*',
      headers: [
        {
          key: 'Cross-Origin-Embedder-Policy',
          value: 'require-corp',
        },
        {
          key: 'Cross-Origin-Opener-Policy',
          value: 'same-origin',
        },
      ],
    });

    return headers;
  },

  // Output file tracing root for deployment
  outputFileTracingRoot: __dirname,
  
  // Development server configuration
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/_next/static/:path*',
          has: [
            {
              type: 'header',
              key: 'referer',
              value: 'http://localhost:3000',
            },
          ],
          destination: '/_next/static/:path*',
        },
      ],
    };
  },

  // Production optimizations
  productionBrowserSourceMaps: false,
  optimizeFonts: true,
  reactStrictMode: true,
};

module.exports = nextConfig;
