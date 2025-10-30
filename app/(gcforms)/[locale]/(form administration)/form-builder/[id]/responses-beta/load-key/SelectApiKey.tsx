"use client";

import { useEffect } from "react";
import { Button } from "@clientComponents/globals";
import { useResponsesContext } from "../context/ResponsesContext";
import { LoadKey } from "./LoadKey";
import { LinkButton } from "@root/components/serverComponents/globals/Buttons/LinkButton";

export const SelectApiKey = ({ locale, id }: { locale: string; id: string }) => {
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
        {userKey && (
          <LinkButton.Primary href={`/${locale}/form-builder/${id}/responses-beta/location`}>
            Next
          </LinkButton.Primary>
        )}
      </div>
    </div>
  );
};
