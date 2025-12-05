import { vi } from "vitest";

// Mock NextAuth to prevent auth API calls that cause ClientFetchError
vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: null,
    status: "unauthenticated",
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  signIn: vi.fn(),
  signOut: vi.fn(),
  getCsrfToken: vi.fn(),
  getProviders: vi.fn(),
  getSession: vi.fn(),
}));
