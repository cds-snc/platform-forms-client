import type { FileSystemDirectoryHandle } from "native-file-system-adapter";
import { DOWNLOAD_LOG_FILENAME_PREFIX } from "./constants";

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

const serializeError = (error: unknown, depth = 0): unknown => {
  if (error instanceof Error || error instanceof DOMException) {
    return {
      message: error.message,
      name: error.name,
      code: error instanceof DOMException ? error.code : undefined,
      stack: error instanceof Error ? error.stack : undefined,
      cause: "cause" in error && depth < 5 ? serializeError(error.cause, depth + 1) : undefined,
    };
  }
  return error;
};

// Only failures add an entry; successful file operations must not flood the on-disk log.
export const logDownloadOperation = async <T>(
  logger: ResponseDownloadLogger,
  context: { submissionId: string; operation: string; path?: string },
  operation: () => Promise<T>
): Promise<T> => {
  const startedAt = Date.now();
  try {
    return await operation();
  } catch (error) {
    logger.error("Response download operation failed", error, {
      ...context,
      durationMs: Date.now() - startedAt,
    });
    throw error;
  }
};

export class ResponseDownloadLogger {
  private directoryHandle: FileSystemDirectoryHandle | null = null;
  private sessionId: string;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor() {
    this.sessionId = `${Date.now()}`;
  }

  setDirectoryHandle(handle: FileSystemDirectoryHandle) {
    if (process.env.VITEST_BROWSER === "true") {
      return;
    }
    this.directoryHandle = handle;
    this.log("info", "Logging session started", {
      sessionId: this.sessionId,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    });
  }

  private async writeToFile(entry: LogEntry): Promise<void> {
    // Skip writing to disk when running browser-mode Vitest to avoid
    // calling file system APIs in test environments.
    if (process.env.VITEST_BROWSER === "true") {
      return;
    }

    if (!this.directoryHandle) {
      return;
    }

    try {
      const fileName = `${DOWNLOAD_LOG_FILENAME_PREFIX}${this.sessionId}.txt`;
      const fileHandle = await this.directoryHandle.getFileHandle(fileName, { create: true });

      // Get existing file content
      const file = await fileHandle.getFile();
      const existingContent = await file.text();

      // Format new log entry
      const logLine = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${
        entry.data ? `\n  Data: ${JSON.stringify(entry.data, null, 2)}` : ""
      }\n\n`;

      // Append to file
      const writable = await fileHandle.createWritable();
      await writable.write(existingContent + logLine);
      await writable.close();
    } catch (error) {
      // Silently fail to avoid recursive logging issues
      // eslint-disable-next-line no-console
      console.error("Failed to write log to file:", error);
    }
  }

  log(level: LogLevel, message: string, data?: unknown) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };

    // Also log to console for debugging
    // eslint-disable-next-line no-console
    console["log"](`[${level.toUpperCase()}] ${message}`, data || "");

    // Queue write to avoid race conditions
    this.writeQueue = this.writeQueue.then(() => this.writeToFile(entry));
  }

  info(message: string, data?: unknown) {
    this.log("info", message, data);
  }

  warn(message: string, data?: unknown) {
    this.log("warn", message, data);
  }

  error(message: string, error?: unknown, context?: Record<string, unknown>) {
    this.log("error", message, {
      ...context,
      error: serializeError(error),
    });
  }

  debug(message: string, data?: unknown) {
    this.log("debug", message, data);
  }

  async flush(): Promise<void> {
    // Wait for any pending writes to complete
    await this.writeQueue;
  }
}
