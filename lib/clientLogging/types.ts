export type LogLevel = "debug" | "info" | "warn" | "error";

// Primitive-only values to prevent malicious code e.g. object injection and serialization "surprises"
export type LogContext = Record<string, string | number | boolean>;

export interface ClientLogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: number;
  count?: number;
  sessionId: string;
}

export interface ClientLogBatch {
  entries: ClientLogEntry[];
}
