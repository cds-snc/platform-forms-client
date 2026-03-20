import { prisma } from "@lib/integration/prismaConnector";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const encoder = new TextEncoder();
const POLL_INTERVAL_MS = 2000;

const formatEvent = (
  event: string,
  data: Record<string, boolean | number | "availability" | "content">
) => {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
};

const getAvailabilitySnapshot = async (form: string) => {
  const template = await prisma.template.findUnique({
    where: {
      id: form,
    },
    select: {
      isPublished: true,
      updated_at: true,
    },
  });

  return {
    available: Boolean(template?.isPublished),
    updatedAt: template?.updated_at?.getTime() ?? null,
  };
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
      let previousUpdatedAt: number | null = null;

      const close = () => {
        if (closed) {
          return;
        }
        closed = true;
        clearInterval(interval);
        controller.close();
      };

      const checkAvailability = async () => {
        const { available: isPublished, updatedAt } = await getAvailabilitySnapshot(form);

        if (previousPublishedState === null) {
          previousPublishedState = isPublished;
          previousUpdatedAt = updatedAt;
          controller.enqueue(
            formatEvent("status", { available: isPublished, timestamp: Date.now() })
          );
          return;
        }

        if (previousPublishedState !== isPublished) {
          previousPublishedState = isPublished;
          previousUpdatedAt = updatedAt;
          controller.enqueue(
            formatEvent("changed", {
              available: isPublished,
              timestamp: Date.now(),
              reason: "availability",
            })
          );
          close();
          return;
        }

        if (isPublished && previousUpdatedAt !== null && updatedAt !== previousUpdatedAt) {
          previousUpdatedAt = updatedAt;
          controller.enqueue(
            formatEvent("changed", {
              available: true,
              timestamp: Date.now(),
              reason: "content",
            })
          );
          close();
          return;
        }

        previousUpdatedAt = updatedAt;

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
