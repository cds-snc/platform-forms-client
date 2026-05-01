import "@testing-library/jest-dom/vitest";
import type { ReactNode } from "react";
import { vi } from "vitest";
import { createTranslationMocks } from "./translationTestHelpers";

// IMPORTANT: Mock next-auth modules BEFORE any imports that use them
// This prevents next-auth from trying to import next/server at load time

vi.mock("next/server", () => ({
  headers: () => new Map(),
  cookies: () => ({ get: () => undefined }),
  NextRequest: class {
    method: string;
    url: string;
    cookies: string;
    private request: Request;
    constructor(request: Request) {
      this.request = request;
      this.method = request.method;
      this.url = request.url;
      this.cookies = "";
    }
    json = async () => {
      try {
        const text = await this.request.text();
        return text ? JSON.parse(text) : {};
      } catch {
        return {};
      }
    };
  },
  NextResponse: class {
    constructor(
      public body: string | null,
      public init?: Record<string, unknown>
    ) {}
    static json(data: unknown) {
      const response = new this(JSON.stringify(data));
      response.json = async () => data;
      return response;
    }
    static next() {
      return new this(null);
    }
    json = async () => {
      try {
        return JSON.parse(this.body || "{}");
      } catch {
        return {};
      }
    };
  },
}));

vi.mock("next/headers", () => {
  const mockState = { tokenValue: null as string | null };

  const createHeadersObject = () => ({
    get: vi.fn((name: string) => {
      if (name === "x-csrf-token") {
        return mockState.tokenValue;
      }
      return null;
    }),
  });

  return {
    headers: vi.fn(async () => createHeadersObject()),
    cookies: vi.fn(async () => {
      return {
        get: vi.fn(),
      };
    }),
    __mockState: mockState,
  };
});

vi.mock("next-auth", () => ({
  default: () => ({
    handlers: { GET: () => {}, POST: () => {} },
    auth: async () => ({ user: { email: "test@example.com" } }),
    signIn: async () => {},
    signOut: async () => {},
  }),
  CredentialsSignin: class {},
}));

vi.mock("next-auth/jwt", () => ({
  encode: async () => "token",
  decode: async () => ({}),
}));

vi.mock("next-auth/providers/credentials", () => ({
  default: () => ({}),
}));

// Mock the env module early to prevent next/server import
vi.doMock("next-auth/lib/env", () => ({
  AUTH_URL: "http://localhost:3000",
  AUTH_SECRET: "test-secret",
}));

vi.mock("@i18n/client", () => createTranslationMocks());
vi.mock("@root/i18n/client", () => createTranslationMocks());

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

// Mock server-only module for tests (we're in jsdom which is client environment)
vi.mock("server-only", () => ({}));

// Mock useFeatureFlags to avoid auth/session calls
vi.mock("@lib/hooks/useFeatureFlags", () => ({
  useFeatureFlags: () => ({
    getFlag: () => false,
  }),
}));

// Mock NextAuth to avoid session fetch errors
vi.mock("next-auth/react", () => ({
  __esModule: true,
  useSession: vi.fn(() => ({
    data: { user: { email: "test@example.com" } },
    status: "authenticated",
  })),
  getSession: vi.fn(async () => ({ user: { email: "test@example.com" } })),
  signOut: vi.fn(async () => undefined),
  signIn: vi.fn(async () => undefined),
  SessionProvider: ({ children }: { children: ReactNode }) => children,
}));

interface RedirectError extends Error {
  url: string;
}

vi.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: vi.fn(() => ({ prefetch: vi.fn() })),
  useSearchParams: vi.fn(() => ({ get: vi.fn() })),
  useParams: vi.fn(() => vi.fn()),
  redirect: vi.fn((url: string) => {
    const error = new Error("NEXT_REDIRECT") as RedirectError;
    error.url = url;
    throw error;
  }),
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

vi.mock("@formBuilder/actions", () => ({
  __esModule: true,
  getTranslatedElementProperties: vi.fn(),
  getTranslatedProperties: vi.fn(),
}));

vi.mock("@lib/actions/auth", () => ({
  __esModule: true,
  AuthenticatedAction:
    <Input extends unknown[], Result>(
      action: (_session: unknown, ...args: Input) => Promise<Result>
    ) =>
    async (...args: Input) =>
      action({ user: { email: "test@example.com" } }, ...args),
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
