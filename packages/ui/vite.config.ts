import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { resolve } from "node:path";
import MagicString from "magic-string"; // add as devDependency: pnpm add -D magic-string

// Rollup drops "use client" banners by default — this plugin re-adds them
// to any chunk that contains client-only code.
function preserveUseClient() {
  return {
    name: "preserve-use-client",
    renderChunk(code: string) {
      const hasClientDirective = /["']use client["']/.test(code);
      if (hasClientDirective) return null;
      const ms = new MagicString(code);
      ms.prepend(`"use client";\n`);
      return { code: ms.toString(), map: ms.generateMap({ hires: true }) };
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: "./tsconfig.json",
      insertTypesEntry: true,
    }),
  ],
  build: {
    outDir: "dist",
    sourcemap: true,
    emptyOutDir: true,
    cssMinify: "esbuild",
    cssCodeSplit: false,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "FinaiUI",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
    },
    rollupOptions: {
      external: (id) => {
        if (id.includes("node_modules")) return true;
        if (id.startsWith(".") || id.startsWith("/") || id.startsWith("\0")) return false;
        return true;
      },
      plugins: [preserveUseClient()],
      output: {
        preserveModules: false,
        exports: "named",
        globals: { react: "React", "react-dom": "ReactDOM" },
      },
    },
  },
});
