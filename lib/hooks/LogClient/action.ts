"use server";
import { logMessage } from "@lib/logger";
import { FormServerErrorCodes } from "@lib/types/form-builder-types";

const codeMatch = (code: string): boolean => {
  const found = Object.values(FormServerErrorCodes).find((value) => value === code);
  return Boolean(found);
};

export type ClientLogLevel = "error" | "warn";

// Logs a message from the client.
// example log: "Client Error: FR05-1742927526697 - formID: cm70y5cl70000yo69tgxe9j25 - optional detail"
export const logErrorMessage = async (
  code: string,
  formId: string,
  timestamp: number,
  detail?: string,
  level?: ClientLogLevel
): Promise<void> => {
  if (!code || !formId || !timestamp) {
    return;
  }

  // Only allow specific error codes to be logged
  if (!codeMatch(code)) {
    return;
  }

  // Sanitize and limit the detail string
  const safeDetail =
    typeof detail === "string"
      ? detail
          .replace(/[^\w .:=,/-]/g, "")
          .trim()
          .slice(0, 100)
      : "";

  const message = `Client Error: ${code}-${timestamp} - formID: ${formId}${safeDetail ? ` - ${safeDetail}` : ""}`;

  // Level is client supplied so only allow known values, defaulting to error
  if (level === "warn") {
    logMessage.warn(message);
  } else {
    logMessage.error(message);
  }
};
