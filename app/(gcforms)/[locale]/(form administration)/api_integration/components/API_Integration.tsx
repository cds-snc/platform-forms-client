/* eslint-disable no-await-in-loop */
"use client";
import { useState, useEffect } from "react";
import { Button } from "@clientComponents/globals";
import {
  showOpenFilePicker,
  showDirectoryPicker,
  FileSystemDirectoryHandle,
} from "native-file-system-adapter";
import type { NewFormSubmission, PrivateApiKey } from "../lib/types";
import {
  downloadAndConfirmFormSubmissions,
  getAccessTokenFromApiKey,
  GCFormsApiClient,
  TokenRateLimitError,
} from "../lib/apiUtils";

function createSubArrays<T>(arr: T[], size: number) {
  const subArrays = [];
  for (let i = 0; i < arr.length; i += size) {
    subArrays.push(arr.slice(i, i + size));
  }
  return subArrays;
}

export const APIIntegration = () => {
  const [isCompatible, setIsCompatible] = useState(false);
  const [userKey, setUserKey] = useState<PrivateApiKey | null>(null);
  const [newFormSubmissions, setNewFormSubmissions] = useState<NewFormSubmission[]>([]);
  const [apiClient, setApiClient] = useState<GCFormsApiClient | null>(null);
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [responsesProcessed, setResponsesProcessed] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [tokenRate, setTokenRate] = useState<boolean>(false);

  useEffect(() => {
    // Check if the File System Access API is supported
    setIsCompatible("showOpenFilePicker" in window);
  }, []);

  useEffect(() => {
    if (userKey) {
      getAccessTokenFromApiKey(userKey).then((token) => {
        if (token) {
          setApiClient(
            new GCFormsApiClient(userKey.formId, process.env.NEXT_PUBLIC_API_URL ?? "", token)
          );
        } else {
          alert("Failed to import private key.");
        }
      });
    }
  }, [userKey]);

  useEffect(() => {
    if (apiClient) {
      apiClient.getNewFormSubmissions().then((submissions) => {
        setNewFormSubmissions(submissions);
      });
    }
  }, [apiClient]);

  if (!isCompatible) {
    return (
      <div className="flex size-full flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">API Integration</h1>
        <div className="m-10">
          This browser does not support the File System Access API. Please use a compatible browser.
        </div>
      </div>
    );
  }

  return (
    <div className="flex size-full flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">API Integration</h1>
      <div className="m-4">
        <p>{`Form Id from Key: ${userKey?.formId} `}</p>
        <p>{`Access Token: ${apiClient ? "Created" : "null"}`}</p>
      </div>
      {!userKey ? (
        <Button
          onClick={async () => {
            // Simulate user key retrieval

            const [fileHandle] = await showOpenFilePicker({
              multiple: false, // default
              excludeAcceptAllOption: false, // default
              _preferPolyfill: false, // default
            });
            const keyFile = await fileHandle.getFile().then(async (file) => {
              const text = await file.text();
              return JSON.parse(text);
            });
            setUserKey(keyFile);
          }}
        >
          Load API Key
        </Button>
      ) : (
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
                            setTokenRate(true);
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
                  {tokenRate ? (
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
      )}
    </div>
  );
};
