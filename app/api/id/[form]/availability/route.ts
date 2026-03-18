import { getTemplatePublishedStatus } from "@lib/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const encoder = new TextEncoder();
const POLL_INTERVAL_MS = 10000;

const formatEvent = (event: string, data: Record<string, boolean | number>) => {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
};

export async function GET(
  request: Request,
  context: { params: Promise<{ form: string | string[] }> }
) {
  const { form } = await context.params;

  if (Array.isArray(form) || !form) {
    return new Response("Bad request", { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      let previousPublishedState: boolean | null = null;

      const close = () => {
        if (closed) {
          return;
        }
        closed = true;
        clearInterval(interval);
        controller.close();
      };

      const checkAvailability = async () => {
        const isPublished = Boolean(await getTemplatePublishedStatus(form));

        if (previousPublishedState === null) {
          previousPublishedState = isPublished;
          controller.enqueue(
            formatEvent("status", { available: isPublished, timestamp: Date.now() })
          );
          return;
        }

        if (previousPublishedState !== isPublished) {
          previousPublishedState = isPublished;
          controller.enqueue(
            formatEvent("changed", { available: isPublished, timestamp: Date.now() })
          );
          close();
          return;
        }

        controller.enqueue(
          formatEvent("status", { available: isPublished, timestamp: Date.now() })
        );
      };

      const interval = setInterval(() => {
        void checkAvailability().catch(() => {
          close();
        });
      }, POLL_INTERVAL_MS);

      void checkAvailability().catch(() => {
        close();
      });

      request.signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream",
    },
  });
}
