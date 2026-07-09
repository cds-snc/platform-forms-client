"use server";
import { logMessage } from "@lib/logger";
import { FormServerErrorCodes } from "@lib/types/form-builder-types";

const codeMatch = (code: string): boolean => {
  const found = Object.values(FormServerErrorCodes).find((value) => value === code);
  return Boolean(found);
};

// Logs an error message from the client.
// example log: "Client Error: FR05-1742927526697 - formID: cm70y5cl70000yo69tgxe9j25"
export const logErrorMessage = async (
  code: string,
  formId: string,
  timestamp: number
): Promise<void> => {
  if (!code || !formId || !timestamp) {
    return;
  }

  // Only allow specific error codes to be logged
  if (!codeMatch(code)) {
    return;
  }

  logMessageToServer({
    message: `Client Error: ${code}-${timestamp} - formID: ${formId}`,
    type: "error",
  });
};

export const logMessageToServer = async ({
  message,
  type = "info",
}: {
  message: string;
  type?: "info" | "warn" | "error";
}): Promise<void> => {
  if (!message) {
    return;
  }

  // Validate type to prevent unvalidated dynamic method call
  const validTypes = ["info", "warn", "error"] as const;
  const safeType = validTypes.includes(type as (typeof validTypes)[number]) ? type : "info";

  logMessage[safeType](message);
};
