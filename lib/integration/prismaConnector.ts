import { PrismaClient } from "@prisma/client";

// See https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
// Needed to ensure we only instantiate Prisma Client once

interface CustomNodeJsGlobal {
  prisma: PrismaClient;
}
declare const global: CustomNodeJsGlobal;

export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["info", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
