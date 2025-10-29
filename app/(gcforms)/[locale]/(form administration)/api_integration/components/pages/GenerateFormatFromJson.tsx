import { Button } from "@root/components/clientComponents/globals";
import { useStepFlow } from "../../contexts/ApiResponseDownloaderContext";

export const GenerateFormatFromJson = () => {
  const { onCancel } = useStepFlow();
  return (
    <div>
      <h1>Generate from JSON</h1>
      <div className="flex flex-row gap-4">
        <Button theme="secondary" onClick={onCancel}>
          Exit
        </Button>
        <Button theme="primary">Generate</Button>
      </div>
    </div>
  );
};
