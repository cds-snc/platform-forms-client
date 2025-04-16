import { Prisma } from "@prisma/client";
import { logMessage } from "@lib/logger";
import { PrismaClient } from "prisma/generated/client";

// See https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
// Needed to ensure we only instantiate Prisma Client once

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ["info", "warn", "error"],
  }).$extends({
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
};

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

/**
 * Filters Prisma Connection and DB errors
 * @param e Error object
 * @param returnValue Value to return back to called function
 * @returns returnValue object if Prisma Error otherwise raise error
 */
export const prismaErrors = <Error, T>(e: Error, returnValue: T): T => {
  // If we're in test mode ignore that we cannot connect to the Prisma Backend
  if (process.env.APP_ENV === "test" && e instanceof Prisma.PrismaClientInitializationError) {
    return returnValue;
  }

  // Return the backup value if a Prisma Error occurs
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    logMessage.info(e);
    return returnValue;
  }

  // Continue to raise the error if it is a different type of Error or not a handled Prisma Error.
  logMessage.error(e);
  throw e;
};
