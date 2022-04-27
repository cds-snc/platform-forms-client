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
  rootDir: "./",
  testPathIgnorePatterns: ["<rootDir>/cypress/", "<rootDir>/public/static/scripts/"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),
  moduleDirectories: ["node_modules", "<rootDir>/"],
  clearMocks: true,
  setupFilesAfterEnv: ["<rootDir>/lib/tests/setupTests.ts"],
  testEnvironment: "jest-environment-jsdom",
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
