import { logMessage } from "@lib/logger";

export const dynamic = "force-dynamic";

export async function GET(_request: Request) {
  logMessage.info("SSE base route called without formId");
  return new Response(
    JSON.stringify({ error: "Missing formId. Use /api/sse/{formId}?closingDate=..." }),
    {
      status: 400,
      headers: { "Content-Type": "application/json" },
    }
  );
}
