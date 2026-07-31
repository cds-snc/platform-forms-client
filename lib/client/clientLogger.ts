"use client";

import type { ClientLogEntry, LogContext, LogLevel } from "@lib/clientLogging/types";

// Keeping intentionally high for the case of shared IPs and all users getting rate limited. (30 requests per minute per IP)
// Exception: log errors immediately for case of a critical error that would be missed in a 5s duration.
const FLUSH_INTERVAL_MS = 5000;
const MAX_BUFFER_SIZE = 10;
const LOG_ENDPOINT = "/api/log";

// Falls back to Math.random in non-secure contexts (e.g. http dev environments)
const generateSessionId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const BASE_36_RADIX = 36;
  const LEADING_CHARS_TO_DROP = 2;
  return Math.random().toString(BASE_36_RADIX).slice(LEADING_CHARS_TO_DROP);
};

// Note: Class used to make it easier to pass the state around and also enforce a singleton pattern -- TODO probably remove this comment, kind of obvious..
class ClientLogger {
  private buffer: ClientLogEntry[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  // Identifies all logs from a single browser session for CloudWatch correlation
  private readonly sessionId = generateSessionId();

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden" && this.buffer.length > 0) {
          this.flushBeacon();
        }
      });
    }
  }

  // TODO could add more structure to context e.g. always include formId -- though would limit the use cases

  debug(message: string, context?: LogContext): void {
    this.enqueue("debug", message, context);
  }

  info(message: string, context?: LogContext): void {
    this.enqueue("info", message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.enqueue("warn", message, context);
  }

  error(message: string, context?: LogContext): void {
    this.enqueue("error", message, context);
    // Errors flush immediately — don't wait for the timer
    this.flush();
  }

  private isDuplicate(
    entry: ClientLogEntry,
    level: LogLevel,
    message: string,
    context?: LogContext
  ): boolean {
    // Copy objects to string values for strict comparison (by ref would fail since objects)
    const contextsMatch = JSON.stringify(entry.context ?? "") === JSON.stringify(context ?? "");
    return entry.level === level && entry.message === message && contextsMatch;
  }

  private enqueue(level: LogLevel, message: string, context?: LogContext): void {
    const last = this.buffer.at(-1);

    // Skip if the message is a duplicate - keeps original timestamp since usually want to know
    // when an occurance started. Later if we want the window of occurances time we can add the
    // final timestamp.
    if (last && this.isDuplicate(last, level, message, context)) {
      last.count = (last.count ?? 1) + 1;
      return;
    }

    this.buffer.push({ level, message, context, timestamp: Date.now(), sessionId: this.sessionId });

    if (this.buffer.length >= MAX_BUFFER_SIZE) {
      this.flush();
      return;
    }

    this.scheduleFlush();
  }

  private scheduleFlush(): void {
    if (this.timer !== null) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      this.flush();
    }, FLUSH_INTERVAL_MS);
  }

  // Shared by flush() and flushBeacon() — clears the buffer and cancels the pending timer
  private drainEntries(): ClientLogEntry[] {
    const entries = this.buffer.splice(0);
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    return entries;
  }

  flush(): void {
    if (this.buffer.length === 0) return;
    const entries = this.drainEntries();
    try {
      fetch(LOG_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
        keepalive: true,
      }).catch(() => {
        // Logs are best-effort — swallow network failures silently
      });
    } catch {
      // Serialization failure — nothing recoverable to do
    }
  }

  // Used on page unload via visibilitychange
  private flushBeacon(): void {
    if (this.buffer.length === 0) return;
    const entries = this.drainEntries();
    try {
      // Use the sendBeacon API to ensure even a tab/window close will sent by being passed to the browser's background queue.
      // Note: sendBeacon returns false (not throw) when the browser rejects the payload (e.g. too large)
      navigator.sendBeacon(
        LOG_ENDPOINT,
        new Blob([JSON.stringify({ entries })], { type: "application/json" })
      );
    } catch {
      // Serialization failure — nothing recoverable to do
    }
  }
}

export const clientLogger = new ClientLogger();
