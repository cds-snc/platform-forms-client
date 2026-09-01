import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    server: "src/server/index.ts",
    client: "src/client/index.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
});
