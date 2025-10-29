"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { NewFormSubmission, PrivateApiKey } from "../lib/types";
import { GCFormsApiClient } from "../lib/apiClient";
import { showOpenFilePicker } from "native-file-system-adapter";
import {
  createSubArrays,
  downloadAndConfirmFormSubmissions,
  getAccessTokenFromApiKey,
} from "../lib/utils";
import { writeSubmissionsToCsv } from "../lib/csvWriter";

export const PageKeys = {
  START: "start",
  SELECT_API_KEY: "selectApiKey",
  SELECT_LOCATION: "selectLocation",
  SELECT_FORMAT: "selectFormat",
  PROCESSING_DOWNLOADS: "processingDownloads",
  GENERATE_FORMAT_FROM_JSON: "generateFormatFromJson",
} as const;

export type PageKey = (typeof PageKeys)[keyof typeof PageKeys];

interface ApiResponseDownloaderContextType {
  currentPage: PageKey;
  setCurrentPage: (page: PageKey) => void;
  onNext: () => void;
  onCancel: () => void;
  isCompatible: boolean;
  handleLoadApiKey: () => Promise<boolean>;
  userKey: PrivateApiKey | null;
  apiClient: GCFormsApiClient | null;
  directoryHandle: FileSystemDirectoryHandle | null;
  setDirectoryHandle: (handle: FileSystemDirectoryHandle | null) => void;
  selectedFormat: string | null;
  setSelectedFormat: (format: string | null) => void;
  csvFileHandle: FileSystemFileHandle | null;
  setCsvFileHandle: (handle: FileSystemFileHandle | null) => void;
  retrieveResponses: () => Promise<void>;
  newFormSubmissions: NewFormSubmission[] | null;
  processedSubmissionIds: Set<string>;
  processingCompleted: boolean;
}

const ApiResponseDownloaderContext = createContext<ApiResponseDownloaderContextType | undefined>(
  undefined
);

export const ApiResponseDownloadProvider = ({ children }: { children: ReactNode }) => {
  const [currentPage, setCurrentPage] = useState<PageKey>(PageKeys.START);
  const [isCompatible] = useState(
    () => typeof window !== "undefined" && "showOpenFilePicker" in window
  );

  const [userKey, setUserKey] = useState<PrivateApiKey | null>(null);
  const [apiClient, setApiClient] = useState<GCFormsApiClient | null>(null);
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [csvFileHandle, setCsvFileHandle] = useState<FileSystemFileHandle | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [newFormSubmissions, setNewFormSubmissions] = useState<NewFormSubmission[] | null>(null);
  const [processedSubmissionIds, setProcessedSubmissionIds] = useState<Set<string>>(new Set());
  const [processingCompleted, setProcessingCompleted] = useState(false);

  const handleLoadApiKey = useCallback(async () => {
    try {
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

      const token = await getAccessTokenFromApiKey(keyFile);

      if (!token) {
        return false;
      }

      setApiClient(
        new GCFormsApiClient(keyFile.formId, process.env.NEXT_PUBLIC_API_URL ?? "", token)
      );

      setUserKey(keyFile);

      return true;
    } catch (error) {
      // no-op
      return false;
    }
  }, []);

  const retrieveResponses = useCallback(async () => {
    const downloadFormats = async (initialSubmissions?: NewFormSubmission[]) => {
      let formResponses = [...(initialSubmissions || newFormSubmissions || [])];

      while (formResponses.length > 0) {
        try {
          const subArrays = createSubArrays(formResponses, 5);
          for (const subArray of subArrays) {
            if (!directoryHandle || !userKey || !apiClient) {
              // Optionally handle the error or prompt the user
              break;
            }

            /* eslint-disable no-await-in-loop */
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

            // Get subsequent submissions
            // formResponses = await apiClient.getNewFormSubmissions();
            formResponses = [];
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log("Error processing submissions:", error);
          // setError(error as Error);
          break;
        }
      }

      setProcessingCompleted(true);
    };

    setProcessingCompleted(false);

    if (apiClient) {
      apiClient
        .getNewFormSubmissions()
        .then((submissions) => {
          // Set the submissions in state first
          setNewFormSubmissions(submissions);

          if (submissions.length > 0) {
            // We need to pass submissions directly since state hasn't updated yet
            downloadFormats(submissions);
          }
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error("Error loading submissions:", error);
          // Set empty array on error to stop loading state
          setNewFormSubmissions([]);
        });
    }
  }, [apiClient, directoryHandle, newFormSubmissions, userKey]);

  const onCancel = () => {
    setCurrentPage(PageKeys.START);
    // @TODO: handle restetting state
  };

  const onNext = () => {
    setCurrentPage((prevPage) => {
      switch (prevPage) {
        case PageKeys.START:
          return PageKeys.SELECT_API_KEY;
        case PageKeys.SELECT_API_KEY:
          return PageKeys.SELECT_LOCATION;
        case PageKeys.SELECT_LOCATION:
          return PageKeys.SELECT_FORMAT;
        case PageKeys.SELECT_FORMAT:
          return PageKeys.PROCESSING_DOWNLOADS;
        case PageKeys.PROCESSING_DOWNLOADS:
          return PageKeys.START;
        default:
          return PageKeys.START;
      }
    });
  };

  return (
    <ApiResponseDownloaderContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        onNext,
        onCancel,
        isCompatible,
        handleLoadApiKey,
        userKey,
        apiClient,
        directoryHandle,
        setDirectoryHandle,
        selectedFormat,
        setSelectedFormat,
        csvFileHandle,
        setCsvFileHandle,
        retrieveResponses,
        newFormSubmissions,
        processedSubmissionIds,
        processingCompleted,
      }}
    >
      {children}
    </ApiResponseDownloaderContext.Provider>
  );
};

export const useStepFlow = () => {
  const context = useContext(ApiResponseDownloaderContext);
  if (context === undefined) {
    throw new Error("useStepFlow must be used within a StepFlowProvider");
  }
  return context;
};
