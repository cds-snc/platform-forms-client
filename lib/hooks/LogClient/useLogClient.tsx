"use client";
import { FormServerErrorCodes } from "@lib/types/form-builder-types";
import { logErrorMessage } from "./action";
import { useEffect, useState } from "react";

interface ClientLog {
  code: FormServerErrorCodes;
  formId: string;
  timestamp: number;
}

// Use to send an error code from the client (browser) to the server to be loggeed.
export const useLogClient = () => {
  const [message, setMessage] = useState<ClientLog>();

  useEffect(() => {
    (async () => {
      if (message) {
        await logErrorMessage(message.code, message.formId, message.timestamp);
        setMessage(undefined);
      }
    })();
  }, [message]);

  return {
    logClientError: ({
      code,
      formId,
      timestamp,
    }: {
      code: FormServerErrorCodes;
      formId: string;
      timestamp?: number;
    }) => setMessage({ code, formId, timestamp: timestamp || Date.now() }),
  };
};
