import { defineConfig } from "prisma/config";

const databaseURL = process.env.DATABASE_URL ?? "postgres://postgres:chummy@localhost:5432/forms";

export default defineConfig({
  datasource: {
    url: databaseURL,
  },
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx ./src/seed_cli.ts --environment=development",
    path: "./prisma/migrations",
  },
});
