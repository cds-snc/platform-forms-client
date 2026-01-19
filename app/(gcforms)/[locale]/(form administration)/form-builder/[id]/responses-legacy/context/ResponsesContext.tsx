"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { FileSystemDirectoryHandle, FileSystemFileHandle } from "native-file-system-adapter";
import { NewFormSubmission, PrivateApiKey } from "../lib/types";
import { GCFormsApiClient } from "../lib/apiClient";
import { initCsv } from "../lib/csvWriter";
import { toast } from "../../../components/shared/Toast";
import { useTranslation } from "@root/i18n/client";
import {
  ErrorRetreivingSubmissions,
  TemplateFailed,
  FileWriteError,
  InvalidStateError as InvalidStateErrorToast,
  QuotaExceededError as QuotaExceededErrorToast,
  NotAllowedError as NotAllowedErrorToast,
} from "../components/Toasts";
import { HTML_DOWNLOAD_FOLDER } from "../lib/constants";
import { ResponseDownloadLogger } from "../lib/logger";
import { processResponse } from "../lib/processResponse";
import { importPrivateKeyDecrypt } from "../lib/utils";
import { formatDuration } from "../lib/formatDuration";

// Singleton logger instance
const responseLogger = new ResponseDownloadLogger();

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
  processedSubmissionsCount: number;
  incrementProcessedSubmissionsCount: () => void;
  resetProcessedSubmissionsCount: () => void;
  setProcessedSubmissionsCount: (count: number) => void;
  processResponses: (
    initialSubmissions?: NewFormSubmission[],
    format?: "csv" | "html"
  ) => Promise<void>;
  processingCompleted: boolean;
  resetProcessingCompleted: () => void;
  hasError: boolean;
  setHasError: Dispatch<SetStateAction<boolean>>;
  selectedFormat: string;
  setSelectedFormat: Dispatch<SetStateAction<string>>;
  interrupt: boolean;
  setInterrupt: Dispatch<SetStateAction<boolean>>;
  currentSubmissionId: string | null;
  hasMaliciousAttachments: boolean;
  setHasMaliciousAttachments: Dispatch<SetStateAction<boolean>>;
  setCurrentSubmissionId: Dispatch<SetStateAction<string | null>>;
  resetState: () => void;
  resetNewSubmissions: () => void;
  logger: ResponseDownloadLogger;
}

const ResponsesContext = createContext<ResponsesContextType | undefined>(undefined);

