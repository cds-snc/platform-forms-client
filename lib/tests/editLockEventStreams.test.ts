import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Minimal Redis stream mock.
//
// The mock tracks pending XREAD promises per stream key and a message queue
// for entries that arrive before XREAD is called.  When xadd fires it either
// resolves a waiting XREAD promise or buffers the entry for the next poll.
// When disconnect() is called (stopTemplateReader) any in-flight XREAD is
// rejected so the reader loop exits cleanly.
// ---------------------------------------------------------------------------

type PendingXread = {
  resolve: (result: Array<[string, Array<[string, string[]]>]>) => void;
  reject: (err: Error) => void;
};

const streamWaiters = new Map<string, PendingXread>();
const streamQueues = new Map<string, Array<[string, string[]]>>();
let msgIdCounter = 0;

class MockRedisReaderConnection {
  streamKey: string | null = null;
  disconnected = false;

  xread = vi.fn((...args: unknown[]) => {
    if (this.disconnected) {
      return Promise.reject(new Error("disconnected"));
    }

    // Parse: BLOCK ms COUNT n STREAMS key id
    const streamsIdx = (args as string[]).indexOf("STREAMS");
    if (streamsIdx >= 0) {
      this.streamKey = String(args[streamsIdx + 1]);
    }

    const key = this.streamKey;
    if (!key) return Promise.resolve(null);

    // Return immediately if there are already queued entries.
    const queued = streamQueues.get(key);
    if (queued && queued.length > 0) {
      const entries = queued.splice(0, queued.length);
      return Promise.resolve([[key, entries]]);
    }

    // Otherwise block until xadd delivers a message or disconnect() fires.
    return new Promise<Array<[string, Array<[string, string[]]>]>>((resolve, reject) => {
      streamWaiters.set(key, { resolve, reject });
    });
  });

  disconnect = vi.fn(() => {
    this.disconnected = true;
    if (this.streamKey) {
      const pending = streamWaiters.get(this.streamKey);
      if (pending) {
        streamWaiters.delete(this.streamKey);
        pending.reject(new Error("disconnected"));
      }
    }
  });
}

const mockReaderConnections: MockRedisReaderConnection[] = [];

const xadd = vi.fn((...args: unknown[]) => {
  const streamKey = String(args[0]);
  // args: key, "*", "type", eventType, "templateId", templateId
  const typeIdx = (args as string[]).indexOf("type");
  const eventType = typeIdx >= 0 ? String(args[typeIdx + 1]) : null;
  const tidIdx = (args as string[]).indexOf("templateId");
  const templateId = tidIdx >= 0 ? String(args[tidIdx + 1]) : null;

  if (!eventType || !templateId) return Promise.resolve("0-0");

  msgIdCounter += 1;
  const id = `${msgIdCounter}-0`;
  const entry: [string, string[]] = [id, ["type", eventType, "templateId", templateId]];

  const pending = streamWaiters.get(streamKey);
  if (pending) {
    streamWaiters.delete(streamKey);
    pending.resolve([[streamKey, [entry]]]);
  } else {
    const q = streamQueues.get(streamKey) ?? [];
    q.push(entry);
    streamQueues.set(streamKey, q);
  }

  return Promise.resolve(id);
});

const expire = vi.fn(async () => 1);

vi.mock("@lib/integration/redisConnector", () => ({
  getRedisInstance: vi.fn(async () => ({
    xadd,
    expire,
    duplicate: vi.fn(() => {
      const reader = new MockRedisReaderConnection();
      mockReaderConnections.push(reader);
      return reader;
    }),
  })),
}));

import { publishEditLockPublishedEvent, requestEditLockTakeoverSave } from "@lib/editLocks";
import { subscribeToSharedEditLockEvents } from "@lib/editLockEventStreams";

describe("editLockEventStreams", () => {
  const originalRedisUrl = process.env.REDIS_URL;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.REDIS_URL = "redis://test";
    mockReaderConnections.length = 0;
    streamWaiters.clear();
    streamQueues.clear();
    msgIdCounter = 0;
    delete (globalThis as typeof globalThis & { __editLockEventStreamsState?: unknown })
      .__editLockEventStreamsState;
  });

  afterAll(() => {
    if (originalRedisUrl === undefined) {
      delete process.env.REDIS_URL;
      return;
    }

    process.env.REDIS_URL = originalRedisUrl;
  });

  it("starts one XREAD reader per template and routes events by template id", async () => {
    const formOneEvents: string[] = [];
    const formTwoEvents: string[] = [];

    const unsubscribeFormOne = await subscribeToSharedEditLockEvents("form-1", (event) => {
      formOneEvents.push(event.type);
    });
    const unsubscribeFormTwo = await subscribeToSharedEditLockEvents("form-2", (event) => {
      formTwoEvents.push(event.type);
    });

    // One dedicated reader connection per template.
    expect(mockReaderConnections).toHaveLength(2);
    expect(mockReaderConnections[0].xread).toHaveBeenCalledTimes(1);
    expect(mockReaderConnections[1].xread).toHaveBeenCalledTimes(1);

    // Publish an event for form-1 only.
    await requestEditLockTakeoverSave("form-1");

    // The reader loop processes the resolved xread in a subsequent microtask;
    // wait for it to call the subscriber before asserting.
    await vi.waitFor(() => {
      expect(formOneEvents).toEqual(["takeover-requested"]);
    });
    expect(formTwoEvents).toEqual([]);

    // Unsubscribing form-1 should stop only its reader.
    await unsubscribeFormOne();
    expect(mockReaderConnections[0].disconnect).toHaveBeenCalledTimes(1);
    expect(mockReaderConnections[1].disconnect).not.toHaveBeenCalled();

    // Unsubscribing form-2 should stop its reader too.
    await unsubscribeFormTwo();
    expect(mockReaderConnections[1].disconnect).toHaveBeenCalledTimes(1);
  });

  it("shares one reader for the same template across multiple subscribers", async () => {
    const eventsA: string[] = [];
    const eventsB: string[] = [];

    const unsubA = await subscribeToSharedEditLockEvents("form-3", (e) => eventsA.push(e.type));
    const unsubB = await subscribeToSharedEditLockEvents("form-3", (e) => eventsB.push(e.type));

    // Both subscribers share one connection for the same template.
    expect(mockReaderConnections).toHaveLength(1);

    await requestEditLockTakeoverSave("form-3");

    await vi.waitFor(() => {
      expect(eventsA).toEqual(["takeover-requested"]);
      expect(eventsB).toEqual(["takeover-requested"]);
    });

    // Removing one subscriber should not stop the reader.
    await unsubA();
    expect(mockReaderConnections[0].disconnect).not.toHaveBeenCalled();

    // Removing the last subscriber should stop the reader.
    await unsubB();
    expect(mockReaderConnections[0].disconnect).toHaveBeenCalledTimes(1);
  });

  it("routes published events to subscribers on the matching template", async () => {
    const events: string[] = [];

    const unsubscribe = await subscribeToSharedEditLockEvents("form-4", (event) => {
      events.push(event.type);
    });

    await publishEditLockPublishedEvent("form-4");

    await vi.waitFor(() => {
      expect(events).toEqual(["published"]);
    });

    await unsubscribe();
    expect(mockReaderConnections[0].disconnect).toHaveBeenCalledTimes(1);
  });
});
