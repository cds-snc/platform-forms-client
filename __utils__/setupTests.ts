import "@testing-library/jest-dom";
import { jest } from "@jest/globals";
import initialSettings from "../flag_initialization/default_flag_settings.json";

jest.mock("next/config", () => () => ({
  publicRuntimeConfig: {
    isProduction: false,
  },
}));

jest.mock("next-i18next", () => ({
  useTranslation: () => {
    return {
      t: (str: string) => str,
      i18n: {
        changeLanguage: () => Promise.resolve(),
      },
    };
  },
}));

jest.mock("@lib/integration/redisConnector", () => ({
  getRedisInstance: jest.fn(),
}));

jest.mock("@lib/auditLogs");

jest.mock("@lib/hooks/useFlag", () => ({
  useFlag: jest.fn((flag: string) => (initialSettings as Record<string, boolean>)[flag]),
}));

// Common secrets needed for functionality
// Overwrite incase accidently injected
process.env = {
  ...process.env,
  TOKEN_SECRET: "testsecret",
  APP_ENV: "test",
  DATABASE_URL: "postgres://postgres:postgres@localhost:5432",
};
