"use server";
import { logMessage } from "@lib/logger";
import { FormServerErrorCodes } from "@lib/types/form-builder-types";

const codeMatch = (code: string): boolean => {
  const found = Object.values(FormServerErrorCodes).find((value) => value === code);
  return Boolean(found);
};

export const logMessageError = async (message: { code: string; formId: string }) => {
  if (!message || !message.code || !message.formId) {
    return;
  }

  // Only allow specific error codes to be logged
  const { code, formId } = message;
  const codeWithoutTimestamp = code.split("-")[0];
  if (!codeMatch(codeWithoutTimestamp)) {
    return;
  }

  logMessage.error(`Client Error: ${code} - formID: ${formId}`);
};
