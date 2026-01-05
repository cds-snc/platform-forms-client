import "@testing-library/jest-dom";
import "@i18n/client";
import { vi } from "vitest";

// Mock server-only module for tests (we're in jsdom which is client environment)
vi.mock("server-only", () => ({}));

// Mock next/server for next-auth
vi.mock("next/server", () => ({
  headers: () => new Map(),
  cookies: () => ({ get: () => undefined }),
}));
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
}));
