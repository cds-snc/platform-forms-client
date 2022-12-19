import "@testing-library/jest-dom";
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

jest.mock("@lib/hooks/useFlag", () => ({
  useFlag: jest.fn((flag) => (initialSettings as Record<string, boolean>)[flag]),
}));
