import { vi, beforeEach } from "vitest";
import { mockReset, mockDeep, DeepMockProxy } from "vitest-mock-extended";
import { prisma, PrismaClient } from "@gcforms/database";

vi.mock("@gcforms/database", async () => {
  const originalModule =
    await vi.importActual<typeof import("@gcforms/database")>("@gcforms/database");
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
