"use client";
import { FormServerErrorCodes } from "@lib/types/form-builder-types";
import { logMessageError } from "./action";
import { useEffect, useState } from "react";

// Use to send an error code from the client (browser) to the server to be loggeed.
export const useLogMessage = () => {
  const [code, setCode] = useState<FormServerErrorCodes>();

  useEffect(() => {
    (async () => {
      if (code) {
        await logMessageError(code);
        setCode(undefined);
      }
    })();
  }, [code]);

  return {
    logClientError: (code: FormServerErrorCodes) => setCode(code),
  };
};
