import { NextResponse } from "next/server";
import { middleware, sessionExists } from "@lib/middleware";
import { MiddlewareProps, WithRequired } from "@lib/types";
import { authorization } from "@lib/privileges";
import { getEditLockStatus, subscribeToEditLockEvents } from "@lib/editLocks";
import { createRedisSubscriber } from "@lib/integration/redisConnector";
import type Redis from "ioredis";

export const dynamic = "force-dynamic";

export const GET = middleware([sessionExists()], async (_req, props) => {
  const { session } = props as WithRequired<MiddlewareProps, "session">;
  const params = props.params instanceof Promise ? await props.params : props.params;
  const formID = params?.formID;

  if (!formID || typeof formID !== "string") {
    return NextResponse.json({ error: "Invalid or missing formID" }, { status: 400 });
  }

  const canViewForm = await authorization.canViewForm(formID).catch(() => null);
  if (!canViewForm) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const encoder = new TextEncoder();
  const channel = `edit-lock-events:${formID}`;

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      let unsubscribe: (() => void) | null = null;
      let subscriber: Redis | null = null;

      const sendStatus = async () => {
        if (closed) {
          return;
        }

        const status = await getEditLockStatus(formID, session.user.id);
        controller.enqueue(
          encoder.encode(`event: lock-status\ndata: ${JSON.stringify(status)}\n\n`)
        );
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
        subscriber = createRedisSubscriber();
        void subscriber.subscribe(channel).then(() => {
          subscriber?.on("message", () => {
            void sendStatus().catch(() => {
              // no-op: the stream may already be closed
            });
          });
        });
      } else {
        unsubscribe = subscribeToEditLockEvents(formID, () => {
          void sendStatus().catch(() => {
            // no-op: the stream may already be closed
          });
        });
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
