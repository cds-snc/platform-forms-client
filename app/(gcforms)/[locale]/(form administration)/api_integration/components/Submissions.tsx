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
import { initCsv, writeSubmissionsToCsv } from "../lib/csvWriter";

export const Submissions = ({
  apiClient,
  userKey,
}: {
  apiClient: IGCFormsApiClient | null;
  userKey: PrivateApiKey | null;
}) => {
  const [newFormSubmissions, setNewFormSubmissions] = useState<NewFormSubmission[] | null>(null);
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  // Track processed submission ids to keep an accurate count across retries/partial runs
  const [processedSubmissionIds, setProcessedSubmissionIds] = useState<Set<string>>(new Set());
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

  const setDirectory = useCallback(
    async (handle: FileSystemDirectoryHandle | null) => {
      if (!handle) {
        return;
      }

      setDirectoryHandle(handle);

      const formId = apiClient?.getFormId();
      const formTemplate = await apiClient?.getFormTemplate();

      // Initialize CSV file as needed in the selected directory
      await initCsv({ formId, dirHandle: handle as FileSystemDirectoryHandle, formTemplate });
    },
    [apiClient]
  );

  const handleProcessSubmissions = useCallback(async () => {
    setError(null);
    setCompleted(false);

    let formResponses = [...(newFormSubmissions ?? [])];

    while (formResponses.length > 0) {
      try {
        const subArrays = createSubArrays(formResponses, 5);
        for (const subArray of subArrays) {
          if (!directoryHandle || !userKey || !apiClient) {
            // Optionally handle the error or prompt the user
            break;
          }

          const { submissionData } = await downloadAndConfirmFormSubmissions(
            directoryHandle as FileSystemDirectoryHandle,
            apiClient,
            userKey,
            subArray
          );

          // Write each submission to CSV
          const formId = apiClient.getFormId();
          const formTemplate = await apiClient.getFormTemplate();

          if (formId && formTemplate && submissionData) {
            await writeSubmissionsToCsv({
              formId,
              dirHandle: directoryHandle as FileSystemDirectoryHandle,
              formTemplate,
              submissionData,
            });

            // Record individual submission ids so we have an accurate count
            setProcessedSubmissionIds((prev) => {
              const next = new Set(prev);
              for (const s of submissionData) {
                next.add(s.submissionId);
              }
              return next;
            });
          }

          formResponses = await apiClient.getNewFormSubmissions();
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log("Error processing submissions:", error);
        setError(error as Error);
        break;
      }
    }

    setCompleted(true);
  }, [apiClient, directoryHandle, newFormSubmissions, userKey]);

  const processedCount = processedSubmissionIds.size;

  const hasResponses =
    !completed && processedCount < 1 && newFormSubmissions
      ? `At least ${newFormSubmissions.length} New Responses ready for download`
      : null;

  const showDownloadButton = directoryHandle && !completed && processedCount < 1;

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

            <DirectoryPicker directoryHandle={directoryHandle} onPick={setDirectory} />

            <ProcessingMessage
              error={error}
              completed={completed}
              responsesProcessed={processedCount}
              retryButton={
                <Button className="mt-2" theme="secondary" onClick={handleProcessSubmissions}>
                  Retry
                </Button>
              }
            />
          </>
        ) : (
          <NoSubmissions isLoading={isLoading} />
        )}
      </div>
    </ContentWrapper>
  );
};
