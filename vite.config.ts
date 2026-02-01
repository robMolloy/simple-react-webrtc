/// <reference types="vitest" />

import path from "path";
import tailwindcss from "@tailwindcss/vite";
import type { ConfigEnv } from "vite";
import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import Pages from "vite-plugin-pages";

export default (p: { mode: ConfigEnv }) => {
  const env = loadEnv(p.mode.command, process.cwd(), "");

  return defineConfig({
    base: env.VITE_APP_BASE_URL,
    test: {
      environment: "node",
      globals: true,
    },
    plugins: [
      react(),
      tailwindcss(),
      Pages({
        dirs: "src/pages",
        extensions: ["page.tsx", "tsx"],
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  });
};
