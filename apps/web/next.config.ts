import { resolve } from "node:path";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

// Share the repo-root .env with the API services (Next only reads apps/web/.env* by default).
loadEnvConfig(resolve(process.cwd(), "../.."));

const nextConfig: NextConfig = {
  typedRoutes: true
};

export default nextConfig;
