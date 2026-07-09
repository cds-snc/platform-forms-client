"use client";
import { useEffect, useState } from "react";
import { logMessageToServer } from "./action";

type LogMessage = {
  message: string;
  type: "info" | "warn" | "error";
};

export const useLogMessageToServer = () => {
  const [logMessage, setLogMessage] = useState(null as LogMessage | null);

  useEffect(() => {
    (async () => {
      if (logMessage) {
        await logMessageToServer({ ...logMessage });
        setLogMessage(null);
      }
    })();
  }, [logMessage]);

  return {
    logMessageToServer: ({ message, type }: LogMessage) => setLogMessage({ message, type }),
  };
};
