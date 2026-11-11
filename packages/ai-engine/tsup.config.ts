import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/extract-follow-ups.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  minify: false,
  target: "es2022",
  outDir: "dist",
});
