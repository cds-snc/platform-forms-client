import { vi, beforeEach } from "vitest";
import { mockReset, mockDeep, DeepMockProxy } from "vitest-mock-extended";
import { prisma, PrismaClient, Prisma } from "@gcforms/database";

vi.mock("@gcforms/database", () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
  Prisma: mockDeep<typeof Prisma>(),
  prismaErrors: vi.fn(<Error, T>(e: Error, returnValue: T): T => {
    // If we're in test mode ignore that we cannot connect to the Prisma Backend
    if (process.env.APP_ENV === "test" && e instanceof Prisma.PrismaClientInitializationError) {
      return returnValue;
    }

    // Return the backup value if a Prisma Error occurs
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return returnValue;
    }

    throw e;
  }),
}));

beforeEach(() => {
  mockReset(prismaMock);
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
