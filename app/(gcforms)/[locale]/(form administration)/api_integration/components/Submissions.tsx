/* eslint-disable no-await-in-loop */

import { showDirectoryPicker } from "native-file-system-adapter";

import { useState, useEffect } from "react";

import { TokenRateLimitError } from "../lib/error";
import { createSubArrays, downloadAndConfirmFormSubmissions } from "../lib/utils";
import { Button } from "@clientComponents/globals";

import { FileSystemDirectoryHandle } from "native-file-system-adapter";

import type { NewFormSubmission } from "../lib/types";
import { useGetClient } from "../hooks/useGetClient";

export const Submissions = () => {
  const [newFormSubmissions, setNewFormSubmissions] = useState<NewFormSubmission[]>([]);
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [responsesProcessed, setResponsesProcessed] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [tokenRateLimiter, setTokenRateLimiter] = useState<boolean>(false);

  const { userKey, apiClient } = useGetClient();

  useEffect(() => {
    if (apiClient) {
      apiClient.getNewFormSubmissions().then((submissions) => {
        setNewFormSubmissions(submissions);
      });
    }
  }, [apiClient]);

  if (!userKey || !apiClient) {
    return null;
  }

  return (
    <div className="flex size-full flex-col items-center justify-center">
      <div className="m-5">
        {newFormSubmissions.length > 0 && apiClient ? (
          <>
            <p>{`At least ${newFormSubmissions.length} New Responses ready for download`}</p>
            {directoryHandle ? (
              <>
                <p className="text-green-600">Save location set: {directoryHandle.name}</p>
                <Button
                  hidden={completed}
                  onClick={async () => {
                    setTokenRateLimiter(false);
                    let formResponses = [...newFormSubmissions];

                    while (formResponses.length > 0) {
                      try {
                        const subArrays = createSubArrays(formResponses, 5);
                        for (const subArray of subArrays) {
                          await downloadAndConfirmFormSubmissions(
                            directoryHandle,
                            apiClient,
                            userKey,
                            subArray
                          );
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
                  }}
                >
                  Download and Confirm
                </Button>
                {completed ? (
                  <p className="mt-5 text-green-600">
                    {`${responsesProcessed} responses processed successfully!`}
                  </p>
                ) : (
                  <p className="mt-5">
                    {responsesProcessed > 0 ? `Processing ${responsesProcessed} responses` : null}
                  </p>
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
        ) : (
          <p>No new form submissions found.</p>
        )}
      </div>
    </div>
  );
};
