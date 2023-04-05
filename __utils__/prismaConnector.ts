import { PrismaClient, Prisma } from "@prisma/client";
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";
import { prisma } from "@lib/integration/prismaConnector";

export const {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} = Prisma;

jest.mock("@lib/integration/prismaConnector", () => {
  const originalModule = jest.requireActual("@lib/integration/prismaConnector");
  return {
    __esModule: true,
    ...originalModule,
    prisma: mockDeep<PrismaClient>(),
  };
});

beforeEach(() => {
  mockReset(prismaMock);
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
