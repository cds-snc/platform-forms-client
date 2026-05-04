import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "src/index.ts",
  copy: "src/global-bundle.pem",
  format: "esm",
  dts: true,
  target: "es2023",
  platform: "node",
  outDir: "./dist",
});
