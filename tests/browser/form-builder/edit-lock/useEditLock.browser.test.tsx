import { useEffect } from "react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "../testUtils";
import { setupFonts } from "../../helpers/setupFonts";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { EDIT_LOCK_HEARTBEAT_INTERVAL_MS } from "@root/constants";

const saveDraft = vi.fn(async () => ({ status: "saved" as const }));
const saveDraftIfNeeded = vi.fn(async () => ({ status: "skipped" as const }));
const resetState = vi.fn();
const setUpdatedAt = vi.fn();
const templateIsDirty = { current: false };
let templateUpdatedAt: number | undefined;
let fetchMock: ReturnType<typeof vi.fn>;

// Keep useEditLock in an authenticated editing state for every test case.
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

// Expose the template-context side effects so tests can assert save and refresh behavior.
vi.mock("@lib/hooks/form-builder/useTemplateContext", () => ({
  useTemplateContext: () => ({
    templateIsDirty,
    resetState,
    saveDraft,
    saveDraftIfNeeded,
    setUpdatedAt,
    updatedAt: templateUpdatedAt,
  }),
}));

import { useEditLock } from "@lib/hooks/form-builder/useEditLock";

// EventSource is mocked so tests can drive lock-status and takeover events directly.
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

// BroadcastChannel is mocked to keep any cross-tab coordination deterministic in tests.
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
    const channels =
      MockBroadcastChannel.channels.get(this.name) ?? new Set<MockBroadcastChannel>();
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

const getRequestUrl = (input: RequestInfo | URL) => new URL(String(input), "https://example.test");

const isEditLockRequest = (input: RequestInfo | URL, method?: string, requestType?: string) => {
  const url = getRequestUrl(input);

  if (url.pathname !== "/api/templates/test-form-id/edit-lock") {
    return false;
  }

  if (requestType && url.searchParams.get("requestType") !== requestType) {
    return false;
  }

  return !method || method.length > 0;
};

const isTemplateRequest = (input: RequestInfo | URL) => {
  const url = getRequestUrl(input);
  return url.pathname === "/api/templates/test-form-id";
};

// Shared happy-path lock payload: the current browser tab is User A and starts
// each test as the active lock owner unless a test overrides the response.
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

