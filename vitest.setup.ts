import "@testing-library/jest-dom";
import "./styles/app.scss"; // Load main styles for browser mode tests
import { vi } from "vitest";

// Global test setup for Vitest browser mode

// Mock i18n for components that use translations
vi.mock("@i18n/client", () => ({
  useTranslation: vi.fn(() => ({
    t: (str: string) => str,
    i18n: {
      language: "en",
      changeLanguage: vi.fn(async () => undefined),
    },
  })),
}));
