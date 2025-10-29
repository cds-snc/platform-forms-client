import { useEffect } from "react";
import { Button } from "@clientComponents/globals";
import { useStepFlow } from "../../contexts/ApiResponseDownloaderContext";
import { LoadKey } from "../LoadKey";

export const SelectApiKey = () => {
  const {
    onNext,
    onCancel,
    userKey,
    handleLoadApiKey,
    apiClient,
    retrieveResponses,
    newFormSubmissions,
  } = useStepFlow();

  useEffect(() => {
    if (!userKey) {
      return;
    }

    void retrieveResponses();
  }, [retrieveResponses, userKey]);

  return (
    <div>
      <div>Step 1 of 3</div>
      <h1>Select ApiKey</h1>

      {(newFormSubmissions?.length ?? 0) > 0 && (
        <p className="mb-4">
          There are at least {newFormSubmissions?.length ?? 0} new responses to download.
        </p>
      )}

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
