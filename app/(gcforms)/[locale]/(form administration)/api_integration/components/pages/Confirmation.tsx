import { Button } from "@root/components/clientComponents/globals";
import { useStepFlow } from "../../contexts/ApiResponseDownloaderContext";

export const Confirmation = () => {
  const {
    onNext,
    retrieveResponses,
    processedSubmissionIds,
    setProcessedSubmissionIds,
    setProcessingCompleted,
    setInterrupt,
  } = useStepFlow();

  const handleCheck = async () => {
    setProcessedSubmissionIds(new Set());
    setProcessingCompleted(false);
    setInterrupt(false);

    setTimeout(async () => {
      await retrieveResponses();
      onNext();
    }, 2000);
  };

  return (
    <div>
      You downloaded {processedSubmissionIds.size} responses.
      <div className="flex flex-row gap-4">
        <Button theme="primary" onClick={handleCheck}>
          Check for new responses
        </Button>
      </div>
    </div>
  );
};
