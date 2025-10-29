import { Button } from "@clientComponents/globals";
import { useStepFlow } from "../../contexts/ApiResponseDownloaderContext";
import { LoadKey } from "../LoadKey";

export const SelectApiKey = () => {
  const { onNext, onCancel, userKey, handleLoadApiKey, apiClient } = useStepFlow();

  return (
    <div>
      <div>Step 1 of 3</div>
      <h1>Select ApiKey</h1>

      {!apiClient && <LoadKey onLoadKey={handleLoadApiKey} />}
      {apiClient && (
        <>
          <p>API Key Loaded Successfully</p>
        </>
      )}

      <div className="mt-8 flex flex-row gap-4">
        <Button theme="secondary" onClick={onCancel}>
          Cancel
        </Button>
        {userKey && (
          <Button theme="primary" onClick={onNext}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
};
