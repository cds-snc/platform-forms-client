import { createRedisSubscriber } from "@lib/integration/redisConnector";
import { EditLockEvent, EditLockEventActor } from "./editLocks";
import type Redis from "ioredis";

const EDIT_LOCK_CHANNEL_PREFIX = "edit-lock-events";

type EditLockRouteSubscriber = (event: EditLockEvent) => void;
type EditLockStreamCloser = () => void | Promise<void>;

export type EditLockEventStreamDebugSnapshot = {
  channel: string;
  sharedChannelSubscriberCount: number;
  activeStreamCount: number;
  activeStreamKeys: string[];
};

type EditLockEventStreamsGlobal = typeof globalThis & {
  __editLockEventStreamsState?: {
    redisSubscriber?: Redis;
    redisSubscriberPromise?: Promise<Redis>;
    channelSubscribers: Map<string, Set<EditLockRouteSubscriber>>;
    activeStreams: Map<string, EditLockStreamCloser>;
  };
};

const parseEvent = (raw: string): EditLockEvent => {
  try {
    const parsed = JSON.parse(raw) as Partial<EditLockEvent>;
    const actor =
      parsed.actor && typeof parsed.actor === "object"
        ? ({
            userId: typeof parsed.actor.userId === "string" ? parsed.actor.userId : "unknown-user",
            userName:
              typeof parsed.actor.userName === "string" || parsed.actor.userName === null
                ? parsed.actor.userName
                : null,
            userEmail:
              typeof parsed.actor.userEmail === "string" || parsed.actor.userEmail === null
                ? parsed.actor.userEmail
                : null,
            sessionId:
              typeof parsed.actor.sessionId === "string" || parsed.actor.sessionId === null
                ? parsed.actor.sessionId
                : null,
          } satisfies EditLockEventActor)
        : null;

    if (parsed.type === "takeover-requested") {
      return { type: "takeover-requested", actor };
    }

    if (parsed.type === "updated") {
      return { type: "updated", actor };
    }
  } catch {
    // no-op
  }

  return { type: "updated" };
};

const getChannel = (templateId: string) => `${EDIT_LOCK_CHANNEL_PREFIX}:${templateId}`;

const getState = () => {
  const globalWithState = globalThis as EditLockEventStreamsGlobal;
  if (!globalWithState.__editLockEventStreamsState) {
    globalWithState.__editLockEventStreamsState = {
      channelSubscribers: new Map(),
      activeStreams: new Map(),
    };
  }

  return globalWithState.__editLockEventStreamsState;
};

const getSharedRedisSubscriber = async () => {
  const state = getState();

  if (state.redisSubscriber) {
    return state.redisSubscriber;
  }

  if (!state.redisSubscriberPromise) {
    state.redisSubscriberPromise = (async () => {
      try {
        const subscriber = await createRedisSubscriber();

        // Broadcast Redis events to local listeners, for example: { type: "updated" }.
        subscriber.on("message", (messageChannel, message) => {
          const subscribers = getState().channelSubscribers.get(messageChannel);
          if (!subscribers) {
            return;
          }

          const event = parseEvent(message);
          subscribers.forEach((channelSubscriber) => channelSubscriber(event));
        });

        state.redisSubscriber = subscriber;
        return subscriber;
      } catch (error) {
        state.redisSubscriberPromise = undefined;
        throw error;
      }
    })();
  }

  return state.redisSubscriberPromise;
};

const subscribeToRedisEditLockEvents = async (
  templateId: string,
  subscriber: EditLockRouteSubscriber
) => {
  const channel = getChannel(templateId);
  const { channelSubscribers } = getState();
  const subscribers = channelSubscribers.get(channel) ?? new Set<EditLockRouteSubscriber>();
  const shouldSubscribeToChannel = subscribers.size === 0;

  subscribers.add(subscriber);
  channelSubscribers.set(channel, subscribers);

  const redisSubscriber = await getSharedRedisSubscriber();

  if (shouldSubscribeToChannel) {
    await redisSubscriber.subscribe(channel);
  }

  return async () => {
    const currentSubscribers = channelSubscribers.get(channel);
    if (!currentSubscribers) {
      return;
    }

    currentSubscribers.delete(subscriber);

    if (currentSubscribers.size > 0) {
      return;
    }

    channelSubscribers.delete(channel);
    await redisSubscriber.unsubscribe(channel);
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

export const getEditLockEventStreamDebugSnapshot = (
  templateId: string
): EditLockEventStreamDebugSnapshot => {
  const channel = getChannel(templateId);
  const { channelSubscribers, activeStreams } = getState();
  const activeStreamKeys = Array.from(activeStreams.keys()).filter((streamKey) =>
    streamKey.endsWith(`:${templateId}`)
  );

  return {
    channel,
    sharedChannelSubscriberCount: channelSubscribers.get(channel)?.size ?? 0,
    activeStreamCount: activeStreamKeys.length,
    activeStreamKeys,
  };
};
