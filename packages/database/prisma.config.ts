import { defineConfig, env } from "prisma/config";

const databaseURL = env("DATABASE_URL");

export default defineConfig({
  datasource: {
    url: databaseURL,
  },
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx ./src/seed.ts ",
    path: "./prisma/migrations",
  },
});
