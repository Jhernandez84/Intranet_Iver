import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  // clave para evitar errores de build con flowbite-react
  transpilePackages: ["flowbite-react"],
};

export default nextConfig;
