import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Raíz fija: hay un yarn.lock suelto en la carpeta padre que confunde la detección
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
