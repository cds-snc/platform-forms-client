import { useEffect } from "react";
import { useStepFlow } from "../../contexts/ApiResponseDownloaderContext";
import MapleLeafLoader from "@root/components/clientComponents/icons";

export const ProcessingDownloads = () => {
  const { onNext, processedSubmissionIds, processingCompleted } = useStepFlow();

  useEffect(() => {
    if (processingCompleted) {
      const timer = setTimeout(() => {
        onNext();
      }, 2000); // 2 seconds delay

      return () => clearTimeout(timer); // Cleanup on unmount or if processingCompleted changes
    }
  }, [processingCompleted, onNext]);

  return (
    <div>
      <MapleLeafLoader
        message={`Processing ${processedSubmissionIds.size} responses...`}
        width={300}
        height={350}
      />
      {processingCompleted ? "complete" : "processing..."}
    </div>
  );
};
