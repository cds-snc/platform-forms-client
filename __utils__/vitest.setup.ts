import { vi } from "vitest";

// IMPORTANT: Mock next-auth modules BEFORE any imports that use them
// This prevents next-auth from trying to import next/server at load time

vi.mock("next/server", () => ({
  headers: () => new Map(),
  cookies: () => ({ get: () => undefined }),
}));

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
