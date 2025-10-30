"use client";

import { useEffect } from "react";
import { Button } from "@clientComponents/globals";
import { useResponsesContext } from "../context/ResponsesContext";
import { LoadKey } from "./LoadKey";
import { useRouter } from "next/navigation";

export const SelectApiKey = ({ locale, id }: { locale: string; id: string }) => {
  const router = useRouter();
  const { userKey, handleLoadApiKey, apiClient, retrieveResponses, newFormSubmissions } =
    useResponsesContext();

  useEffect(() => {
    if (!userKey) {
      return;
    }

    void retrieveResponses();
  }, [retrieveResponses, userKey]);

  const handleCancel = () => {
    //
  };

  const handleNext = () => {
    router.push(`/${locale}/form-builder/${id}/responses-beta/location`);
  };

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
        <Button theme="secondary" onClick={handleCancel}>
          Cancel
        </Button>

        <Button theme="primary" disabled={!apiClient} onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  );
};
