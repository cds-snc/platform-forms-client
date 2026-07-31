import { NextRequest, NextResponse } from "next/server";
import { logMessage } from "@lib/logger";
import { getClientIp } from "@lib/ip";
import { checkClientLogRateLimit } from "@lib/clientLogging/rateLimiter";
import { ClientLogBatch, ClientLogEntry, LogLevel } from "@lib/clientLogging/types";

const MAX_ENTRIES_PER_BATCH = 25;
const MAX_MESSAGE_LENGTH = 1000;
// Avoid excessive number of key=value pairs that could slow down JSON.stringify (and increase the payload)
const MAX_CONTEXT_KEYS = 20;
// Block oversized inputs. 100 seems resonable but could also go with 64 (2^6 is used in other similar examples)
const MAX_CONTEXT_KEY_LENGTH = 100;
const MAX_CONTEXT_VALUE_LENGTH = 200;
// Stricly UUID length - always 36 chars
const MAX_SESSION_ID_LENGTH = 36;
// Allows for logs that sat in the buffer a while, and for client clocks that are slightly off
const MAX_TIMESTAMP_SKEW_MS = 10 * 60 * 1000;
// In the future we may want to only alllow warn and error if e.g. debug gets too "noisy"
const VALID_LEVELS = new Set<LogLevel>(["debug", "info", "warn", "error"]);

const isValidContextValue = (v: unknown): boolean => {
  return typeof v === "string" || typeof v === "number" || typeof v === "boolean";
};

const isValidContext = (context: unknown): boolean => {
  if (typeof context !== "object" || context === null || Array.isArray(context)) {
    return false;
  }
  const obj = context as Record<string, unknown>;
  return (
    Object.keys(obj).length <= MAX_CONTEXT_KEYS &&
    Object.keys(obj).every((k) => k.length <= MAX_CONTEXT_KEY_LENGTH) &&
    Object.values(obj).every((v) => {
      if (!isValidContextValue(v)) return false;
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
    (e.sessionId === undefined ||
      (typeof e.sessionId === "string" && e.sessionId.length <= MAX_SESSION_ID_LENGTH)) &&
    (e.context === undefined || isValidContext(e.context))
  );
};

// Removes newlines and control chars to prevent log injection in line-based viewers
const sanitizeMessage = (message: string): string =>
  message.replace(/[\x00-\x1F\x7F]/g, " ").trim();

const formatEntry = (entry: ClientLogEntry): string => {
  // Adding a sessionId helps to identify the issue and what led up to the issue
  const sid = entry.sessionId ? `[${entry.sessionId}] ` : "";
  const count = entry.count && entry.count > 1 ? ` (x${entry.count})` : "";
  const context = entry.context ? ` ${JSON.stringify(entry.context)}` : "";
  return `[CLIENT] ${sid}${sanitizeMessage(entry.message)}${count}${context}`;
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
      // TODO: are we OK with IPs in the error logs? -- not sure if we do this anywhere else, if not, this should be removed.
      logMessage.warn(`Client log rate limit exceeded: ${ip}`);
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // Reject non-JSON before attempting to parse
    if (!req.headers.get("content-type")?.includes("application/json")) {
      // TODO or would we rather keep the error more vague?
      return NextResponse.json({ error: "Unsupported content type" }, { status: 415 });
    }

    const body = await parseRequestBody(req);
    if (!body || typeof body !== "object" || !Array.isArray((body as ClientLogBatch).entries)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { entries } = body as ClientLogBatch;

    if (entries.length > MAX_ENTRIES_PER_BATCH) {
      return NextResponse.json(
        { error: `Batch exceeds maximum of ${MAX_ENTRIES_PER_BATCH} entries` },
        { status: 400 }
      );
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
