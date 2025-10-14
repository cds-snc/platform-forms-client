import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "./generated/prisma/client";

export function initializeDbConnection() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter }).$extends({
    model: {
      $allModels: {
        async exists<T>(this: T, where: Prisma.Args<T, "findFirst">["where"]): Promise<boolean> {
          const context = Prisma.getExtensionContext(this);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result = await (context as any).findFirst({ where });
          return result !== null;
        },
      },
    },
    query: {
      template: {
        $allOperations({ args, query }) {
          if ("where" in args) {
            args.where = { ...args.where, ttl: null };
          }
          return query(args);
        },
      },
    },
  });
}

// This export is needed to avoid the TypeScript error:
// ```
// The inferred type of 'prisma' cannot be named without a reference to '../node_modules/@repo/database/src/generated/prisma/client'.
// This is likely not portable. A type annotation is necessary.ts(2742)
// ```
export type * from "./generated/prisma/client";
export { Prisma } from "./generated/prisma/client";
