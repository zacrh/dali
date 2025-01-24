import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: ["api.typeform.com", "static.valorantstats.xyz"],
  },
  
};

export default nextConfig;
