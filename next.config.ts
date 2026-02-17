import { dirname } from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {
    root: dirname(__filename),
  },
};

export default nextConfig;