// Minimal component that mounts useEditLock and exposes the bits that the tests
// need to observe, such as lock ownership changes and the imperative takeover action.
function EditLockHarness({
  onTakeoverReady,
  onChangeKey,
  onLockStateChange,
  onActiveTabChange,
  onSessionExpiredChange,
  ownerIdleTimeoutMs,
}: {
  onTakeoverReady?: (takeover: () => Promise<void>) => void;
  onChangeKey?: (changeKey: string) => void;
  onLockStateChange?: (state: { isLockedByOther: boolean; hasEditLock: boolean }) => void;
  onActiveTabChange?: (isActiveTab: boolean) => void;
  onSessionExpiredChange?: (hasSessionExpired: boolean) => void;
  ownerIdleTimeoutMs?: number;
}) {
  const changeKey = useTemplateStore((s) => s.changeKey);
  const isLockedByOther = useTemplateStore((s) => s.isLockedByOther);
  const editLock = useTemplateStore((s) => s.editLock);
  const { takeover, getIsActiveTab, hasSessionExpired } = useEditLock({
    formId: "test-form-id",
    enabled: true,
    sessionId: "session-1",
    ownerIdleTimeoutMs,
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
    onActiveTabChange?.(getIsActiveTab());
  }, [getIsActiveTab, onActiveTabChange]);

  useEffect(() => {
    onSessionExpiredChange?.(hasSessionExpired);
  }, [hasSessionExpired, onSessionExpiredChange]);

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
    templateIsDirty.current = false;
    templateUpdatedAt = Date.parse("2026-03-31T12:00:00.000Z");
    vi.stubGlobal("EventSource", MockEventSource);
    vi.stubGlobal("BroadcastChannel", MockBroadcastChannel);
    setDocumentVisibility("visible");
    setDocumentFocus(true);

    // Default network behavior for most tests: User A owns the lock and all
    // edit-lock reads and writes reflect that stable server state.
    fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = getRequestUrl(input);

      if (
        isEditLockRequest(input, init?.method, url.searchParams.get("requestType") ?? undefined) &&
        init?.method === "POST"
      ) {
        return {
          ok: true,
          json: async () => ownerLockStatus,
        } as Response;
      }

      if (
        isEditLockRequest(input, init?.method, url.searchParams.get("requestType") ?? undefined) &&
        init?.method === "GET"
      ) {
        return {
          ok: true,
          json: async () => ownerLockStatus,
        } as Response;
      }

      if (isTemplateRequest(input)) {
        return {
          ok: true,
          json: async () => ({ form: { elements: [] }, updatedAt: new Date().toISOString() }),
        } as Response;
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
  });

  it("refreshes until it sees a newer server version after takeover", async () => {
    const staleUpdatedAt = "2026-03-31T12:00:00.000Z";
    const freshUpdatedAt = "2026-03-31T12:00:03.000Z";
    templateUpdatedAt = Date.parse(staleUpdatedAt);

    const updatedAtResponses = [staleUpdatedAt, staleUpdatedAt, freshUpdatedAt];
    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = getRequestUrl(input);

      if (isEditLockRequest(input) && init?.method === "POST") {
        return {
          ok: true,
          json: async () => ownerLockStatus,
        } as Response;
      }

      if (isEditLockRequest(input) && init?.method === "GET") {
        return {
          ok: true,
          json: async () => ownerLockStatus,
        } as Response;
      }

      if (isTemplateRequest(input)) {
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

    const formFetchCalls = fetchMock.mock.calls.filter(([input]) => isTemplateRequest(input));

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
      const url = getRequestUrl(input);

      if (isEditLockRequest(input) && init?.method === "POST") {
        return {
          ok: true,
          json: async () => ownerLockStatus,
        } as Response;
      }

      if (isEditLockRequest(input) && init?.method === "GET") {
        return {
          ok: true,
          json: async () => ownerLockStatus,
        } as Response;
      }

      if (isTemplateRequest(input)) {
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
    });

    await takeover?.();

    await vi.waitFor(() => {
      expect(setUpdatedAt).toHaveBeenCalledWith(Date.parse(freshUpdatedAt));
    });

    const lockPostBodies = fetchMock.mock.calls
      .filter(([input, init]) => {
        return isEditLockRequest(input) && init?.method === "POST";
      })
      .map(([, init]) => JSON.parse(String(init?.body)) as { action: string });

    expect(lockPostBodies.filter(({ action }) => action === "acquire")).toHaveLength(1);
    expect(lockPostBodies.filter(({ action }) => action === "takeover")).toHaveLength(1);
    expect(lockPostBodies.filter(({ action }) => action === "release")).toHaveLength(0);
  });

  it("does not mark the form as locked by another user when the edit-lock endpoint is unauthorized", async () => {
    const lockStates: Array<{ isLockedByOther: boolean; hasEditLock: boolean }> = [];

    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = getRequestUrl(input);

      if (isEditLockRequest(input) && init?.method === "POST") {
        return {
          ok: false,
          json: async () => ({ error: "Unauthorized" }),
        } as Response;
      }

      if (isEditLockRequest(input) && init?.method === "GET") {
        return {
          ok: false,
          json: async () => ({ error: "Unauthorized" }),
        } as Response;
      }

      if (isTemplateRequest(input)) {
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
        "/api/templates/test-form-id/edit-lock?requestType=acquire",
        expect.objectContaining({ method: "POST" })
      );
    });

    expect(lockStates.at(-1)).toEqual({ isLockedByOther: false, hasEditLock: false });
  });

  it("keeps the visible focused tab marked active while edit-lock presence is mounted", async () => {
    const activeTabStates: boolean[] = [];

    await render(
      <EditLockHarness onActiveTabChange={(isActiveTab) => activeTabStates.push(isActiveTab)} />
    );

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/templates/test-form-id/edit-lock?requestType=acquire",
        expect.objectContaining({ method: "POST" })
      );
    });

    expect(MockBroadcastChannel.channels.size).toBe(1);
    expect(activeTabStates.at(-1)).toBe(true);
  });

  it("does not include presence activity in edit-lock requests", async () => {
    setDocumentVisibility("hidden");

    await render(<EditLockHarness />);

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/templates/test-form-id/edit-lock?requestType=acquire",
        expect.objectContaining({ method: "POST" })
      );
    });

    const acquireRequest = fetchMock.mock.calls.find(([input, init]) => {
      return isEditLockRequest(input, init?.method, "acquire") && init?.method === "POST";
    });

    const body = JSON.parse(String(acquireRequest?.[1]?.body)) as {
      action: string;
      activity?: {
        lastActivityAt: string;
        visibilityState: string;
        presenceStatus: string;
      };
    };

    expect(body.action).toBe("acquire");
    expect(body.activity).toBeUndefined();
  });

  it("syncs and switches to polling when a heartbeat shows another user won the lock", async () => {
    // useEditLock drives heartbeats with setInterval, so fake timers let the test
    // freeze time at mount and then trigger exactly one heartbeat on demand.
    vi.useFakeTimers();

    // User A started as the lock owner, but after a Redis restart User B wins
    // the reacquire race and becomes the new owner.
    const lockedByOtherStatus = {
      locked: true,
      lockedByOther: true,
      isOwner: false,
      lock: {
        ...ownerLockStatus.lock,
        lockedByUserId: "user-2",
        lockedByName: "User Two",
        lockedByEmail: "user.two@example.com",
        sessionId: "session-2",
      },
    };

    const freshUpdatedAt = "2026-03-31T12:00:03.000Z";
    const lockStates: Array<{ isLockedByOther: boolean; hasEditLock: boolean }> = [];

    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = getRequestUrl(input);

      if (isEditLockRequest(input) && init?.method === "POST") {
        const body = JSON.parse(String(init.body)) as { action: string };

        // The first acquire is the initial mount where User A legitimately owns
        // the form. After that, the server consistently reports that User B owns it.
        if (body.action === "acquire") {
          return {
            ok: true,
            json: async () => ownerLockStatus,
          } as Response;
        }

        if (body.action === "heartbeat") {
          // The first heartbeat is where User A learns that ownership already moved.
          return {
            ok: true,
            json: async () => lockedByOtherStatus,
          } as Response;
        }

        return {
          ok: true,
          json: async () => lockedByOtherStatus,
        } as Response;
      }

      if (isEditLockRequest(input) && init?.method === "GET") {
        return {
          ok: true,
          json: async () => lockedByOtherStatus,
        } as Response;
      }

      if (isTemplateRequest(input)) {
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

    await render(<EditLockHarness onLockStateChange={(state) => lockStates.push(state)} />);

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/templates/test-form-id/edit-lock?requestType=acquire",
        expect.objectContaining({ method: "POST" })
      );
    });

    // Move the fake clock forward by one heartbeat interval so the callback
    // inside useEditLock runs exactly once.
    await vi.advanceTimersByTimeAsync(EDIT_LOCK_HEARTBEAT_INTERVAL_MS);

    await vi.waitFor(() => {
      // Once ownership is lost, useEditLock should refresh the form from the server
      // and move into the locked-by-other fallback flow.
      expect(setUpdatedAt).toHaveBeenCalledWith(Date.parse(freshUpdatedAt));
    });

    expect(saveDraftIfNeeded).toHaveBeenCalledTimes(1);
    expect(lockStates.at(-1)).toEqual({ isLockedByOther: true, hasEditLock: true });

    // Reset the timer implementation so later tests use real browser timing again.
    vi.useRealTimers();
  });

  it("falls back to manual takeover when heartbeat shows the lock disappeared", async () => {
    // Fake timers give the test full control over when the heartbeat interval fires.
    vi.useFakeTimers();

    // Redis lost the lock key, so the heartbeat briefly sees "no owner".
    const unlockedStatus = {
      locked: false,
      lockedByOther: false,
      isOwner: false,
      lock: null,
    };

    const lockStates: Array<{ isLockedByOther: boolean; hasEditLock: boolean }> = [];

    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = getRequestUrl(input);

      if (isEditLockRequest(input) && init?.method === "POST") {
        const body = JSON.parse(String(init.body)) as { action: string };

        if (body.action === "acquire") {
          return {
            ok: true,
            json: async () => ownerLockStatus,
          } as Response;
        }

        if (body.action === "heartbeat") {
          return {
            ok: true,
            json: async () => unlockedStatus,
          } as Response;
        }

        return {
          ok: true,
          json: async () => ownerLockStatus,
        } as Response;
      }

      if (isEditLockRequest(input) && init?.method === "GET") {
        return {
          ok: true,
          json: async () => unlockedStatus,
        } as Response;
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    await render(<EditLockHarness onLockStateChange={(state) => lockStates.push(state)} />);

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/templates/test-form-id/edit-lock?requestType=acquire",
        expect.objectContaining({ method: "POST" })
      );
    });

    // Advance one heartbeat tick: useEditLock sees the missing lock, tries an
    // auto-save, and falls back to a manual takeover state.
    await vi.advanceTimersByTimeAsync(EDIT_LOCK_HEARTBEAT_INTERVAL_MS);

    await vi.waitFor(() => {
      expect(saveDraftIfNeeded).toHaveBeenCalledTimes(1);
    });

    const lockPostBodies = fetchMock.mock.calls
      .filter(([input, init]) => {
        return isEditLockRequest(input) && init?.method === "POST";
      })
      .map(([, init]) => JSON.parse(String(init?.body)) as { action: string });

    expect(lockPostBodies.filter(({ action }) => action === "acquire")).toHaveLength(1);
    expect(setUpdatedAt).not.toHaveBeenCalled();
    expect(lockStates.at(-1)).toEqual({ isLockedByOther: true, hasEditLock: false });

    // Always restore real timers so this test does not leak clock state.
    vi.useRealTimers();
  });

  it("shows session expired when an idle owner learns the lock disappeared before the idle timer callback runs", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-31T12:00:00.000Z"));

    const unlockedStatus = {
      locked: false,
      lockedByOther: false,
      isOwner: false,
      lock: null,
    };

    const sessionExpiredStates: boolean[] = [];

    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = getRequestUrl(input);

      if (isEditLockRequest(input) && init?.method === "POST") {
        const body = JSON.parse(String(init.body)) as { action: string };

        if (body.action === "acquire") {
          return {
            ok: true,
            json: async () => ownerLockStatus,
          } as Response;
        }

        if (body.action === "heartbeat") {
          return {
            ok: true,
            json: async () => unlockedStatus,
          } as Response;
        }

        return {
          ok: true,
          json: async () => ownerLockStatus,
        } as Response;
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    await render(
      <EditLockHarness
        ownerIdleTimeoutMs={15 * 60 * 1000}
        onSessionExpiredChange={(value) => sessionExpiredStates.push(value)}
      />
    );

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/templates/test-form-id/edit-lock?requestType=acquire",
        expect.objectContaining({ method: "POST" })
      );
    });

    // Simulate a suspended tab: the wall clock moves past the idle threshold,
    // but the client-side timeout callback has not fired yet.
    vi.setSystemTime(new Date("2026-03-31T12:15:01.000Z"));

    await vi.advanceTimersByTimeAsync(EDIT_LOCK_HEARTBEAT_INTERVAL_MS);

    await vi.waitFor(() => {
      expect(sessionExpiredStates.at(-1)).toBe(true);
    });

    vi.useRealTimers();
  });

  it("keeps local draft state intact when heartbeat loses the lock", async () => {
    // Fake timers let the test trigger one heartbeat after the lock disappears.
    vi.useFakeTimers();
    templateIsDirty.current = true;

    const unlockedStatus = {
      locked: false,
      lockedByOther: false,
      isOwner: false,
      lock: null,
    };

    let heartbeatCallCount = 0;

    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = getRequestUrl(input);

      if (isEditLockRequest(input) && init?.method === "POST") {
        const body = JSON.parse(String(init.body)) as { action: string };

        if (body.action === "heartbeat") {
          heartbeatCallCount += 1;
          return {
            ok: true,
            json: async () => unlockedStatus,
          } as Response;
        }

        return {
          ok: true,
          json: async () => ownerLockStatus,
        } as Response;
      }

      throw new Error(`Unexpected fetch: ${url}`);
    });

    await render(<EditLockHarness />);

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/templates/test-form-id/edit-lock?requestType=acquire",
        expect.objectContaining({ method: "POST" })
      );
    });

    // Advance one heartbeat tick: the lock is missing and local draft state
    // should remain untouched while the UI waits for a manual takeover.
    await vi.advanceTimersByTimeAsync(EDIT_LOCK_HEARTBEAT_INTERVAL_MS);

    await vi.waitFor(() => {
      expect(heartbeatCallCount).toBe(1);
    });

    const formFetchCalls = fetchMock.mock.calls.filter(([input]) => isTemplateRequest(input));
    const lockPostBodies = fetchMock.mock.calls
      .filter(([input, init]) => {
        return isEditLockRequest(input) && init?.method === "POST";
      })
      .map(([, init]) => JSON.parse(String(init?.body)) as { action: string });

    expect(setUpdatedAt).not.toHaveBeenCalled();
    expect(formFetchCalls).toHaveLength(0);
    expect(lockPostBodies.filter(({ action }) => action === "acquire")).toHaveLength(1);

    vi.useRealTimers();
  });

  it("does not start lock polling when edit locking is disabled", async () => {
    function DisabledHarness() {
      useEditLock({
        formId: "test-form-id",
        enabled: false,
        sessionId: "session-1",
      });

      return null;
    }

    await render(<DisabledHarness />);

    await new Promise((resolve) => window.setTimeout(resolve, 0));

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
