import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx ./src/seed_cli.ts --environment=development",
    path: "./prisma/migrations",
  },
});
