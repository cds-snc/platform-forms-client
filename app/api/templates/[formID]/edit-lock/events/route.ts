import { NextResponse } from "next/server";
import { middleware, sessionExists } from "@lib/middleware";
import { MiddlewareProps, WithRequired } from "@lib/types";
import { authorization } from "@lib/privileges";
import {
  EditLockEvent,
  getEditLockStatus,
  shouldEnforceTemplateEditLockWithVerifiedUserCount,
} from "@lib/editLocks";
import {
  registerActiveEditLockStream,
  subscribeToSharedEditLockEvents,
} from "@lib/editLockEventStreams";
import { logMessage } from "@lib/logger";

export const dynamic = "force-dynamic";

import { SHOULD_DEBUG_EDIT_LOCK_SSE } from "@root/constants";

const debugEditLockSse = (message: string, metadata: Record<string, unknown>) => {
  if (!SHOULD_DEBUG_EDIT_LOCK_SSE) {
    return;
  }
  logMessage.debug({ message, ...metadata });
};

export const GET = middleware([sessionExists()], async (_req, props) => {
  const { session } = props as WithRequired<MiddlewareProps, "session">;
  const params = props.params instanceof Promise ? await props.params : props.params;
  const formID = params?.formID;

  if (!formID || typeof formID !== "string") {
    return NextResponse.json({ error: "Invalid or missing formID" }, { status: 400 });
  }

  if (!(await shouldEnforceTemplateEditLockWithVerifiedUserCount(formID, session.user.id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const canEditForm = await authorization.canEditForm(formID).catch(() => null);
  if (!canEditForm) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const encoder = new TextEncoder();
  const streamDebugContext = {
    formID,
    userId: session.user.id,
  };
  let closeStream: ((reason: string) => Promise<void>) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      let unsubscribe: (() => void | Promise<void>) | null = null;
      let unregisterStream: (() => void) | null = null;

      debugEditLockSse("edit-lock-sse-open", streamDebugContext);

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

      const sendPublished = () => {
        if (closed) {
          return;
        }

        controller.enqueue(encoder.encode("event: form-published\ndata: {}\n\n"));
      };

      const handleEvent = (event: EditLockEvent) => {
        if (event.type === "takeover-requested") {
          sendTakeoverRequested();
          return;
        }

        if (event.type === "published") {
          sendPublished();
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

      const close = async (reason: string) => {
        if (closed) {
          return;
        }

        closed = true;
        debugEditLockSse("edit-lock-sse-close", {
          ...streamDebugContext,
          reason,
        });
        clearInterval(keepAlive);
        unregisterStream?.();

        if (unsubscribe) {
          await unsubscribe();
        }

        try {
          controller.close();
        } catch {
          // no-op: controller may already be closed
        }
      };

      closeStream = close;

      unregisterStream = registerActiveEditLockStream(session.user.id, formID, () =>
        close("replaced-by-newer-stream")
      );

      void (async () => {
        try {
          const unsubscribeEvents = await subscribeToSharedEditLockEvents(formID, handleEvent);

          if (closed) {
            await unsubscribeEvents();
            return;
          }

          unsubscribe = unsubscribeEvents;
        } catch {
          void close("subscribe-failed");
        }
      })();

      void sendStatus().catch(() => {
        // no-op: connection will close naturally if the first send fails
      });

      _req.signal.addEventListener("abort", () => {
        void close("request-aborted");
      });
    },
    cancel() {
      return closeStream?.("stream-cancelled");
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
