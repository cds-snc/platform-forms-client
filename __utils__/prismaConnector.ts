import { mockReset, DeepMockProxy } from "jest-mock-extended";
import { prisma, PrismaClient } from "@gcforms/database";

jest.mock("@gcforms/database", () => {
  // Only mock prisma when were running in the Node jest environment
  if (typeof window === "undefined") {
    const originalModule = jest.requireActual("@gcforms/database");
    const { mockDeep } = jest.requireActual("jest-mock-extended");
    return {
      __esModule: true,
      ...originalModule,
      prisma: mockDeep() as DeepMockProxy<PrismaClient>,
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
