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
import { convertJsonToCSV } from "../lib/jsonToCsv";

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

  const processToCsv = useCallback(
    async (jsonFileNames: string[]) => {
      if (!directoryHandle || jsonFileNames.length === 0) return;

      try {
        // Read all JSON files and parse them
        const allData: Record<string, unknown>[] = [];

        for (const fileName of jsonFileNames) {
          try {
            const fileHandle = await (directoryHandle as FileSystemDirectoryHandle).getFileHandle(
              fileName
            );
            const file = await fileHandle.getFile();
            const content = await file.text();

            const jsonData = JSON.parse(content);
            // Handle both single objects and arrays
            if (Array.isArray(jsonData)) {
              allData.push(...jsonData);
            } else {
              allData.push(jsonData);
            }
          } catch (parseError) {
            // eslint-disable-next-line no-console
            console.error(`Failed to parse ${fileName}:`, parseError);
          }
        }

        if (allData.length === 0) {
          // eslint-disable-next-line no-console
          console.warn("No valid JSON data found to convert to CSV");
          return;
        }

        // Convert to CSV
        const csvContent = convertJsonToCSV(allData);

        // Write CSV file back to directory
        const csvFileName = `combined-output-${Date.now()}.csv`;
        const csvFileHandle = await (directoryHandle as FileSystemDirectoryHandle).getFileHandle(
          csvFileName,
          { create: true }
        );
        const writable = await csvFileHandle.createWritable();
        await writable.write(csvContent);
        await writable.close();

        // eslint-disable-next-line no-console
        console.log(`CSV file created: ${csvFileName}`);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error processing JSON to CSV:", error);
      }
    },
    [directoryHandle]
  );

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
        setError(error as Error);
        break;
      }
    }
    setCompleted(true);

    // Process all JSON files to CSV after completion
    if (allJsonFiles.length > 0) {
      await processToCsv(allJsonFiles);
    }
  }, [apiClient, directoryHandle, newFormSubmissions, userKey, processToCsv]);

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
