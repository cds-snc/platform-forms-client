import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.mock("axios");

vi.mock("@lib/auth/nextAuth", () => ({
  __esModule: true,
  auth: vi.fn(async () => null),
  signIn: vi.fn(async () => undefined),
  signOut: vi.fn(async () => undefined),
}));

vi.mock("@lib/client/csrfToken", () => ({
  __esModule: true,
  getCsrfToken: vi.fn(() => "testtoken"),
}));

vi.mock("next-auth/react", () => ({
  __esModule: true,
  useSession: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
}));

interface RedirectError extends Error {
  url: string;
}

vi.mock("next/navigation", () => ({
  __esmodule: true,
  useRouter: vi.fn(() => ({ prefetch: vi.fn() })),
  useSearchParams: vi.fn(() => ({ get: vi.fn() })),
  useParams: vi.fn(() => vi.fn()),
  redirect: vi.fn((url: string) => {
    const error = new Error("NEXT_REDIRECT") as RedirectError;
    error.url = url;
    throw error;
  }),
}));

vi.mock("next/headers", () => ({
  _esModule: true,
  headers: vi.fn(() => ({ get: vi.fn<(name: string) => string | null>() })),
  cookies: vi.fn(() => ({ get: vi.fn<(name: string) => string | null>() })),
}));

vi.mock("@i18n/client", () => ({
  __esModule: true,
  useTranslation: vi.fn(() => ({
    t: (str: string) => str,
    i18n: { language: "en", changeLanguage: vi.fn(async () => undefined) },
  })),
}));

vi.mock("@i18n", () => ({
  __esModule: true,
  serverTranslation: vi.fn(async () => ({ i18n: { language: "en" } })),
}));

vi.mock("@lib/auditLogs", () => ({
  __esModule: true,
  logEvent: vi.fn(vi.fn(async () => undefined)),
}));

vi.mock("@lib/logger", () => ({
  __esModule: true,
  logMessage: {
    info: vi.fn(async () => undefined),
    error: vi.fn(async () => undefined),
    warn: vi.fn(async () => undefined),
    debug: vi.fn(async () => undefined),
  },
}));

vi.mock("app/(gcforms)/[locale]/(form filler)/id/[...props]/actions", () => ({
  __esModule: true,
  submitForm: vi.fn(),
}));

vi.mock("@formBuilder/actions", () => ({
  __esModule: true,
  getTranslatedElementProperties: vi.fn(),
  getTranslatedProperties: vi.fn(),
}));

vi.mock("@lib/actions/auth", () => ({
  __esModule: true,
  authCheckAndThrow: vi.fn(),
  authCheckAndRedirect: vi.fn(),
}));

vi.mock("@lib/integration/redisConnector", async () => {
  const Redis = (await import("ioredis-mock")).default;
  const redis = new Redis();
  return { getRedisInstance: vi.fn(async () => redis) };
});

vi.mock("file-type", () => ({
  __esModule: true,
  fileTypeFromBuffer: vi.fn((_buffer: Uint8Array | ArrayBuffer) => Promise.resolve(undefined)),
}));

process.env = {
  ...process.env,
  TOKEN_SECRET: "testsecret",
  APP_ENV: "test",
  NEXT_PUBLIC_APP_ENV: "test",
  DATABASE_URL: "postgres://postgres:postgres@localhost:5432",
};
