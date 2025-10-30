"use client";

import { useEffect } from "react";
import { useResponsesContext } from "../context/ResponsesContext";
import MapleLeafLoader from "@root/components/clientComponents/icons";
import { Button } from "@root/components/clientComponents/globals";

export const ProcessingDownloads = ({ locale, id }: { locale: string; id: string }) => {
  const { processedSubmissionIds, processingCompleted, setInterrupt, interrupt } =
    useResponsesContext();

  locale;
  id;

  useEffect(() => {
    if (processingCompleted) {
      const timer = setTimeout(() => {
        // @TODO: Navigate to the results page
        // onNext();
      }, 2000); // 2 seconds delay

      return () => clearTimeout(timer); // Cleanup on unmount or if processingCompleted changes
    }
  }, [processingCompleted]);

  return (
    <div>
      <MapleLeafLoader
        message={`Processing ${processedSubmissionIds.size} responses...`}
        width={300}
        height={350}
      />
      {!interrupt && (
        <Button theme="secondary" onClick={() => setInterrupt(true)}>
          Interrupt
        </Button>
      )}
      <p>
        Status:
        {interrupt ? "interrupting..." : processingCompleted ? "complete" : "processing..."}
      </p>
    </div>
  );
};
