import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { EventEmitter } from "events";

class MockRedisSubscriber extends EventEmitter {
  subscribedChannels = new Set<string>();
  subscribe = vi.fn(async (channel: string) => {
    this.subscribedChannels.add(channel);
    return 1;
  });
  unsubscribe = vi.fn(async (channel: string) => {
    this.subscribedChannels.delete(channel);
    return 0;
  });
}

let mockRedisSubscriber: MockRedisSubscriber | null = null;
const publish = vi.fn(async (channel: string, message: string) => {
  if (mockRedisSubscriber?.subscribedChannels.has(channel)) {
    mockRedisSubscriber.emit("message", channel, message);
  }

  return 1;
});

vi.mock("@lib/integration/redisConnector", () => ({
  getRedisInstance: vi.fn(async () => ({
    publish,
  })),
  createRedisSubscriber: vi.fn(async () => {
    mockRedisSubscriber = new MockRedisSubscriber();
    return mockRedisSubscriber;
  }),
}));

import { requestEditLockTakeoverSave } from "@lib/editLocks";
import { subscribeToSharedEditLockEvents } from "@lib/editLockEventStreams";

describe("editLockEventStreams", () => {
  const originalRedisUrl = process.env.REDIS_URL;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.REDIS_URL = "redis://test";
    mockRedisSubscriber = null;
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

  it("uses one shared Redis channel and fans out events by template id", async () => {
    const formOneEvents: string[] = [];
    const formTwoEvents: string[] = [];

    const unsubscribeFormOne = await subscribeToSharedEditLockEvents("form-1", (event) => {
      formOneEvents.push(event.type);
    });
    const unsubscribeFormTwo = await subscribeToSharedEditLockEvents("form-2", (event) => {
      formTwoEvents.push(event.type);
    });

    expect(mockRedisSubscriber?.subscribe).toHaveBeenCalledTimes(1);
    expect(mockRedisSubscriber?.subscribe).toHaveBeenCalledWith("edit-lock-events");

    await requestEditLockTakeoverSave("form-1");

    expect(formOneEvents).toEqual(["takeover-requested"]);
    expect(formTwoEvents).toEqual([]);

    await unsubscribeFormOne();
    expect(mockRedisSubscriber?.unsubscribe).not.toHaveBeenCalled();

    await unsubscribeFormTwo();
    expect(mockRedisSubscriber?.unsubscribe).toHaveBeenCalledTimes(1);
    expect(mockRedisSubscriber?.unsubscribe).toHaveBeenCalledWith("edit-lock-events");
  });
});