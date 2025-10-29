import { useEffect } from "react";
import { useStepFlow } from "../../contexts/ApiResponseDownloaderContext";
import MapleLeafLoader from "@root/components/clientComponents/icons";
import { Button } from "@root/components/clientComponents/globals";

export const ProcessingDownloads = () => {
  const {
    onNext,
    processedSubmissionIds,
    processingCompleted,
    setProcessedSubmissionIds,
    setProcessingCompleted,
    setInterrupt,
    interrupt,
  } = useStepFlow();

  useEffect(() => {
    if (processingCompleted) {
      const timer = setTimeout(() => {
        setInterrupt(false);
        setProcessingCompleted(false);
        setProcessedSubmissionIds(new Set());
        onNext();
      }, 2000); // 2 seconds delay

      return () => clearTimeout(timer); // Cleanup on unmount or if processingCompleted changes
    }
  }, [
    processingCompleted,
    onNext,
    setInterrupt,
    setProcessingCompleted,
    setProcessedSubmissionIds,
  ]);

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
