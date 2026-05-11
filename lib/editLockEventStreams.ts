import Redis from "ioredis";

import { getRedisInstance } from "@lib/integration/redisConnector";
import { EditLockEvent } from "./editLocks";

// Each template gets its own stream key so events are naturally partitioned and
// ordered without a shared channel.
const EDIT_LOCK_STREAM_PREFIX = "edit-lock-stream";

// Wake up every 5 seconds even if no messages arrive so we can notice if the
// stopped flag was set while we were blocked.
const XREAD_BLOCK_MS = 5_000;

type EditLockRouteSubscriber = (event: EditLockEvent) => void;
type EditLockStreamCloser = () => void | Promise<void>;

// Per-template reader state.  Each watched template gets one dedicated Redis
// connection so XREAD BLOCK does not hold up the shared command connection.
type TemplateReaderState = {
  subscribers: Set<EditLockRouteSubscriber>;
  // Last-consumed stream entry ID.  '$' on startup means "only new entries".
  lastId: string;
  stopped: boolean;
  redis: Redis;
};

type EditLockEventStreamsGlobal = typeof globalThis & {
  __editLockEventStreamsState?: {
    templateReaders: Map<string, TemplateReaderState>;
    activeStreams: Map<string, EditLockStreamCloser>;
  };
};

const getEditLockStreamKey = (templateId: string) => `${EDIT_LOCK_STREAM_PREFIX}:${templateId}`;

const getState = () => {
  const globalWithState = globalThis as EditLockEventStreamsGlobal;
  if (!globalWithState.__editLockEventStreamsState) {
    globalWithState.__editLockEventStreamsState = {
      templateReaders: new Map(),
      activeStreams: new Map(),
    };
  }

  return globalWithState.__editLockEventStreamsState;
};

// Runs in the background for the lifetime of a template's subscriptions.
// Uses XREAD BLOCK so new messages are delivered with minimal latency while
// the blocking timeout lets us check "state.stopped" periodically.
const runReaderLoop = async (templateId: string, state: TemplateReaderState): Promise<void> => {
  const streamKey = getEditLockStreamKey(templateId);

  while (!state.stopped) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const results = await state.redis.xread(
        "COUNT",
        100,
        "BLOCK",
        XREAD_BLOCK_MS,
        "STREAMS",
        streamKey,
        state.lastId
      );

      if (state.stopped) {
        break;
      }

      if (!results) {
        // Timeout with no new messages — loop and block again.
        continue;
      }

      for (const [, entries] of results) {
        for (const [id, fields] of entries) {
          // Always advance the cursor even if the event type is unknown so we
          // never re-process the same entry after a reconnect.
          state.lastId = id;

          // Fields arrive as alternating [name, value, name, value, …] pairs.
          const fieldMap: Record<string, string> = {};
          for (let i = 0; i + 1 < fields.length; i += 2) {
            fieldMap[String(fields[i])] = String(fields[i + 1]);
          }

          const eventType = fieldMap["type"];
          if (
            eventType === "updated" ||
            eventType === "takeover-requested" ||
            eventType === "published"
          ) {
            const event: EditLockEvent = { type: eventType };
            state.subscribers.forEach((subscriber) => subscriber(event));
          }
        }
      }
    } catch {
      if (state.stopped) {
        break;
      }
      // Brief back-off before retrying on transient errors.
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
};

const startTemplateReader = async (templateId: string): Promise<TemplateReaderState> => {
  const mainRedis = await getRedisInstance();
  // Duplicate the connection so the blocking XREAD does not block the shared
  // connection used for all other Redis commands.
  const readerRedis = mainRedis.duplicate();

  const state: TemplateReaderState = {
    subscribers: new Set(),
    // Note: "$" = only deliver entries added after this reader starts
    lastId: "$",
    stopped: false,
    redis: readerRedis,
  };

  // Fire-and-forget: the loop runs for the lifetime of this reader.
  // It runs synchronously up to the first `await state.redis.xread(...)` call
  // before startTemplateReader returns, so the reader is already listening by
  // the time the first subscriber is added.
  void runReaderLoop(templateId, state);

  return state;
};

const stopTemplateReader = (state: TemplateReaderState): void => {
  state.stopped = true;
  // Disconnect the dedicated connection to unblock any in-progress XREAD
  // immediately rather than waiting for the BLOCK timeout to expire.
  state.redis.disconnect();
};

const subscribeToRedisEditLockEvents = async (
  templateId: string,
  subscriber: EditLockRouteSubscriber
) => {
  const { templateReaders } = getState();
  let readerState = templateReaders.get(templateId);

  if (!readerState) {
    readerState = await startTemplateReader(templateId);
    templateReaders.set(templateId, readerState);
  }

  readerState.subscribers.add(subscriber);

  return async () => {
    const current = templateReaders.get(templateId);
    if (!current) {
      return;
    }

    current.subscribers.delete(subscriber);

    if (current.subscribers.size > 0) {
      // Other listeners are still active — keep the reader running.
      return;
    }

    // Last subscriber for this template: stop the reader and clean up.
    templateReaders.delete(templateId);
    stopTemplateReader(current);
  };
};

export const subscribeToSharedEditLockEvents = async (
  templateId: string,
  subscriber: EditLockRouteSubscriber
) => {
  if (!process.env.REDIS_URL) {
    throw new Error("Redis is required for edit lock event streams");
  }

  return subscribeToRedisEditLockEvents(templateId, subscriber);
};

export const registerActiveEditLockStream = (
  userId: string,
  templateId: string,
  close: EditLockStreamCloser
) => {
  const streamKey = `${userId}:${templateId}`;
  const { activeStreams } = getState();
  const previousClose = activeStreams.get(streamKey);

  activeStreams.set(streamKey, close);

  if (previousClose && previousClose !== close) {
    // Replace any older stream for the same user/form so one user cannot keep many open.
    void previousClose();
  }

  return () => {
    if (activeStreams.get(streamKey) === close) {
      activeStreams.delete(streamKey);
    }
  };
};
