import type { NextConfig } from "next";

const apiOrigin = (process.env.API_URL ?? "http://localhost:5043/api").replace(/\/api\/?$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${apiOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;
