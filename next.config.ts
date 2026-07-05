import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // MVP runs fully client-side on mock data + localStorage.
  // When a Supabase backend is added, API routes / server actions slot in here.
  reactStrictMode: true,
};

export default nextConfig;
