import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  test: {
    globals: true,
    environment: "node",

    include: ["src/**/*.spec.ts", "src/**/*.test.ts", "src/**/__tests__/**/*.ts"],

    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
