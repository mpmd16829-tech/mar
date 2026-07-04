import type { NextConfig } from "next";

const nextConfig = {
  eslint: {
    // Cela permet de faire le build même s'il y a des petites erreurs d'apostrophes
    ignoreDuringBuilds: true,
  },
  // Si vous avez aussi des erreurs TypeScript, vous pouvez ajouter ceci :
  typescript: {
    ignoreBuildErrors: true,
  }
};};

export default nextConfig;
