import { logMessage } from "@lib/logger";
import { NextRequest } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const GET = async (req: NextRequest, props: { params: Promise<Record<string, string>> }) => {
  const params = await props.params;
  try {
    const formId = params?.formId || params?.formID || undefined;
    const url = new URL(req.url);
    const closingDateParam = url.searchParams.get("closingDate") || undefined;

    // Create a new ReadableStream that emits SSE messages
    let pingTimer: number | undefined;
    let closingTimer: number | undefined;
    const stream = new ReadableStream({
      start(controller) {
        // encoder helper
        const encoder = new TextEncoder();

        let closed = false;
        const closeStream = () => {
          if (closed) return;
          closed = true;
          try {
            if (pingTimer) {
              clearInterval(pingTimer);
              pingTimer = undefined;
            }
            if (closingTimer) {
              clearTimeout(closingTimer);
              closingTimer = undefined;
            }
            controller.close();
          } catch (e) {
            // ignore
          }
        };

        const send = (event: string, data: string) => {
          if (closed) return;
          try {
            controller.enqueue(encoder.encode(`event: ${event}\ndata: ${data}\n\n`));
          } catch (err) {
            logMessage.error(`Failed to enqueue SSE message: ${String(err)}`);
            closeStream();
          }
        };

        // Send initial event (JSON-encoded)
        send("init", JSON.stringify({ type: "init", payload: "Connected" }));

        // Keep-alive ping every 15s (prevents some proxies from closing the connection)
        const pingInterval = 15_000;
        pingTimer = setInterval(() => {
          if (closed) return;
          try {
            controller.enqueue(encoder.encode(`: ping\n\n`));
          } catch (err) {
            logMessage.error(`Ping enqueue failed: ${String(err)}`);
            closeStream();
          }
        }, pingInterval) as unknown as number;

        // If a closingDate is provided, schedule a check to emit `closed` when it passes
        if (closingDateParam) {
          const closeTs = Date.parse(closingDateParam);
          if (!Number.isNaN(closeTs)) {
            const now = Date.now();
            if (now >= closeTs) {
              // Already closed — send closed event immediately
              send(
                "closed",
                JSON.stringify({
                  type: "closed",
                  formId,
                  closedAt: new Date(closeTs).toISOString(),
                })
              );
              closeStream();
            } else {
              // Schedule a timer to send closed event when the date passes
              const msUntilClose = closeTs - now;
              closingTimer = setTimeout(() => {
                send(
                  "closed",
                  JSON.stringify({
                    type: "closed",
                    formId,
                    closedAt: new Date(closeTs).toISOString(),
                  })
                );
                closeStream();
              }, msUntilClose) as unknown as number;
            }
          } else {
            logMessage.info(`Invalid closingDate param: ${closingDateParam}`);
          }
        } else {
          // No closingDate provided — send a welcome message shortly after connect.
          closingTimer = setTimeout(() => {
            send(
              "message",
              JSON.stringify({ type: "message", payload: "Hello from SSE endpoint" })
            );
          }, 500) as unknown as number;
        }
      },
      cancel(reason) {
        if (pingTimer) {
          clearInterval(pingTimer);
          pingTimer = undefined;
        }
        if (closingTimer) {
          clearTimeout(closingTimer);
          closingTimer = undefined;
        }
        logMessage.info(`SSE stream canceled: ${String(reason)}`);
      },
    });

    return new Response(stream, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache, no-transform",
        "Content-Type": "text/event-stream; charset=utf-8",
      },
      status: 200,
    });
  } catch (error) {
    logMessage.error(`Server error: ${error instanceof Error ? error.message : String(error)}`);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
};
