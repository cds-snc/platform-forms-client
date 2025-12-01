import type { FileSystemDirectoryHandle } from "native-file-system-adapter";

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

export class ResponseDownloadLogger {
  private directoryHandle: FileSystemDirectoryHandle | null = null;
  private sessionId: string;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor() {
    this.sessionId = `download-${Date.now()}`;
  }

  setDirectoryHandle(handle: FileSystemDirectoryHandle) {
    if (process.env.VITEST_BROWSER === "true") {
      return;
    }
    this.directoryHandle = handle;
    this.log("info", "Logging session started", { sessionId: this.sessionId });
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
      const fileName = `download-log-${this.sessionId}.txt`;
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

  error(message: string, error?: unknown) {
    this.log("error", message, {
      error:
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
              cause: error.cause,
            }
          : error instanceof DOMException
            ? {
                message: error.message,
                name: error.name,
                code: error.code,
                cause: error.cause,
              }
            : error,
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
