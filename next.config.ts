import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "*.loca.lt",
    "*.ngrok.io",
    "*.ngrok-free.app"
  ]
};

export default nextConfig;
