import { NextResponse } from "next/server";
import { middleware, sessionExists } from "@lib/middleware";
import { MiddlewareProps, WithRequired } from "@lib/types";
import { authorization } from "@lib/privileges";
import { EditLockEvent, getRecentEditLockEventActor } from "@lib/editLocks";
import { getEditLockDebugSnapshot, subscribeToAdminEditLockDebugEvents } from "@lib/editLockDebug";

export const dynamic = "force-dynamic";

type EditLockDebugEventPayload = {
  type: EditLockEvent["type"];
  occurredAt: string;
  actor?: EditLockEvent["actor"];
  snapshot: Awaited<ReturnType<typeof getEditLockDebugSnapshot>>;
};

export const GET = middleware([sessionExists()], async (_req, props) => {
  const { session } = props as WithRequired<MiddlewareProps, "session">;
  const params = props.params instanceof Promise ? await props.params : props.params;
  const formID = params?.formID;

  if (!formID || typeof formID !== "string") {
    return NextResponse.json({ error: "Invalid or missing formID" }, { status: 400 });
  }

  const hasAdminAccess = await authorization.hasAdministrationPrivileges().catch(() => null);
  if (!hasAdminAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      let unsubscribe: (() => void | Promise<void>) | null = null;

      const sendEvent = (eventName: string, payload: unknown) => {
        if (closed) {
          return;
        }

        controller.enqueue(
          encoder.encode(`event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`)
        );
      };

      const sendSnapshot = async () => {
        const snapshot = await getEditLockDebugSnapshot(formID, session.user.id);
        sendEvent("snapshot", snapshot);
      };

      const sendDebugEvent = async (event: EditLockEvent) => {
        const actor = event.actor ?? (await getRecentEditLockEventActor(formID, event.type));
        const payload: EditLockDebugEventPayload = {
          type: event.type,
          occurredAt: new Date().toISOString(),
          actor,
          snapshot: await getEditLockDebugSnapshot(formID, session.user.id),
        };

        sendEvent("edit-lock-event", payload);
      };

      const keepAlive = setInterval(() => {
        if (!closed) {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        }
      }, 25000);

      const close = async () => {
        if (closed) {
          return;
        }

        closed = true;
        clearInterval(keepAlive);

        if (unsubscribe) {
          await unsubscribe();
        }

        try {
          controller.close();
        } catch {
          // no-op: controller may already be closed
        }
      };

      void sendSnapshot().catch(() => {
        void close();
      });

      void (async () => {
        try {
          unsubscribe = await subscribeToAdminEditLockDebugEvents(formID, (event) => {
            void sendDebugEvent(event).catch(() => {
              void close();
            });
          });
        } catch {
          void close();
        }
      })();

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
