import { PrismaClient, Prisma } from "@gcforms/database";
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";
import { prisma } from "@gcforms/database";

export const {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} = Prisma;

jest.mock("@gcforms/database", () => {
  // Only mock prisma when were running in the Node jest environment
  if (typeof window === "undefined") {
    const originalModule = jest.requireActual("@gcforms/database");
    return {
      __esModule: true,
      ...originalModule,
      prisma: mockDeep<PrismaClient>(),
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
