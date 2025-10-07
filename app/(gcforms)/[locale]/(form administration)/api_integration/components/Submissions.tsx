/* eslint-disable no-await-in-loop */
import { useCallback } from "react";
import { showDirectoryPicker } from "native-file-system-adapter";
import { useState, useEffect } from "react";
import { type IGCFormsApiClient } from "../lib/IGCFormsApiClient";

import { TokenRateLimitError } from "../lib/error";
import { createSubArrays, downloadAndConfirmFormSubmissions } from "../lib/utils";
import { Button } from "@clientComponents/globals";

import { FileSystemDirectoryHandle } from "native-file-system-adapter";

import type { NewFormSubmission, PrivateApiKey } from "../lib/types";

import { ContentWrapper } from "./ContentWrapper";
import { ProcessingMessage } from "./ProcessingMessage";
import { NoSubmissions } from "./NoSubmissions";

export const Submissions = ({
  apiClient,
  userKey,
}: {
  apiClient: IGCFormsApiClient | null;
  userKey: PrivateApiKey | null;
}) => {
  const [newFormSubmissions, setNewFormSubmissions] = useState<NewFormSubmission[] | null>(null);
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [responsesProcessed, setResponsesProcessed] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [tokenRateLimiter, setTokenRateLimiter] = useState<boolean>(false);

  const isLoading = apiClient && newFormSubmissions === null;

  useEffect(() => {
    if (apiClient) {
      apiClient
        .getNewFormSubmissions()
        .then((submissions) => {
          setNewFormSubmissions(submissions);
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error("Error loading submissions:", error);
          // Set empty array on error to stop loading state
          setNewFormSubmissions([]);
        });
    }
  }, [apiClient]);

  const handleProcessSubmissions = useCallback(async () => {
    setTokenRateLimiter(false);
    let formResponses = [...newFormSubmissions];

    while (formResponses.length > 0) {
      try {
        const subArrays = createSubArrays(formResponses, 5);
        for (const subArray of subArrays) {
          await downloadAndConfirmFormSubmissions(directoryHandle, apiClient, userKey, subArray);
          setResponsesProcessed((prev) => prev + subArray.length);

          formResponses = await apiClient.getNewFormSubmissions();
        }
      } catch (error) {
        if (error instanceof TokenRateLimitError) {
          setTokenRateLimiter(true);
        }
        break;
      }
    }
    setCompleted(true);
  }, [apiClient, directoryHandle, newFormSubmissions, userKey]);

  if (!userKey || !apiClient) {
    return null;
  }

  return (
    <ContentWrapper>
      <div>
        {newFormSubmissions && newFormSubmissions.length > 0 ? (
          <>
            {!completed && responsesProcessed < 1 && (
              <p className="my-5">{`At least ${newFormSubmissions.length} New Responses ready for download`}</p>
            )}

            {directoryHandle ? (
              <>
                {!completed && responsesProcessed < 1 && (
                  <div>
                    <Button onClick={handleProcessSubmissions}>Download and Confirm</Button>
                  </div>
                )}

                <ProcessingMessage
                  completed={completed}
                  responsesProcessed={responsesProcessed}
                  tokenRateLimiter={tokenRateLimiter}
                />
              </>
            ) : (
              <Button
                onClick={async () => {
                  const directory = await showDirectoryPicker();
                  setDirectoryHandle(directory);
                }}
              >
                Choose Save Location
              </Button>
            )}
          </>
        ) : (
          <NoSubmissions isLoading={isLoading} />
        )}
      </div>
    </ContentWrapper>
  );
};
