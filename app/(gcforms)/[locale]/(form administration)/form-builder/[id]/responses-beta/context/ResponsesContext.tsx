"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useRef,
  useEffect,
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
import { TemplateFailed, UnknownError } from "../components/Toasts";
import { BATCH_SIZE, HTML_DOWNLOAD_FOLDER } from "../lib/constants";
import { ResponseDownloadLogger } from "../lib/logger";

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
  logger: ResponseDownloadLogger;
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
  const [isProcessingInterrupted, setIsProcessingInterrupted] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const loggerRef = useRef(new ResponseDownloadLogger());
  const logger = loggerRef.current;

  const { t } = useTranslation("my-forms");

  const setInterrupt: Dispatch<SetStateAction<boolean>> = useCallback(
    (value) => {
      const nextValue =
        typeof value === "function"
          ? (value as (v: boolean) => boolean)(isProcessingInterrupted)
          : value;

      setIsProcessingInterrupted(nextValue);

      // Trigger abort when interrupt is set to true
      if (nextValue && abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    },
    [isProcessingInterrupted]
  );

  const interrupt = isProcessingInterrupted;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Abort any in-flight requests on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  const retrieveResponses = useCallback(async () => {
    if (!apiClient) {
      return [];
    }

    logger.info("Retrieving new form submissions");

    try {
      const submissions = await apiClient.getNewFormSubmissions();
      setNewFormSubmissions(submissions);

      logger.info(`Retrieved ${submissions.length} new form submissions`);

      return submissions;
    } catch (error) {
      logger.error("Error loading submissions:", error);
      setNewFormSubmissions([]);
      return [];
    }
  }, [apiClient, logger]);

  const resetNewSubmissions = () => {
    logger.info("Resetting new form submissions");
    setNewFormSubmissions([]);
  };

  const processResponses = useCallback(
    async (initialSubmissions?: NewFormSubmission[]) => {
      logger.info("Beginning processing of form submissions");

      // Create new abort controller for this processing run
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Reset interrupt state
      setInterrupt(false);

      let formResponses = [...(initialSubmissions || newFormSubmissions || [])];
      let formTemplate;
      let csvFileHandle: FileSystemFileHandle | null = null;

      if (!directoryHandle || !privateApiKey || !apiClient) {
        // Optionally handle the error or prompt the user
        abortControllerRef.current = null;
        return;
      }

      let htmlDirectoryHandle: FileSystemDirectoryHandle | null = null;

      try {
        formTemplate = await apiClient?.getFormTemplate();
      } catch (error) {
        logger.error("Error loading form template:", error);
        toast.error(<TemplateFailed />, "wide");
        return;
      }

      const formId = apiClient.getFormId();

      /**
       * Initialize CSV if needed
       */
      if (selectedFormat === "csv") {
        const result = await initCsv({ formId, dirHandle: directoryHandle, formTemplate });
        logger.info("Initialized CSV:", result);

        csvFileHandle = result && result.handle;

        const csvExists = result && !result.created;

        if (csvExists) {
          toast.success(<CsvDetected />, "wide");
        }
      }

      /**
       * Prepare HTML directory if needed
       */
      if (selectedFormat === "html") {
        htmlDirectoryHandle = await directoryHandle.getDirectoryHandle(HTML_DOWNLOAD_FOLDER, {
          create: true,
        });
        logger.info("Initialized HTML directory:", htmlDirectoryHandle);
      }

      while (formResponses.length > 0 && !abortController.signal.aborted) {
        try {
          const subArrays = createSubArrays(formResponses, BATCH_SIZE);
          logger.info(`Processing ${subArrays.length} batches of ${BATCH_SIZE} submissions`);

          for (const subArray of subArrays) {
            // Check abort signal
            if (abortController.signal.aborted) {
              logger.info("Processing interrupted by user");
              break;
            }

            /* eslint-disable no-await-in-loop */
            const { submissionData } = await downloadAndConfirmFormSubmissions({
              directoryHandle,
              apiClient,
              privateApiKey,
              submissions: subArray,
              signal: abortController.signal,
            });

            if (!submissionData) {
              logger.warn("No submission data returned for current batch, skipping...");
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

            // Log after state update
            const processedIds = submissionData.map((s) => s.submissionId);
            logger.info("Processed submission IDs:", processedIds);

            // Get subsequent submissions
            if (abortController.signal.aborted) {
              logger.info("Processing interrupted after batch completion");
              break;
            }

            formResponses = await apiClient.getNewFormSubmissions(abortController.signal);
          }

          if (abortController.signal.aborted) {
            logger.info("Processing interrupted, exiting batch loop");
            break;
          }
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            logger.warn("Processing aborted");
          } else {
            logger.error("Error processing submissions:", error);
          }
          toast.error(<UnknownError />, "wide");
          break;
        }
      }

      // Cleanup
      abortControllerRef.current = null;

      setNewFormSubmissions(null);
      setProcessingCompleted(true);
    },
    [
      apiClient,
      directoryHandle,
      logger,
      newFormSubmissions,
      privateApiKey,
      selectedFormat,
      setInterrupt,
      t,
    ]
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
        logger: loggerRef.current,
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
