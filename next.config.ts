import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/p',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;