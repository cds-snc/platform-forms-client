import { defineConfig, env } from "prisma/config";

export default defineConfig({
  datasource: {
    url: env("DATABASE_URL"),
  },
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx ./src/seed_cli.ts --environment=development",
    path: "./prisma/migrations",
  },
});
