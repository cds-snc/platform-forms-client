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
import { initCsv, writeRow } from "../lib/csvWriter";
import { toast } from "../../../components/shared/Toast";
import { useTranslation } from "@root/i18n/client";
import { writeHtml } from "../lib/htmlWriter";
import { TemplateFailed } from "../components/Toasts";

interface ResponsesContextType {
  locale: string;
  formId: string;
  isCompatible: boolean;
  privateApiKey: PrivateApiKey | null;
  setPrivateApiKey: Dispatch<SetStateAction<PrivateApiKey | null>>;
  apiClient: GCFormsApiClient | null;
  setApiClient: Dispatch<SetStateAction<GCFormsApiClient | null>>;
  directoryHandle: FileSystemDirectoryHandle | null;
  setDirectoryHandle: Dispatch<SetStateAction<FileSystemDirectoryHandle | null>>;
  retrieveResponses: () => Promise<NewFormSubmission[]>;
  newFormSubmissions: NewFormSubmission[] | null;
  processedSubmissionIds: Set<string>;
  setProcessedSubmissionIds: Dispatch<SetStateAction<Set<string>>>;
  processResponses: (
    initialSubmissions?: NewFormSubmission[],
    format?: "csv" | "html"
  ) => Promise<void>;
  processingCompleted: boolean;
  setProcessingCompleted: Dispatch<SetStateAction<boolean>>;
  selectedFormat: string;
  setSelectedFormat: Dispatch<SetStateAction<string>>;
  interrupt: boolean;
  setInterrupt: Dispatch<SetStateAction<boolean>>;
  resetState: () => void;
  resetNewSubmissions: () => void;
}

const ResponsesContext = createContext<ResponsesContextType | undefined>(undefined);

const CsvDetected = () => {
  const { t } = useTranslation("response-api");
  return (
    <div className="w-full">
      <h3 className="!mb-0 pb-0 text-xl font-semibold">{t("locationPage.csvDetected.title")}</h3>
      <p className="mb-2 text-black">{t("locationPage.csvDetected.message")}</p>
    </div>
  );
};

export const ResponsesProvider = ({
  locale,
  formId,
  children,
}: {
  locale: string;
  formId: string;
  children: ReactNode;
}) => {
  const [isCompatible] = useState(
    () => typeof window !== "undefined" && "showOpenFilePicker" in window
  );
  const [privateApiKey, setPrivateApiKey] = useState<PrivateApiKey | null>(null);
  const [apiClient, setApiClient] = useState<GCFormsApiClient | null>(null);
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [newFormSubmissions, setNewFormSubmissions] = useState<NewFormSubmission[] | null>(null);
  const [processedSubmissionIds, setProcessedSubmissionIds] = useState<Set<string>>(new Set());
  const [processingCompleted, setProcessingCompleted] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string>("csv");
  const [interruptState, setInterruptState] = useState(false);
  const interruptRef = useRef(interruptState);

  const { t } = useTranslation("my-forms");

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
      let formTemplate;
      let csvFileHandle: FileSystemFileHandle | null = null;

      if (!directoryHandle || !privateApiKey || !apiClient) {
        // Optionally handle the error or prompt the user
        return;
      }

      let htmlDirectoryHandle: FileSystemDirectoryHandle | null = null;

      const dataDirectoryHandle: FileSystemDirectoryHandle =
        await directoryHandle.getDirectoryHandle("data", { create: true });

      try {
        formTemplate = await apiClient?.getFormTemplate();
      } catch (error) {
        toast.error(<TemplateFailed />, "wide");
        return;
      }

      const formId = apiClient.getFormId();

      /**
       * Initialize CSV if needed
       */
      if (selectedFormat === "csv") {
        const result = await initCsv({ formId, dirHandle: directoryHandle, formTemplate });

        csvFileHandle = result && result.handle;

        const csvExists = result && !result.created;

        if (csvExists) {
          toast.success(<CsvDetected />, "wide");
        }
      }

      if (selectedFormat === "html") {
        htmlDirectoryHandle = await directoryHandle.getDirectoryHandle("html", { create: true });
      }

      while (formResponses.length > 0 && !interruptRef.current) {
        try {
          const subArrays = createSubArrays(formResponses, 5);
          for (const subArray of subArrays) {
            if (interruptRef.current) {
              break;
            }

            /* eslint-disable no-await-in-loop */
            const { submissionData } = await downloadAndConfirmFormSubmissions(
              dataDirectoryHandle,
              apiClient,
              privateApiKey,
              subArray
            );

            if (!submissionData) {
              // @TODO: Some kind of error handling?
              continue;
            }

            for (const submission of submissionData) {
              // switch based on selected format
              switch (selectedFormat) {
                case "html":
                  if (!htmlDirectoryHandle) {
                    throw new Error("HTML directory handle is null"); // @TODO: catch?
                  }

                  await writeHtml({
                    htmlDirectoryHandle,
                    formTemplate,
                    submission,
                    formId,
                    t,
                  });
                  break;
                default:
                  if (!csvFileHandle) {
                    throw new Error("CSV file handle is null"); // @TODO: catch?
                  }

                  await writeRow({
                    submissionId: submission.submissionId,
                    createdAt: submission.createdAt,
                    formTemplate,
                    csvFileHandle,
                    rawAnswers: submission.rawAnswers,
                  });
                  break;
              }
            }

            // Record individual submission ids so we have an accurate count
            setProcessedSubmissionIds((prev) => {
              const next = new Set(prev);
              for (const s of submissionData) {
                next.add(s.submissionId);
              }
              return next;
            });

            // Get subsequent submissions
            if (interruptRef.current) {
              break;
            }

            formResponses = await apiClient.getNewFormSubmissions();
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
    [apiClient, directoryHandle, newFormSubmissions, privateApiKey, selectedFormat, t]
  );

  const resetState = useCallback(() => {
    setPrivateApiKey(null);
    setApiClient(null);
    setDirectoryHandle(null);
    setNewFormSubmissions(null);
    setProcessedSubmissionIds(new Set());
    setProcessingCompleted(false);
    setSelectedFormat("csv");
    setInterrupt(false);
  }, [setInterrupt]);

  return (
    <ResponsesContext.Provider
      value={{
        locale,
        formId,
        isCompatible,
        privateApiKey,
        setPrivateApiKey,
        apiClient,
        setApiClient,
        directoryHandle,
        setDirectoryHandle,
        retrieveResponses,
        newFormSubmissions,
        processedSubmissionIds,
        setProcessedSubmissionIds,
        processResponses,
        processingCompleted,
        setProcessingCompleted,
        selectedFormat,
        setSelectedFormat,
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
