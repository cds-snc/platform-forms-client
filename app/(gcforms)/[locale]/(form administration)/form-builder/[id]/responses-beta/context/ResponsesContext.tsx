"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useRef,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { FileSystemDirectoryHandle, FileSystemFileHandle } from "native-file-system-adapter";
import { NewFormSubmission, PrivateApiKey } from "../lib/types";
import { GCFormsApiClient } from "../lib/apiClient";
import { createSubArrays, downloadAndConfirmFormSubmissions } from "../lib/utils";
import { writeSubmissionsToCsv } from "../lib/csvWriter";

interface ResponsesContextType {
  isCompatible: boolean;
  userKey: PrivateApiKey | null;
  setUserKey: Dispatch<SetStateAction<PrivateApiKey | null>>;
  apiClient: GCFormsApiClient | null;
  setApiClient: Dispatch<SetStateAction<GCFormsApiClient | null>>;
  directoryHandle: FileSystemDirectoryHandle | null;
  setDirectoryHandle: Dispatch<SetStateAction<FileSystemDirectoryHandle | null>>;
  csvFileHandle: FileSystemFileHandle | null;
  setCsvFileHandle: Dispatch<SetStateAction<FileSystemFileHandle | null>>;
  retrieveResponses: () => Promise<NewFormSubmission[]>;
  newFormSubmissions: NewFormSubmission[] | null;
  processedSubmissionIds: Set<string>;
  setProcessedSubmissionIds: Dispatch<SetStateAction<Set<string>>>;
  processResponses: (initialSubmissions?: NewFormSubmission[]) => Promise<void>;
  processingCompleted: boolean;
  setProcessingCompleted: Dispatch<SetStateAction<boolean>>;
  selectedFormats: string[];
  setSelectedFormats: Dispatch<SetStateAction<string[]>>;
  interrupt: boolean;
  setInterrupt: Dispatch<SetStateAction<boolean>>;
  resetState: () => void;
  resetNewSubmissions: () => void;
}

const ResponsesContext = createContext<ResponsesContextType | undefined>(undefined);

export const ResponsesProvider = ({ children }: { children: ReactNode }) => {
  const [isCompatible] = useState(
    () => typeof window !== "undefined" && "showOpenFilePicker" in window
  );

  const [userKey, setUserKey] = useState<PrivateApiKey | null>(null);
  const [apiClient, setApiClient] = useState<GCFormsApiClient | null>(null);
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [csvFileHandle, setCsvFileHandle] = useState<FileSystemFileHandle | null>(null);
  const [newFormSubmissions, setNewFormSubmissions] = useState<NewFormSubmission[] | null>(null);
  const [processedSubmissionIds, setProcessedSubmissionIds] = useState<Set<string>>(new Set());
  const [processingCompleted, setProcessingCompleted] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [interruptState, setInterruptState] = useState(false);
  const interruptRef = useRef(interruptState);

  const setInterrupt: Dispatch<SetStateAction<boolean>> = useCallback((value) => {
    setInterruptState((prev) => {
      const nextValue =
        typeof value === "function" ? (value as (v: boolean) => boolean)(prev) : value;
      interruptRef.current = nextValue;
      return nextValue;
    });
    setNewFormSubmissions(null);
  }, []);

  const interrupt = interruptState;

  const retrieveResponses = useCallback(async () => {
    if (!apiClient) {
      return [];
    }

    try {
      const submissions = await apiClient.getNewFormSubmissions();
      setNewFormSubmissions(submissions);
      return submissions;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error loading submissions:", error);
      setNewFormSubmissions([]);
      return [];
    }
  }, [apiClient]);

  const resetNewSubmissions = () => {
    setNewFormSubmissions([]);
  };

  const processResponses = useCallback(
    async (initialSubmissions?: NewFormSubmission[]) => {
      let formResponses = [...(initialSubmissions || newFormSubmissions || [])];

      while (formResponses.length > 0 && !interruptRef.current) {
        try {
          const subArrays = createSubArrays(formResponses, 5);
          for (const subArray of subArrays) {
            if (interruptRef.current) {
              break;
            }
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
            if (interruptRef.current) {
              break;
            }

            formResponses = await apiClient.getNewFormSubmissions();
            // formResponses = [];
          }

          if (interruptRef.current) {
            break;
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log("Error processing submissions:", error);
          // setError(error as Error);
          break;
        }
      }

      setNewFormSubmissions(null);
      setProcessingCompleted(true);
    },
    [apiClient, directoryHandle, newFormSubmissions, userKey]
  );

  const resetState = useCallback(() => {
    setUserKey(null);
    setApiClient(null);
    setDirectoryHandle(null);
    setCsvFileHandle(null);
    setNewFormSubmissions(null);
    setProcessedSubmissionIds(new Set());
    setProcessingCompleted(false);
    setSelectedFormats([]);
    setInterrupt(false);
  }, [setInterrupt]);

  return (
    <ResponsesContext.Provider
      value={{
        isCompatible,
        userKey,
        setUserKey,
        apiClient,
        setApiClient,
        directoryHandle,
        setDirectoryHandle,
        csvFileHandle,
        setCsvFileHandle,
        retrieveResponses,
        newFormSubmissions,
        processedSubmissionIds,
        setProcessedSubmissionIds,
        processResponses,
        processingCompleted,
        setProcessingCompleted,
        selectedFormats,
        setSelectedFormats,
        interrupt,
        setInterrupt,
        resetState,
        resetNewSubmissions,
      }}
    >
      {children}
    </ResponsesContext.Provider>
  );
};

export const useResponsesContext = () => {
  const context = useContext(ResponsesContext);
  if (context === undefined) {
    throw new Error("useResponses must be used within a ResponsesContextProvider");
  }
  return context;
};
