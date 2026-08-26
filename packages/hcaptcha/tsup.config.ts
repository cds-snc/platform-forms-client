import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    server: "src/server/index.ts",
    client: "src/client/index.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
});