const CsvDetected = () => {
  const { t } = useTranslation("response-legacy");
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
  const [processingCompleted, setProcessingCompleted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string>("");
  const [currentSubmissionId, setCurrentSubmissionId] = useState<string | null>(null);
  const [hasMaliciousAttachments, setHasMaliciousAttachments] = useState<boolean>(false);
  const [processedSubmissionsCount, setProcessedSubmissionsCountState] = useState<number>(0);
  const processedSubmissionsCountRef = useRef<number>(0);

  const [isProcessingInterrupted, setIsProcessingInterrupted] = useState(false);
  const interruptRef = useRef<boolean>(false);

  const { t } = useTranslation("my-forms");

  const setInterrupt: Dispatch<SetStateAction<boolean>> = useCallback(
    (value) => {
      const nextValue =
        typeof value === "function"
          ? (value as (v: boolean) => boolean)(isProcessingInterrupted)
          : value;

      setIsProcessingInterrupted(nextValue);

      // Sync ref with state value
      interruptRef.current = nextValue;
    },
    [isProcessingInterrupted]
  );

  const incrementProcessedSubmissionsCount = useCallback(() => {
    setProcessedSubmissionsCountState((prev) => prev + 1);
    processedSubmissionsCountRef.current += 1;
  }, []);

  const resetProcessedSubmissionsCount = useCallback(() => {
    setProcessedSubmissionsCountState(0);
    processedSubmissionsCountRef.current = 0;
  }, []);

  const setProcessedSubmissionsCount = useCallback((count: number) => {
    setProcessedSubmissionsCountState(count);
    processedSubmissionsCountRef.current = count;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Abort any in-flight requests on unmount
      if (interruptRef.current) {
        interruptRef.current = false;
      }
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (_event: BeforeUnloadEvent) => {
      if (!processingCompleted) {
        responseLogger.warn("Window unloading, interrupting processing if active.");
        setInterrupt(true);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [processingCompleted, setInterrupt]);

  const retrieveResponses = useCallback(async () => {
    if (!apiClient) {
      return [];
    }

    responseLogger.info("Retrieving new form submissions");

    try {
      const submissions = await apiClient.getNewFormSubmissions();
      setNewFormSubmissions(submissions);

      responseLogger.info(`Queued ${submissions.length} new form submissions for processing`);

      return submissions;
    } catch (error) {
      responseLogger.error("Error loading submissions:", error);
      setNewFormSubmissions([]);
      toast.error(<ErrorRetreivingSubmissions />, "wide");
      return [];
    }
  }, [apiClient]);

  const resetNewSubmissions = useCallback(() => {
    setNewFormSubmissions([]);
  }, []);

  const resetProcessingCompleted = useCallback(() => {
    setProcessingCompleted(false);
  }, []);

  const processResponses = useCallback(
    async (initialSubmissions?: NewFormSubmission[]) => {
      responseLogger.info("Beginning processing of form responses");

      // Timer start
      const startTime = Date.now();
      let sessionCompleted = false;

      // Reset interrupt state
      setInterrupt(false);
      setHasError(false);

      let formId;
      let formTemplate;
      let csvFileHandle: FileSystemFileHandle | null = null;
      let htmlDirectoryHandle: FileSystemDirectoryHandle | null = null;
      let formResponses = [...(initialSubmissions || newFormSubmissions || [])];

      if (!directoryHandle || !privateApiKey || !apiClient) {
        responseLogger.error("Missing required context values, aborting processing");
        return;
      }

      try {
        formTemplate = await apiClient.getFormTemplate();
        formId = apiClient.getFormId();
      } catch (error) {
        responseLogger.error("Error loading form template: ", error);
        toast.error(<TemplateFailed />, "wide");
        return;
      }

      /**
       * Initialize CSV if needed
       */
      if (selectedFormat === "csv") {
        const result = await initCsv({ formId, dirHandle: directoryHandle, formTemplate });
        responseLogger.info("Initialized CSV file: ", result.handle?.name);

        csvFileHandle = result && result.handle;
        const csvExists = result && !result.created;

        if (csvExists) {
          // Use defeault toast --- which will auto dismiss
          toast.success(<CsvDetected />);
        }
      }

      /**
       * Prepare HTML directory if needed
       */
      if (selectedFormat === "html") {
        htmlDirectoryHandle = await directoryHandle.getDirectoryHandle(HTML_DOWNLOAD_FOLDER, {
          create: true,
        });
        responseLogger.info("Initialized HTML directory: ", htmlDirectoryHandle.name);
      }

      // Import decryption key once
      const decryptionKey = await importPrivateKeyDecrypt(privateApiKey.key);

      while (formResponses.length > 0 && !interruptRef.current) {
        responseLogger.info(`Processing next ${formResponses.length} submissions`);
        for (const response of formResponses) {
          if (interruptRef.current) {
            responseLogger.warn("Processing interrupted");
            break;
          }

          setCurrentSubmissionId(response.name);

          try {
            // eslint-disable-next-line no-await-in-loop
            await processResponse({
              incrementProcessedSubmissionsCount,
              setHasMaliciousAttachments,
              workingDirectoryHandle: directoryHandle,
              htmlDirectoryHandle,
              csvFileHandle,
              apiClient,
              decryptionKey,
              responseName: response.name,
              selectedFormat,
              formId: String(formId),
              formTemplate: formTemplate!,
              t,
              logger: responseLogger,
            });
          } catch (error) {
            setInterrupt(true);
            setHasError(true);

            // Check if this is a file write error from CSV writer by examining the cause
            const errorCause = error instanceof Error ? error.cause : null;

            responseLogger.error(`Error processing submission ID ${response.name}:`, error);

            if (errorCause instanceof DOMException) {
              if (errorCause.name === "NoModificationAllowedError") {
                toast.error(<FileWriteError />, "error-persistent");
              } else if (errorCause.name === "InvalidStateError") {
                toast.error(<InvalidStateErrorToast />, "error-persistent");
              } else if (errorCause.name === "QuotaExceededError") {
                toast.error(<QuotaExceededErrorToast />, "error-persistent");
              } else if (errorCause.name === "NotAllowedError") {
                // User has revoked permission - show generic error
                toast.error(<NotAllowedErrorToast />, "error-persistent");
              } else {
                toast.error(<ErrorRetreivingSubmissions />, "error-persistent");
              }
            } else {
              toast.error(<ErrorRetreivingSubmissions />, "error-persistent");
            }
          }
        }

        if (interruptRef.current) {
          break;
        }

        // Get subsequent submissions
        // eslint-disable-next-line no-await-in-loop
        formResponses = await retrieveResponses();
      }

      // Timer end
      const endTime = Date.now();

      const durationMs = endTime - startTime;
      const durationStr = formatDuration(durationMs);

      // Determine completion status
      sessionCompleted = !interruptRef.current;

      if (sessionCompleted) {
        responseLogger.info(`Processing session completed in ${durationStr}.`);
      } else {
        responseLogger.warn(`Processing session interrupted after ${durationStr}.`);
      }

      responseLogger.info(`Processed ${processedSubmissionsCountRef.current} submissions.`);

      // Cleanup
      interruptRef.current = false;
      setNewFormSubmissions(null);
      setCurrentSubmissionId(null);
      setProcessingCompleted(true);
    },
    [
      apiClient,
      directoryHandle,
      incrementProcessedSubmissionsCount,
      newFormSubmissions,
      privateApiKey,
      retrieveResponses,
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
    resetProcessingCompleted();
    resetProcessedSubmissionsCount();
    setHasMaliciousAttachments(false);
    setSelectedFormat("csv");
    setHasError(false);
    setInterrupt(false);
    interruptRef.current = false;
  }, [resetProcessedSubmissionsCount, resetProcessingCompleted, setInterrupt]);

  const contextValue = useMemo(
    () => ({
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
      processedSubmissionsCount,
      incrementProcessedSubmissionsCount,
      resetProcessedSubmissionsCount,
      setProcessedSubmissionsCount,
      processResponses,
      processingCompleted,
      resetProcessingCompleted,
      hasError,
      setHasError,
      selectedFormat,
      setSelectedFormat,
      interrupt: isProcessingInterrupted,
      setInterrupt,
      currentSubmissionId,
      hasMaliciousAttachments,
      setHasMaliciousAttachments,
      setCurrentSubmissionId,
      resetState,
      resetNewSubmissions,
      logger: responseLogger,
    }),
    [
      locale,
      formId,
      isCompatible,
      privateApiKey,
      apiClient,
      directoryHandle,
      retrieveResponses,
      newFormSubmissions,
      processedSubmissionsCount,
      incrementProcessedSubmissionsCount,
      resetProcessedSubmissionsCount,
      setProcessedSubmissionsCount,
      processResponses,
      processingCompleted,
      resetProcessingCompleted,
      hasError,
      selectedFormat,
      setSelectedFormat,
      isProcessingInterrupted,
      setInterrupt,
      currentSubmissionId,
      hasMaliciousAttachments,
      setCurrentSubmissionId,
      resetState,
      resetNewSubmissions,
    ]
  );

  return <ResponsesContext.Provider value={contextValue}>{children}</ResponsesContext.Provider>;
};

export const useResponsesContext = () => {
  const context = useContext(ResponsesContext);
  if (context === undefined) {
    throw new Error("useResponses must be used within a ResponsesContextProvider");
  }
  return context;
};
