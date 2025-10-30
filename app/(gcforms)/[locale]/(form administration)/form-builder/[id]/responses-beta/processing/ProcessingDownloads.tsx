"use client";

import { useEffect } from "react";
import { useResponsesContext } from "../context/ResponsesContext";
import MapleLeafLoader from "@root/components/clientComponents/icons";
import { Button } from "@root/components/clientComponents/globals";
import { useRouter } from "next/navigation";

export const ProcessingDownloads = ({ locale, id }: { locale: string; id: string }) => {
  const router = useRouter();

  const { processedSubmissionIds, processingCompleted, setInterrupt, interrupt } =
    useResponsesContext();

  useEffect(() => {
    if (processingCompleted) {
      const timer = setTimeout(() => {
        router.push(`/${locale}/form-builder/${id}/responses-beta/result`);
      }, 2000); // 2 seconds delay

      return () => clearTimeout(timer); // Cleanup on unmount or if processingCompleted changes
    }
  }, [id, locale, processingCompleted, router]);

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
