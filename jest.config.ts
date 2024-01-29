/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */
import nextJest from "next/jest.js";
import { pathsToModuleNameMapper } from "ts-jest";
import type { Config } from "jest";
import { compilerOptions } from "./tsconfig.json";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

const customJestConfig: Config = {
  workerIdleMemoryLimit: "1G",
  testPathIgnorePatterns: [
    "<rootDir>/cypress/",
    "<rootDir>/public/static/scripts/",
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/__utils__/",
    "<rootDir>/__fixtures__/",
    "<rootDir>/__tests__/",
  ],
  testMatch: ["/**/*.test.+(ts|tsx|js|jsx)"],
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, {
      prefix: "<rootDir>/",
    }),
    "^next-auth/(.*)$": "<rootDir>/__utils__/mocks/next-auth/$1",
  },
  moduleDirectories: ["node_modules", "<rootDir>"],
  clearMocks: true,
  setupFiles: ["<rootDir>/__utils__/jestShim.ts"],
  setupFilesAfterEnv: [
    "<rootDir>/__utils__/setupTests.ts",
    "<rootDir>/__utils__/prismaConnector.ts",
  ],
  testEnvironment: "jsdom",
  preset: "ts-jest/presets/js-with-ts",
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
//export default createJestConfig(customJestConfig);
export default async () => ({
  ...(await createJestConfig(customJestConfig)()),
  transformIgnorePatterns: ["/node_modules/(?!(next-auth|@auth)/)"],
});
