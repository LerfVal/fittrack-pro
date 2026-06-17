import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // required for the Docker runner stage
};

export default nextConfig;
