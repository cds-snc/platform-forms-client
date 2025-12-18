import { MAX_RESPONSE_SIZE } from "../../constants";
import { Response } from "@lib/types";

export const validatePayloadSize = (
  responses: Record<string, Response>,
  maxPayloadSize: number = MAX_RESPONSE_SIZE
) => {
  try {
    const jsonString = JSON.stringify(responses);
    return new Blob([jsonString]).size <= maxPayloadSize;
  } catch (e) {
    return false;
  }
};
