import { useEffect } from "react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "../testUtils";
import { setupFonts } from "../../helpers/setupFonts";
import { useTemplateStore } from "@lib/store/useTemplateStore";

const saveDraft = vi.fn(async () => ({ status: "saved" as const }));
const saveDraftIfNeeded = vi.fn(async () => ({ status: "skipped" as const }));
const resetState = vi.fn();
const setUpdatedAt = vi.fn();
let templateUpdatedAt: number | undefined;
let fetchMock: ReturnType<typeof vi.fn>;

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { id: "user-1" } },
    status: "authenticated",
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
  signIn: vi.fn(),
  signOut: vi.fn(),
  getCsrfToken: vi.fn(),
  getProviders: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock("@lib/hooks/form-builder/useTemplateContext", () => ({
  useTemplateContext: () => ({
    resetState,
    saveDraft,
    saveDraftIfNeeded,
    setUpdatedAt,
    updatedAt: templateUpdatedAt,
  }),
}));

import { useEditLock } from "@lib/hooks/form-builder/useEditLock";

class MockEventSource {
  static instances: MockEventSource[] = [];

  static reset() {
    MockEventSource.instances = [];
  }

  url: string;
  readyState = 1;
  onerror: ((this: EventSource, ev: Event) => unknown) | null = null;
  private listeners = new Map<string, Set<EventListener>>();

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: EventListener) {
    const listeners = this.listeners.get(type) ?? new Set<EventListener>();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type: string, listener: EventListener) {
    this.listeners.get(type)?.delete(listener);
  }

  close() {
    this.readyState = 2;
  }

  emit(type: string, data?: string) {
    const event = new MessageEvent(type, { data: data ?? "{}" });
    this.listeners.get(type)?.forEach((listener) => listener(event));
  }
}

const ownerLockStatus = {
  locked: true,
  lockedByOther: false,
  isOwner: true,
  lock: {
    templateId: "test-form-id",
    lockedByUserId: "user-1",
    lockedByName: "User One",
    lockedByEmail: "user.one@example.com",
    lockedAt: new Date().toISOString(),
    heartbeatAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    lastActivityAt: new Date().toISOString(),
    visibilityState: "visible" as const,
    presenceStatus: "active" as const,
    sessionId: "session-1",
  },
};

function EditLockHarness({
  onTakeoverReady,
  onChangeKey,
}: {
  onTakeoverReady?: (takeover: () => Promise<void>) => void;
  onChangeKey?: (changeKey: string) => void;
}) {
  const changeKey = useTemplateStore((s) => s.changeKey);
  const { takeover } = useEditLock({ formId: "test-form-id", enabled: true, sessionId: "session-1" });

  useEffect(() => {
    onTakeoverReady?.(takeover);
  }, [onTakeoverReady, takeover]);

  useEffect(() => {
    onChangeKey?.(changeKey);
  }, [changeKey, onChangeKey]);

  useEffect(() => {
    return () => {
      vi.clearAllTimers();
    };
  }, []);

  return null;
}

describe("useEditLock", () => {
  beforeAll(() => {
    setupFonts();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    MockEventSource.reset();
    templateUpdatedAt = Date.parse("2026-03-31T12:00:00.000Z");
    vi.stubGlobal("EventSource", MockEventSource);
    fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.endsWith("/edit-lock") && init?.method === "POST") {
        return {
          ok: true,
          json: async () => ownerLockStatus,
        } as Response;
      }

      if (url.endsWith("/edit-lock") && init?.method === "GET") {
        return {
          ok: true,
          json: async () => ownerLockStatus,
        } as Response;
      }

      if (url.endsWith("/api/templates/test-form-id")) {
        return {
          ok: true,
          json: async () => ({ form: { elements: [] }, updatedAt: new Date().toISOString() }),
        } as Response;
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
  });

  it("flushes with saveDraft when a takeover is requested", async () => {
    await render(<EditLockHarness />);

    await vi.waitFor(() => {
      expect(MockEventSource.instances).toHaveLength(1);
    });

    MockEventSource.instances[0].emit("takeover-requested");

    await vi.waitFor(() => {
      expect(saveDraft).toHaveBeenCalledTimes(1);
    });

    expect(saveDraftIfNeeded).not.toHaveBeenCalled();
  });

  it("refreshes until it sees a newer server version after takeover", async () => {
    const staleUpdatedAt = "2026-03-31T12:00:00.000Z";
    const freshUpdatedAt = "2026-03-31T12:00:03.000Z";
    templateUpdatedAt = Date.parse(staleUpdatedAt);

    const updatedAtResponses = [staleUpdatedAt, staleUpdatedAt, freshUpdatedAt];
    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.endsWith("/edit-lock") && init?.method === "POST") {
        return {
          ok: true,
          json: async () => ownerLockStatus,
        } as Response;
      }

      if (url.endsWith("/edit-lock") && init?.method === "GET") {
        return {
          ok: true,
          json: async () => ownerLockStatus,
        } as Response;
      }

      if (url.endsWith("/api/templates/test-form-id")) {
        return {
          ok: true,
          json: async () => ({
            form: { elements: [] },
            updatedAt: updatedAtResponses.shift() ?? freshUpdatedAt,
          }),
        } as Response;
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    let takeover: (() => Promise<void>) | undefined;
    const changeKeys: string[] = [];

    await render(
      <EditLockHarness
        onTakeoverReady={(nextTakeover) => (takeover = nextTakeover)}
        onChangeKey={(changeKey) => changeKeys.push(changeKey)}
      />
    );

    await vi.waitFor(() => {
      expect(takeover).toBeDefined();
    });

    await takeover?.();

    await vi.waitFor(() => {
      expect(setUpdatedAt).toHaveBeenCalledWith(Date.parse(freshUpdatedAt));
    });

    const formFetchCalls = fetchMock.mock.calls.filter(([input]) =>
      String(input).endsWith("/api/templates/test-form-id")
    );

    expect(formFetchCalls).toHaveLength(3);
    formFetchCalls.forEach(([, init]) => {
      expect(init).toMatchObject({ method: "GET", cache: "no-store" });
    });

    expect(changeKeys.at(-1)).toBeDefined();
    expect(changeKeys.at(-1)).not.toBe(changeKeys[0]);
  });
});