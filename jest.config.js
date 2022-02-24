/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */
module.exports = {
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/cypress/",
    "<rootDir>/public/static/scripts/",
  ],
  moduleNameMapper: {
    "\\.(css|less|scss|sss|styl)$": "<rootDir>/node_modules/jest-css-modules",
    "^@lib/(.*)$": "<rootDir>/lib/$1",
    "^@components/(.*)$": "<rootDir>/components/$1",
  },
  clearMocks: true,
  transform: {
    "\\.[jt]sx?$": "babel-jest",
  },
  setupFilesAfterEnv: ["<rootDir>/lib/tests/setupTests.ts", "jest-chain"],
  testEnvironment: "jsdom",
};
