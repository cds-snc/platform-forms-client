"use client";
import { ErrorPanel } from "@clientComponents/globals";
import { logMessage } from "@lib/logger";
import { useEffect } from "react";

// TODO: design and content

export default function Error({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    logMessage.error(`Client Error: ${error.message}`);
  }, [error]);

  return (
    <>
      <ErrorPanel title="Sorry, something went wrong with Settings." supportLink={false}>
        <>
          {error.message && <p className="mb-5"></p>}
          {/* <Button
            onClick={
              // Attempt to recover by trying to re-render the segment
              () => reset()
            }
          >
            Try again
          </Button> */}
        </>
      </ErrorPanel>
    </>
  );
}
