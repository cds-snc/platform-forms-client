import { defineConfig } from "prisma/config";
import { getConnectionUrl } from "./src/connection";

export default defineConfig({
  datasource: {
    url: getConnectionUrl(),
  },
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx ./src/seed.ts",
    path: "./prisma/migrations",
  },
});
