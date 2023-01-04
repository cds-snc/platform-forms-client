import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";
import { prisma } from "@lib/integration/prismaConnector";
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime";

jest.mock("@lib/integration/prismaConnector", () => {
  const originalModule = jest.requireActual("@lib/integration/prismaConnector");
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn(),
    prisma: mockDeep<PrismaClient>(),
  };
});

beforeEach(() => {
  mockReset(prismaMock);
});

export type {
  PrismaClientKnownRequestError,
  PrismaClientInitializationError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
};

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
