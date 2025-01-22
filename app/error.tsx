"use client";
import { ErrorPanel } from "@clientComponents/globals/ErrorPanel";
import { logMessage } from "@lib/logger";
import { useEffect } from "react";

// See: https://nextjs.org/docs/app/api-reference/file-conventions/error
export default function Error({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    logMessage.error(`Client Error: ${error.message}`);
  }, [error]);

  return <ErrorPanel supportLink={false} />;
}
