"use client";
import { checkFlag } from "@formBuilder/actions";
import { logMessage } from "@lib/logger";
import { useEffect, useState } from "react";

export const useFlag = (key: string): { status: boolean | undefined } => {
  const [status, setStatus] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    checkFlag(key)
      .then((status) => {
        setStatus(!!status);
      })
      .catch((err) => {
        logMessage.error(err);
      });
  }, [setStatus, key]);

  return { status };
};
