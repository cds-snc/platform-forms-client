import { Button } from "@root/components/clientComponents/globals";
import { useResponsesContext } from "../context/ResponsesContext";

export const Confirmation = () => {
  const {
    onNext,
    retrieveResponses,
    processResponses,
    processedSubmissionIds,
    setProcessedSubmissionIds,
    setProcessingCompleted,
    setInterrupt,
  } = useResponsesContext();

  const handleCheck = async () => {
    setProcessedSubmissionIds(new Set());
    setProcessingCompleted(false);
    setInterrupt(false);

    setTimeout(async () => {
      const initialResponses = await retrieveResponses();
      processResponses(initialResponses);
      onNext();
    }, 500);
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
