import { NextResponse } from "next/server";
import { middleware, sessionExists } from "@lib/middleware";
import { MiddlewareProps, WithRequired } from "@lib/types";
import { authorization } from "@lib/privileges";
import { EditLockEvent, getEditLockStatus, subscribeToEditLockEvents } from "@lib/editLocks";
import { createRedisSubscriber } from "@lib/integration/redisConnector";
import { allowLockedEditing } from "@lib/utils/form-builder/allowLockedEditing";
import type Redis from "ioredis";

export const dynamic = "force-dynamic";

export const GET = middleware([sessionExists()], async (_req, props) => {
  const { session } = props as WithRequired<MiddlewareProps, "session">;
  const params = props.params instanceof Promise ? await props.params : props.params;
  const formID = params?.formID;

  if (!formID || typeof formID !== "string") {
    return NextResponse.json({ error: "Invalid or missing formID" }, { status: 400 });
  }

  if (!(await allowLockedEditing())) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const canEditForm = await authorization.canEditForm(formID).catch(() => null);
  if (!canEditForm) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const encoder = new TextEncoder();
  const channel = `edit-lock-events:${formID}`;

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      let unsubscribe: (() => void) | null = null;
      let subscriber: Redis | null = null;

      const parseEvent = (raw: string): EditLockEvent => {
        try {
          const parsed = JSON.parse(raw) as Partial<EditLockEvent>;
          if (parsed.type === "takeover-requested") {
            return { type: "takeover-requested" };
          }
        } catch {
          // no-op
        }

        return { type: "updated" };
      };

      const sendStatus = async () => {
        if (closed) {
          return;
        }

        const status = await getEditLockStatus(formID, session.user.id);
        controller.enqueue(
          encoder.encode(`event: lock-status\ndata: ${JSON.stringify(status)}\n\n`)
        );
      };

      const sendTakeoverRequested = () => {
        if (closed) {
          return;
        }

        controller.enqueue(encoder.encode("event: takeover-requested\ndata: {}\n\n"));
      };

      const handleEvent = (event: EditLockEvent) => {
        if (event.type === "takeover-requested") {
          sendTakeoverRequested();
          return;
        }

        void sendStatus().catch(() => {
          // no-op: the stream may already be closed
        });
      };

      const keepAlive = setInterval(() => {
        if (!closed) {
          controller.enqueue(encoder.encode(`: keepalive\n\n`));
        }
      }, 25000);

      const close = async () => {
        if (closed) {
          return;
        }

        closed = true;
        clearInterval(keepAlive);
        unsubscribe?.();

        if (subscriber) {
          try {
            await subscriber.unsubscribe(channel);
          } catch {
            // no-op
          }
          try {
            await subscriber.quit();
          } catch {
            // no-op
          }
          subscriber = null;
        }

        try {
          controller.close();
        } catch {
          // no-op: controller may already be closed
        }
      };

      if (process.env.REDIS_URL) {
        void createRedisSubscriber()
          .then((redisSubscriber) => {
            subscriber = redisSubscriber;

            return subscriber.subscribe(channel);
          })
          .then(() => {
            subscriber?.on("message", (_messageChannel, message) => {
              handleEvent(parseEvent(message));
            });
          });
      } else {
        unsubscribe = subscribeToEditLockEvents(formID, handleEvent);
      }

      void sendStatus().catch(() => {
        // no-op: connection will close naturally if the first send fails
      });

      _req.signal.addEventListener("abort", () => {
        void close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
});
