import { NextRequest, NextResponse } from "next/server";
import { logMessage } from "@lib/logger";
import { getClientIp } from "@lib/ip";
import { checkClientLogRateLimit } from "@lib/clientLogging/rateLimiter";
import { ClientLogBatch, ClientLogEntry, LogLevel } from "@lib/clientLogging/types";

const MAX_ENTRIES_PER_BATCH = 25;
// Theoretical max valid batch is ~175KB; this leaves headroom while rejecting clearly abusive payloads
const MAX_BODY_BYTES = 200_000;
const MAX_MESSAGE_LENGTH = 1000;
// Avoid excessive number of key=value pairs that could slow down JSON.stringify (and increase the payload)
const MAX_CONTEXT_KEYS = 20;
// Block oversized inputs. 100 seems resonable but could also go with 64 (2^6 is used in other similar examples)
const MAX_CONTEXT_KEY_LENGTH = 100;
const MAX_CONTEXT_VALUE_LENGTH = 200;
// Stricly UUID length - always 36 chars
const MAX_SESSION_ID_LENGTH = 36;
// Upper bound on de-duplicated occurrences within one buffer flush window
const MAX_ENTRY_COUNT = 10000;
// Allows UUID format and the Math.random fallback ID used in non-secure (http) contexts
const SESSION_ID_PATTERN = /^[a-zA-Z0-9-]+$/;
// Allows for logs that sat in the buffer a while, and for client clocks that are slightly off
const MAX_TIMESTAMP_SKEW_MS = 10 * 60 * 1000;
// In the future we may want to only alllow warn and error if e.g. debug gets too "noisy"
const VALID_LEVELS = new Set<LogLevel>(["debug", "info", "warn", "error"]);

const isValidContext = (context: unknown): boolean => {
  if (typeof context !== "object" || context === null || Array.isArray(context)) {
    return false;
  }
  const obj = context as Record<string, unknown>;
  const keys = Object.keys(obj);
  return (
    keys.length <= MAX_CONTEXT_KEYS &&
    keys.every((k) => k.length <= MAX_CONTEXT_KEY_LENGTH) &&
    Object.values(obj).every((v) => {
      if (typeof v !== "string" && typeof v !== "number" && typeof v !== "boolean") return false;
      if (typeof v === "string" && v.length > MAX_CONTEXT_VALUE_LENGTH) return false;
      return true;
    })
  );
};

// Ensure the timestamp is accurate within 10 minutes e.g. avoid allowing a user setting a timestamp 2 hours in the future
const isValidTimestamp = (timestamp: number): boolean => {
  const now = Date.now();
  return timestamp > now - MAX_TIMESTAMP_SKEW_MS && timestamp < now + MAX_TIMESTAMP_SKEW_MS;
};

const isValidSessionId = (value: unknown): boolean => {
  return (
    value === undefined ||
    (typeof value === "string" &&
      value.length <= MAX_SESSION_ID_LENGTH &&
      SESSION_ID_PATTERN.test(value))
  );
};

const isValidCount = (value: unknown): boolean => {
  return (
    value === undefined ||
    (Number.isInteger(value) && (value as number) >= 1 && (value as number) <= MAX_ENTRY_COUNT)
  );
};

const isValidEntry = (entry: unknown): entry is ClientLogEntry => {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    return false;
  }

  const e = entry as Record<string, unknown>;

  return (
    VALID_LEVELS.has(e.level as LogLevel) &&
    typeof e.message === "string" &&
    e.message.length > 0 &&
    e.message.length <= MAX_MESSAGE_LENGTH &&
    typeof e.timestamp === "number" &&
    isValidTimestamp(e.timestamp) &&
    isValidSessionId(e.sessionId) &&
    isValidCount(e.count) &&
    (e.context === undefined || isValidContext(e.context))
  );
};

// Removes newlines and control chars to help prevent log injection
const sanitizeMessage = (message: string): string => {
  return message.replace(/[\x00-\x1F\x7F]/g, " ").trim();
};

const formatEntry = (entry: ClientLogEntry): string => {
  const count = entry.count && entry.count > 1 ? `(x${entry.count})` : "";
  const context = entry.context ? JSON.stringify(entry.context) : "";
  const message = sanitizeMessage(entry.message);
  return `[CLIENT] ${entry.sessionId}} ${message} ${count} ${context}`;
};

// Avoids a nested try-catch in the handler; returns null on parse failure
const parseRequestBody = async (req: NextRequest): Promise<unknown> => {
  try {
    return await req.json();
  } catch {
    return null;
  }
};

// Logs out to pino > CloudWatch
const LOG_METHODS: Record<LogLevel, (msg: string) => void> = {
  debug: (msg) => logMessage.debug(msg),
  info: (msg) => logMessage.info(msg),
  warn: (msg) => logMessage.warn(msg),
  error: (msg) => logMessage.error(msg),
};

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  try {
    const ip = await getClientIp();

    const withinLimit = await checkClientLogRateLimit(ip);
    if (!withinLimit) {
      // TODO: are we OK with IPs in the error logs? -- currently done in audit logs but not sure the context of an error log is OK
      logMessage.warn(`Client log rate limit exceeded: ${ip}`);
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const contentLength = Number(req.headers.get("content-length") ?? 0);
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    // Reject non-JSON before attempting to parse
    if (!req.headers.get("content-type")?.includes("application/json")) {
      // TODO or would we rather keep the error more vague? -- is used in other examples so probably a common practice
      return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });
    }

    const body = await parseRequestBody(req);
    if (!body || typeof body !== "object" || !Array.isArray((body as ClientLogBatch).entries)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { entries } = body as ClientLogBatch;

    if (entries.length > MAX_ENTRIES_PER_BATCH) {
      return NextResponse.json({ error: "Batch too large" }, { status: 400 });
    }

    for (const entry of entries) {
      // Skip invalid entries without failing the whole batch
      if (!isValidEntry(entry)) continue;
      // Type narrowed above for safety
      LOG_METHODS[entry.level](formatEntry(entry));
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    logMessage.error(e as Error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};
