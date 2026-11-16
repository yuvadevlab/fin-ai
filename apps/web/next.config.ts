import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.VERCEL ? undefined : "standalone",
  transpilePackages: [
    "@finai/ui",
    "@finai/finance-engine",
    "@finai/validation",
    "@finai/shared-types",
    "@yuva-devlab/auth-client",
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        async_hooks: false,
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/analytics",
        destination: "/health",
        permanent: false,
      },
      {
        source: "/settings/profile",
        destination: "/settings?tab=profile",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
