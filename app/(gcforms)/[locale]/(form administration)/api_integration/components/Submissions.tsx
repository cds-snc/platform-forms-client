/* eslint-disable no-await-in-loop */
import { useCallback } from "react";

import { useState, useEffect } from "react";
import { type IGCFormsApiClient } from "../lib/IGCFormsApiClient";

import { createSubArrays, downloadAndConfirmFormSubmissions } from "../lib/utils";
import { Button } from "@clientComponents/globals";

// Use the type returned by showDirectoryPicker
import { FileSystemDirectoryHandle } from "native-file-system-adapter";

import type { NewFormSubmission, PrivateApiKey } from "../lib/types";

import { ResponsesAvailable } from "./ResponsesAvailable";
import { ContentWrapper } from "./ContentWrapper";
import { ProcessingMessage } from "./ProcessingMessage";
import { NoSubmissions } from "./NoSubmissions";
import { DirectoryPicker } from "./DirectoryPicker";
import { processJsonToCsv } from "../lib/jsonToCsv";

export const Submissions = ({
  apiClient,
  userKey,
}: {
  apiClient: IGCFormsApiClient | null;
  userKey: PrivateApiKey | null;
}) => {
  const [newFormSubmissions, setNewFormSubmissions] = useState<NewFormSubmission[] | null>(null);
  const [directoryHandle, setDirectoryHandle] = useState<unknown>(null);
  const [responsesProcessed, setResponsesProcessed] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const isLoading = Boolean(apiClient) && newFormSubmissions === null;

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
    setError(null);
    let formResponses = [...(newFormSubmissions ?? [])];
    const allJsonFiles: string[] = [];

    while (formResponses.length > 0) {
      try {
        const subArrays = createSubArrays(formResponses, 5);
        for (const subArray of subArrays) {
          if (!directoryHandle || !userKey || !apiClient) {
            // Optionally handle the error or prompt the user
            break;
          }
          const jsonFileNames = await downloadAndConfirmFormSubmissions(
            directoryHandle as FileSystemDirectoryHandle,
            apiClient,
            userKey,
            subArray
          );

          // Collect all JSON file names
          allJsonFiles.push(...jsonFileNames);
          setResponsesProcessed((prev) => prev + subArray.length);

          formResponses = await apiClient.getNewFormSubmissions();
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error processing submissions:", error);
        setError(error as Error);
        break;
      }
    }

    // Write the collected JSON files to a CSV

    await processJsonToCsv({
      formId: apiClient?.getFormId() || "<formId>",
      jsonFileNames: allJsonFiles,
      directoryHandle: directoryHandle,
      apiClient: apiClient,
    });

    setCompleted(true);
  }, [apiClient, directoryHandle, newFormSubmissions, userKey]);

  const hasResponses =
    !completed && responsesProcessed < 1 && newFormSubmissions
      ? `At least ${newFormSubmissions.length} New Responses ready for download`
      : null;

  const showDownloadButton = directoryHandle && !completed && responsesProcessed < 1;

  if (!userKey || !apiClient) {
    return null;
  }

  return (
    <ContentWrapper>
      <div>
        {newFormSubmissions && newFormSubmissions.length > 0 ? (
          <>
            <ResponsesAvailable message={hasResponses} />

            {showDownloadButton && (
              <Button onClick={handleProcessSubmissions}>Download and Confirm</Button>
            )}

            <DirectoryPicker
              directoryHandle={directoryHandle}
              onPick={(handle) => {
                setDirectoryHandle(handle);
              }}
            />

            <ProcessingMessage
              error={error}
              completed={completed}
              responsesProcessed={responsesProcessed}
            />
          </>
        ) : (
          <NoSubmissions isLoading={isLoading} />
        )}
      </div>
    </ContentWrapper>
  );
};
