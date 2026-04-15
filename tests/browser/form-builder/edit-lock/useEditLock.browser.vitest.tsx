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

class MockBroadcastChannel {
  static channels = new Map<string, Set<MockBroadcastChannel>>();

  static reset() {
    MockBroadcastChannel.channels.clear();
  }

  name: string;
  private listeners = new Set<(event: MessageEvent) => void>();

  constructor(name: string) {
    this.name = name;
    const channels = MockBroadcastChannel.channels.get(name) ?? new Set<MockBroadcastChannel>();
    channels.add(this);
    MockBroadcastChannel.channels.set(name, channels);
  }

  addEventListener(_type: string, listener: EventListener) {
    this.listeners.add(listener as (event: MessageEvent) => void);
  }

  removeEventListener(_type: string, listener: EventListener) {
    this.listeners.delete(listener as (event: MessageEvent) => void);
  }

  postMessage(data: unknown) {
    const channels = MockBroadcastChannel.channels.get(this.name) ?? new Set<MockBroadcastChannel>();
    channels.forEach((channel) => {
      if (channel === this) {
        return;
      }

      const event = new MessageEvent("message", { data });
      channel.listeners.forEach((listener) => listener(event));
    });
  }

  close() {
    const channels = MockBroadcastChannel.channels.get(this.name);
    channels?.delete(this);
    if (channels && channels.size === 0) {
      MockBroadcastChannel.channels.delete(this.name);
    }
  }
}

const setDocumentVisibility = (visibilityState: DocumentVisibilityState) => {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    value: visibilityState,
  });
};

const setDocumentFocus = (isFocused: boolean) => {
  Object.defineProperty(document, "hasFocus", {
    configurable: true,
    value: () => isFocused,
  });
};

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
  onLockStateChange,
}: {
  onTakeoverReady?: (takeover: () => Promise<void>) => void;
  onChangeKey?: (changeKey: string) => void;
  onLockStateChange?: (state: { isLockedByOther: boolean; hasEditLock: boolean }) => void;
}) {
  const changeKey = useTemplateStore((s) => s.changeKey);
  const isLockedByOther = useTemplateStore((s) => s.isLockedByOther);
  const editLock = useTemplateStore((s) => s.editLock);
  const { takeover } = useEditLock({
    formId: "test-form-id",
    enabled: true,
    sessionId: "session-1",
  });

  useEffect(() => {
    onTakeoverReady?.(takeover);
  }, [onTakeoverReady, takeover]);

  useEffect(() => {
    onChangeKey?.(changeKey);
  }, [changeKey, onChangeKey]);

  useEffect(() => {
    onLockStateChange?.({
      isLockedByOther,
      hasEditLock: editLock !== null,
    });
  }, [editLock, isLockedByOther, onLockStateChange]);

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
    MockBroadcastChannel.reset();
    templateUpdatedAt = Date.parse("2026-03-31T12:00:00.000Z");
    vi.stubGlobal("EventSource", MockEventSource);
    vi.stubGlobal("BroadcastChannel", MockBroadcastChannel);
    setDocumentVisibility("visible");
    setDocumentFocus(true);
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

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/templates/test-form-id/edit-lock",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"action":"takeover-save-complete"'),
        })
      );
    });

    expect(saveDraftIfNeeded).not.toHaveBeenCalled();
  });

  it("does not release on unmount during a takeover handoff", async () => {
    const saveDraftDeferred = Promise.resolve({ status: "saved" as const });
    saveDraft.mockImplementationOnce(() => saveDraftDeferred);

    const rendered = await render(<EditLockHarness />);

    await vi.waitFor(() => {
      expect(MockEventSource.instances).toHaveLength(1);
    });

    MockEventSource.instances[0].emit("takeover-requested");
    rendered.unmount();

    await saveDraftDeferred;

    await vi.waitFor(() => {
      expect(saveDraft).toHaveBeenCalledTimes(1);
    });

    const lockPostBodies = fetchMock.mock.calls
      .filter(([input, init]) => {
        return String(input).endsWith("/edit-lock") && init?.method === "POST";
      })
      .map(([, init]) => JSON.parse(String(init?.body)) as { action: string });

    expect(lockPostBodies.filter(({ action }) => action === "release")).toHaveLength(0);
    expect(lockPostBodies.filter(({ action }) => action === "takeover-save-complete")).toHaveLength(
      1
    );
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

  it("does not release and reacquire after takeover refresh updates updatedAt", async () => {
    const freshUpdatedAt = "2026-03-31T12:00:03.000Z";
    templateUpdatedAt = Date.parse("2026-03-31T12:00:00.000Z");

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
            updatedAt: freshUpdatedAt,
          }),
        } as Response;
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    let takeover: (() => Promise<void>) | undefined;

    await render(<EditLockHarness onTakeoverReady={(nextTakeover) => (takeover = nextTakeover)} />);

    await vi.waitFor(() => {
      expect(takeover).toBeDefined();
      expect(MockEventSource.instances).toHaveLength(1);
    });

    await takeover?.();

    await vi.waitFor(() => {
      expect(setUpdatedAt).toHaveBeenCalledWith(Date.parse(freshUpdatedAt));
    });

    const lockPostBodies = fetchMock.mock.calls
      .filter(([input, init]) => {
        return String(input).endsWith("/edit-lock") && init?.method === "POST";
      })
      .map(([, init]) => JSON.parse(String(init?.body)) as { action: string });

    expect(lockPostBodies.filter(({ action }) => action === "acquire")).toHaveLength(1);
    expect(lockPostBodies.filter(({ action }) => action === "takeover")).toHaveLength(1);
    expect(lockPostBodies.filter(({ action }) => action === "release")).toHaveLength(0);
    expect(MockEventSource.instances).toHaveLength(1);
  });

  it("does not mark the form as locked by another user when the edit-lock endpoint is unauthorized", async () => {
    const lockStates: Array<{ isLockedByOther: boolean; hasEditLock: boolean }> = [];

    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url.endsWith("/edit-lock") && init?.method === "POST") {
        return {
          ok: false,
          json: async () => ({ error: "Unauthorized" }),
        } as Response;
      }

      if (url.endsWith("/edit-lock") && init?.method === "GET") {
        return {
          ok: false,
          json: async () => ({ error: "Unauthorized" }),
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

    await render(<EditLockHarness onLockStateChange={(state) => lockStates.push(state)} />);

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/templates/test-form-id/edit-lock",
        expect.objectContaining({ method: "POST" })
      );
    });

    expect(lockStates.at(-1)).toEqual({ isLockedByOther: false, hasEditLock: false });
  });

  it("does not open an EventSource when the tab is not active", async () => {
    setDocumentVisibility("hidden");
    setDocumentFocus(false);

    await render(<EditLockHarness />);

    await vi.waitFor(() => {
      expect(MockEventSource.instances).toHaveLength(0);
    });
  });
});
