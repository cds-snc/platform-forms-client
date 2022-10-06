/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */
const nextJest = require("next/jest");
const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("./tsconfig");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  testPathIgnorePatterns: ["<rootDir>/cypress/", "<rootDir>/public/static/scripts/"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),
  moduleDirectories: ["node_modules", "<rootDir>/"],
  clearMocks: true,
  preset: "ts-jest/presets/js-with-ts",
  setupFiles: ["<rootDir>/__utils__/jestShim.ts"],
  setupFilesAfterEnv: [
    "<rootDir>/__utils__/setupTests.ts",
    "<rootDir>/__utils__/prismaConnector.ts",
  ],
  testEnvironment: "jsdom",
  collectCoverage: true,
  collectCoverageFrom: ["{pages,lib,components}/**/{!(*.stories),}.{ts,tsx}"],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
