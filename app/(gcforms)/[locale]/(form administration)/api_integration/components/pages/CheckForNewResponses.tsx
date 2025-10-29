import { Button } from "@root/components/clientComponents/globals";
import { useStepFlow } from "../../contexts/ApiResponseDownloaderContext";

export const CheckForNewResponses = () => {
  const { onCancel, onNext, retrieveResponses } = useStepFlow();

  const handleNext = async () => {
    await retrieveResponses();
    onNext();
  };

  return (
    <div>
      Here we can check for new responses.
      <div className="flex flex-row gap-4">
        <Button theme="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button theme="primary" onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  );
};
