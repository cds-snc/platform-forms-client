import "@testing-library/jest-dom";
import { jest } from "@jest/globals";
import initialSettings from "../flag_initialization/default_flag_settings.json";
import "@i18n/client";

global.jest = jest;

jest.mock("axios");

jest.mock("@lib/client/csrfToken", () => ({
  __esModule: true,
  getCsrfToken: jest.fn(() => "testtoken"),
}));

jest.mock("next-auth/react", () => {
  return {
    __esModule: true,
    useSession: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
  };
});

jest.mock("next/navigation", () => ({
  __esmodule: true,
  useRouter() {
    return {
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return {
      get: jest.fn(() => null),
    };
  },
  useParams() {
    return [];
  },
}));

jest.mock("next/config", () => () => ({
  publicRuntimeConfig: {
    isProduction: false,
  },
}));

jest.mock("@i18n/client", () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str,
      i18n: {
        language: "en",
        changeLanguage: () => Promise.resolve(),
      },
    };
  },
}));

jest.mock("@lib/integration/redisConnector", () => ({
  __esModule: true,
  getRedisInstance: jest.fn(),
}));

jest.mock("@lib/auditLogs", () => ({
  __esModule: true,
  logEvent: jest.fn(),
}));

jest.mock("@lib/hooks/useFlag", () => ({
  __esModule: true,
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
