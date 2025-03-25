"use server";
import { logMessage } from "@lib/logger";
import { FormServerErrorCodes } from "@lib/types/form-builder-types";

const codeMatch = (code: string): boolean => {
  const found = Object.values(FormServerErrorCodes).find((value) => value === code);
  return Boolean(found);
};

export const logMessageError = async (code: string) => {
  if (!codeMatch(code)) {
    return;
  }
  logMessage.error(`Client Error: ${code}`);
};
