import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {};

export default nextConfig;

// Gives `next dev` access to Cloudflare bindings (local D1, vars, etc.)
initOpenNextCloudflareForDev();
