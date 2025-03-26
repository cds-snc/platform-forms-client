"use server";
import { logMessage } from "@lib/logger";
import { FormServerErrorCodes } from "@lib/types/form-builder-types";

const codeMatch = (code: string): boolean => {
  const found = Object.values(FormServerErrorCodes).find((value) => value === code);
  return Boolean(found);
};

// Logs an error message from the client.
// Example: {"level":"error","time":1742927527001,"msg":"Client Error: FR05-1742927526697 - formID: cm70y5cl70000yo69tgxe9j25"}
export const logErrorMessage = async (
  code: string,
  formId: string,
  timestamp: number
): Promise<boolean> => {
  if (!code || !formId || !timestamp) {
    return false;
  }

  // Only allow specific error codes to be logged
  if (!codeMatch(code)) {
    return false;
  }

  logMessage.error(`Client Error: ${code}-${timestamp} - formID: ${formId}`);
  return true;
};
