import { logMessage } from "@lib/logger";

export function formatAuthError(error: Error): string {
  const type = "type" in error && typeof error.type === "string" ? error.type : error.name;
  const cause = error.cause;
  const causeError =
    cause instanceof Error
      ? cause
      : typeof cause === "object" && cause !== null && "err" in cause && cause.err instanceof Error
        ? cause.err
        : undefined;

  const causeMessage = causeError ? `; cause: ${causeError.name}: ${causeError.message}` : "";

  return `NextAuth error [${type}]: ${error.message}${causeMessage}`;
}

export function logNextAuthError(code: string, ...message: unknown[]) {
  logMessage.info(code);

  const details = message
    .map((entry) => (entry instanceof Error ? `${entry.name}: ${entry.message}` : String(entry)))
    .join(" ");

  if (details) {
    logMessage.debug(`NextAuth debug details for ${code}: ${details}`);
  }
}
