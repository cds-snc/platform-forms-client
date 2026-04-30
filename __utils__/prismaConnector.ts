import { mockReset, DeepMockProxy } from "jest-mock-extended";
import { prisma, PrismaClient, Prisma } from "@gcforms/database";

jest.mock("@gcforms/database", () => {
  // Only mock prisma when were running in the Node jest environment
  if (typeof window === "undefined") {
    const { mockDeep } = jest.requireActual("jest-mock-extended");
    return {
      __esModule: true,
      prisma: mockDeep() as DeepMockProxy<PrismaClient>,
      Prisma: mockDeep() as DeepMockProxy<typeof Prisma>,
      prismaErrors: jest.fn(<Error, T>(e: Error, returnValue: T): T => {
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
    };
  } else {
    return {};
  }
});
// Only mock prisma when were running in the Node jest environment
if (typeof window === "undefined") {
  beforeEach(() => {
    mockReset(prismaMock);
  });
}

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
