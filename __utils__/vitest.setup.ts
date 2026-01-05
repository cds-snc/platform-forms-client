import { vi } from "vitest";

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

// NOW import testing library stuff
import "@testing-library/jest-dom";
import "@i18n/client";

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
  useSession: () => ({
    data: { user: { email: "test@example.com" } },
    status: "authenticated",
  }),
  getSession: () => Promise.resolve({ user: { email: "test@example.com" } }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));
