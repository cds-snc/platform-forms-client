import { sanitizePii } from "@cdssnc/sanitize-pii";
import { logMessage } from "@lib/logger";

const MAX_BODY_BYTES = 2048;
const MAX_MESSAGE_LENGTH = 1000;
const MAX_TRACKED_CLIENTS = 2000;
const MAX_REPORTS_PER_WINDOW = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;
const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

type ClientErrorBoundary = "route" | "global";

type ClientErrorReport = {
  boundary: ClientErrorBoundary;
  name: string;
  message: string;
  digest?: string;
  locale?: "en" | "fr";
  formId?: string;
  step?: string;
};

type RateLimitEntry = { count: number; expiresAt: number };

const rateLimitByClient = new Map<string, RateLimitEntry>();
const safePathSegment = /^[A-Za-z0-9_-]{1,64}$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isBoundedString = (value: unknown, maxLength: number): value is string =>
  typeof value === "string" && value.length > 0 && value.length <= maxLength;

const parseReport = (value: unknown): ClientErrorReport | null => {
  if (!isRecord(value)) return null;
  if (value.boundary !== "route" && value.boundary !== "global") return null;
  if (!isBoundedString(value.name, 100)) return null;
  if (!isBoundedString(value.message, MAX_MESSAGE_LENGTH)) return null;

  if (value.digest !== undefined && !isBoundedString(value.digest, 128)) return null;
  if (value.locale !== undefined && value.locale !== "en" && value.locale !== "fr") return null;
  if (
    value.formId !== undefined &&
    (!isBoundedString(value.formId, 64) || !safePathSegment.test(value.formId))
  ) {
    return null;
  }
  if (
    value.step !== undefined &&
    (!isBoundedString(value.step, 64) || !safePathSegment.test(value.step))
  ) {
    return null;
  }

  return {
    boundary: value.boundary,
    name: value.name,
    message: value.message,
    ...(typeof value.digest === "string" && { digest: value.digest }),
    ...(value.locale && { locale: value.locale }),
    ...(value.formId && { formId: value.formId }),
    ...(value.step && { step: value.step }),
  } as ClientErrorReport;
};

const isRateLimited = (clientKey: string, now = Date.now()) => {
  const current = rateLimitByClient.get(clientKey);
  if (current && current.expiresAt > now) {
    if (current.count >= MAX_REPORTS_PER_WINDOW) return true;
    current.count += 1;
    return false;
  }

  rateLimitByClient.delete(clientKey);

  if (rateLimitByClient.size >= MAX_TRACKED_CLIENTS) {
    for (const [key, entry] of rateLimitByClient) {
      if (entry.expiresAt <= now) rateLimitByClient.delete(key);
    }
    if (rateLimitByClient.size >= MAX_TRACKED_CLIENTS) return true;
  }

  rateLimitByClient.set(clientKey, {
    count: 1,
    expiresAt: now + RATE_LIMIT_WINDOW_MS,
  });
  return false;
};

const getClientKey = (request: Request) => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",").at(-1)?.trim() || "unknown";
};

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return Response.json({ error: "Unsupported media type" }, { status: 415 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return Response.json({ error: "Payload too large" }, { status: 413 });
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return Response.json({ error: "Payload too large" }, { status: 413 });
  }

  let report: ClientErrorReport | null;
  try {
    report = parseReport(JSON.parse(rawBody));
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!report) {
    return Response.json({ error: "Invalid error report" }, { status: 400 });
  }

  if (isRateLimited(getClientKey(request))) {
    return Response.json({ error: "Too many reports" }, { status: 429 });
  }

  const message = sanitizePii(report.message)
    .replace(EMAIL_PATTERN, "[Redacted: email]")
    .replace(/[\r\n\t]+/g, " ")
    .slice(0, 1000);
  const userAgent = request.headers.get("user-agent")?.slice(0, 256);

  logMessage.error(
    JSON.stringify({
      event: "client_error_boundary",
      boundary: report.boundary,
      name: report.name,
      message,
      digest: report.digest,
      locale: report.locale,
      formId: report.formId,
      step: report.step,
      userAgent,
    })
  );

  return new Response(null, { status: 204 });
}
