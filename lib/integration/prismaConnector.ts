import { PrismaClient } from "@prisma/client";

// See https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
// Needed to ensure we only instantiate Prisma Client once

interface CustomNodeJsGlobal {
  prisma: PrismaClient;
}
declare const global: CustomNodeJsGlobal;

if (process.env.ISOLATED_INSTANCE) {
  // If there is no DB for prisma to connect to it will throw an error.
  // This creates a fake DB that will accept a connection but
  // will not process and query requests.
  import("__utils__/prismaIsolated").then(({ createFakeDB }) => {
    createFakeDB();
  });
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["info", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
