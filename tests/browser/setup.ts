import { vi } from "vitest";

vi.mock("@clientComponents/forms/AddressComplete/actions", () => ({
  getAddressCompleteChoices: vi.fn().mockResolvedValue({ items: [], error: null }),
  getSelectedAddress: vi.fn().mockResolvedValue({ address: null, error: null }),
  getAddressCompleteRetrieve: vi.fn().mockResolvedValue({ items: [], error: null }),
}));

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
