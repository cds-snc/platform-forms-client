"use client";
import { Button } from "@clientComponents/globals";
import { ErrorPanel } from "@clientComponents/globals/ErrorPanel";
import { logMessage } from "@lib/logger";
import { useEffect } from "react";

// This is the app catch all error component. If an error is thrown and an ErrorBoundary does not
// exist in that route, the error will bubble up the tree and if none are found, end here.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logMessage.error(`Client Error: ${error.message}`);
  }, [error]);

  // TODO: design and content

  return (
    <>
      <ErrorPanel title="Something went wrong!" supportLink={false}>
        <>
          <Button
            onClick={
              // Attempt to recover by trying to re-render the segment
              () => reset()
            }
          >
            Try again
          </Button>
        </>
      </ErrorPanel>
    </>
  );
}
