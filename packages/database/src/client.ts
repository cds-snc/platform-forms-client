import { PrismaClient, Prisma } from "./generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const certPath = path.join(__dirname, "global-bundle.pem");

const connectionString = () => {
  const envConnectiontring = process.env.DATABASE_URL;
  if (!envConnectiontring) {
    throw new Error("Missing Database Url Environment Variable");
  }
  // Check if there are already existing parameters and if not start a new parameter string
  if (/5432\/forms$/i.test(envConnectiontring)) {
    return envConnectiontring + `?sslmode=verify-full&sslrootcert=${certPath}`;
  } else {
    return envConnectiontring + `&sslmode=verify-full&sslrootcert=${certPath}`;
  }
};

const adapter = new PrismaPg({
  connectionString: connectionString(),
});
// Instantiate the extended Prisma client to infer its type
const extendedPrisma = new PrismaClient({ adapter }).$extends({
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
          args.where = { ttl: null, ...args.where };
        }
        return query(args);
      },
    },
  },
});
type ExtendedPrismaClient = typeof extendedPrisma;

// Use globalThis for broader environment compatibility
const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: ExtendedPrismaClient;
};

// Named export with global memoization
export const prisma: ExtendedPrismaClient = globalForPrisma.prisma ?? extendedPrisma;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export const prismaErrors = <Error, T>(e: Error, returnValue: T): T => {
  // If we're in test mode ignore that we cannot connect to the Prisma Backend
  if (process.env.APP_ENV === "test" && e instanceof Prisma.PrismaClientInitializationError) {
    return returnValue;
  }

  // Return the backup value if a Prisma Error occurs
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    return returnValue;
  }

  throw e;
};
