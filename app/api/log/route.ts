import { NextRequest, NextResponse } from "next/server";
import { logMessage } from "@lib/logger";
import { getClientIp } from "@lib/ip";
import { checkClientLogRateLimit } from "@lib/clientLogging/rateLimiter";
import { ClientLogBatch, ClientLogEntry, LogLevel } from "@lib/clientLogging/types";

// TODO probably move below into a config/constants file

const MAX_ENTRIES_PER_BATCH = 25;
const MAX_MESSAGE_LENGTH = 1000;
// Avoid exessive number of key=value pairs that could slow down JSON.stringify (and increase the paylod)
const MAX_CONTEXT_KEYS = 20;
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
    Object.keys(obj).length <= MAX_CONTEXT_KEYS && Object.values(obj).every(isValidContextValue)
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
    (e.context === undefined || isValidContext(e.context))
  );
};

const formatEntry = (entry: ClientLogEntry): string => {
  // Adjust for de-duped messages with a count of occurrances
  const count = entry.count && entry.count > 1 ? ` (x${entry.count})` : "";
  const context = entry.context ? ` ${JSON.stringify(entry.context)}` : "";
  return `[CLIENT] ${entry.message}${count}${context}`;
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
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
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
