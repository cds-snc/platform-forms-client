import { createRedisSubscriber } from "@lib/integration/redisConnector";
import { EditLockEvent } from "./editLocks";
import type Redis from "ioredis";

const EDIT_LOCK_CHANNEL = "edit-lock-events";

type EditLockRouteSubscriber = (event: EditLockEvent) => void;
type EditLockStreamCloser = () => void | Promise<void>;

type EditLockRedisEventMessage = {
  templateId: string;
  event: EditLockEvent;
};

type ParsedEditLockRedisEventMessage = Partial<
  EditLockRedisEventMessage & {
    type?: EditLockEvent["type"];
  }
>;

const getParsedEventType = (
  parsed: ParsedEditLockRedisEventMessage
): EditLockEvent["type"] | null => {
  if (parsed.event?.type === "takeover-requested" || parsed.event?.type === "updated") {
    return parsed.event.type;
  }

  if (parsed.type === "takeover-requested" || parsed.type === "updated") {
    return parsed.type;
  }

  return null;
};

type EditLockEventStreamsGlobal = typeof globalThis & {
  __editLockEventStreamsState?: {
    redisSubscriber?: Redis;
    redisSubscriberPromise?: Promise<Redis>;
    channelSubscribers: Map<string, Set<EditLockRouteSubscriber>>;
    activeStreams: Map<string, EditLockStreamCloser>;
  };
};

const parseEventMessage = (raw: string): EditLockRedisEventMessage | null => {
  try {
    const parsed = JSON.parse(raw) as ParsedEditLockRedisEventMessage;

    const templateId = typeof parsed.templateId === "string" ? parsed.templateId : null;
    const eventType = getParsedEventType(parsed);

    if (templateId && eventType) {
      return {
        templateId,
        event: { type: eventType },
      };
    }
  } catch {
    // no-op
  }

  return null;
};

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
          if (messageChannel !== EDIT_LOCK_CHANNEL) {
            return;
          }

          const parsedMessage = parseEventMessage(message);
          if (!parsedMessage) {
            return;
          }

          const subscribers = getState().channelSubscribers.get(parsedMessage.templateId);
          if (!subscribers) {
            return;
          }

          subscribers.forEach((channelSubscriber) => channelSubscriber(parsedMessage.event));
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
  const { channelSubscribers } = getState();
  const subscribers = channelSubscribers.get(templateId) ?? new Set<EditLockRouteSubscriber>();
  const shouldSubscribeToChannel = channelSubscribers.size === 0;

  subscribers.add(subscriber);
  channelSubscribers.set(templateId, subscribers);

  const redisSubscriber = await getSharedRedisSubscriber();

  if (shouldSubscribeToChannel) {
    await redisSubscriber.subscribe(EDIT_LOCK_CHANNEL);
  }

  return async () => {
    const currentSubscribers = channelSubscribers.get(templateId);
    if (!currentSubscribers) {
      return;
    }

    currentSubscribers.delete(subscriber);

    if (currentSubscribers.size > 0) {
      return;
    }

    channelSubscribers.delete(templateId);

    if (channelSubscribers.size > 0) {
      return;
    }

    await redisSubscriber.unsubscribe(EDIT_LOCK_CHANNEL);
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
