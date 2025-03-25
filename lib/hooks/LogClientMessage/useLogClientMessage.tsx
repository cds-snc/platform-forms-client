"use client";
import { FormServerErrorCodes } from "@lib/types/form-builder-types";
import { logMessageError } from "./action";
import { useEffect, useState } from "react";

interface ClientLogMessage {
  code: FormServerErrorCodes;
  formId: string;
}

// Use to send an error code from the client (browser) to the server to be loggeed.
export const useLogClientMessage = () => {
  const [message, setMessage] = useState<ClientLogMessage>();

  useEffect(() => {
    (async () => {
      if (message) {
        await logMessageError({
          code: `${message.code}-${Date.now()}`,
          formId: message.formId,
        });
        setMessage(undefined);
      }
    })();
  }, [message]);

  return {
    logClientError: (code: FormServerErrorCodes, formId: string) => setMessage({ code, formId }),
  };
};
