import { logMessage } from "@lib/logger";
import { NextRequest } from "next/server";
import Redis from "ioredis";
import { createRedisSubscriber } from "@lib/integration/redisConnector";

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
    // Redis subscriber instance (created per connection)
    let subscriber: Redis | null = null;

    const stream = new ReadableStream({
      async start(controller) {
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

        // Subscribe to Redis channel for this form to receive cross-instance events
        try {
          subscriber = createRedisSubscriber();
          await subscriber.subscribe(`forms:${formId}`);
          subscriber.on("message", (_channel, message) => {
            try {
              const parsed = JSON.parse(message);
              if (parsed && parsed.type === "closed") {
                send("closed", JSON.stringify(parsed));
                closeStream();
              } else {
                send("message", JSON.stringify(parsed));
              }
            } catch (e) {
              logMessage.error(`Failed to parse Redis message: ${String(e)}`);
            }
          });
        } catch (e) {
          logMessage.error(`Failed to subscribe to Redis channel for form ${formId}: ${String(e)}`);
        }

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
        }
      },
      async cancel(reason) {
        if (pingTimer) {
          clearInterval(pingTimer);
          pingTimer = undefined;
        }
        if (closingTimer) {
          clearTimeout(closingTimer);
          closingTimer = undefined;
        }
        try {
          // Clean up Redis subscriber
          if (subscriber) {
            try {
              await subscriber.unsubscribe();
            } catch (_e) {
              // ignore
            }
            try {
              await subscriber.quit();
            } catch (_e) {
              // ignore
            }
            subscriber = null;
          }
        } catch (e) {
          logMessage.error(`Error cleaning up Redis subscriber: ${String(e)}`);
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
