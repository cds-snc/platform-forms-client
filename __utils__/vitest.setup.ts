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
