import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: [
    "@finai/ui",
    "@finai/finance-engine",
    "@finai/validation",
    "@finai/shared-types",
    "@yuva-devlab/ui",
    "@yuva-devlab/tokens",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
