import type { NextConfig } from "next";

const baseConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

const isDev = process.env.NODE_ENV === "development";

const devProxy: NextConfig = {
  ...baseConfig,
  async rewrites() {
    if (!isDev) {
      return [];
    }
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:5000/api/v1/:path*",
      },
    ];
  },
};

export default isDev ? devProxy : baseConfig;