import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { VitePWA } from "vite-plugin-pwa";
import { pwaOptions } from "./pwa.config.js";

export default defineConfig(({ mode }) => {
  // Read server configuration here only; never expose backend secrets to the client.
  const backendEnv = loadEnv(
    mode,
    fileURLToPath(new URL("../backend", import.meta.url)),
    "",
  );
  const port = process.env.PORT || backendEnv.PORT || "5050";
  return {
    plugins: [react(), VitePWA(pwaOptions)],
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      allowedHosts: ["terminal.local"],
      proxy: {
        "/api": { target: `http://127.0.0.1:${port}`, changeOrigin: false },
      },
    },
    build: { outDir: "dist" },
  };
});
