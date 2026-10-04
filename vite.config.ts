import path from "node:path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // Vite serves the frontend; the deployed API uses the same Firebase event project.
  // API_PROXY_TARGET can point development at another backend or an isolated fixture.
  const env = loadEnv(mode, import.meta.dirname, "API_");
  const proxy = {
    "/api": { target: env.API_PROXY_TARGET || "https://fatu-oph-2026.vercel.app", changeOrigin: true },
  };
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
    server: {
      host: "0.0.0.0",
      port: 5173,
      proxy,
    },
    preview: {
      port: 4173,
      proxy,
    },
  };
});
