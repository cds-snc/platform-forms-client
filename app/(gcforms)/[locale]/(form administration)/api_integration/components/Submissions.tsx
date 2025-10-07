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

import { Loader } from "@clientComponents/globals/Loader";

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

                {completed ? (
                  <p className="mt-5">Responses processed successfully!</p>
                ) : (
                  <div className="mt-5">
                    {responsesProcessed > 0 ? (
                      <div>
                        <Loader message={`Processing ${responsesProcessed} responses...`} />{" "}
                      </div>
                    ) : null}
                  </div>
                )}
                {tokenRateLimiter ? (
                  <p className="mt-5 text-red-600">
                    You have hit the token rate limit. Please try again later.
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <Button
                  onClick={async () => {
                    const directory = await showDirectoryPicker();
                    setDirectoryHandle(directory);
                  }}
                >
                  Choose Save Location
                </Button>
              </>
            )}
          </>
        ) : isLoading ? (
          <div>
            <p>Loading...</p>
          </div>
        ) : (
          <div>
            <p>No new form submissions found.</p>
          </div>
        )}
      </div>
    </ContentWrapper>
  );
};
