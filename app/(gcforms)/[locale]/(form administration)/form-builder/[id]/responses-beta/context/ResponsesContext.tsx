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
import { initCsv } from "../lib/csvWriter";
import { toast } from "../../../components/shared/Toast";
import { useTranslation } from "@root/i18n/client";
import { ErrorRetreivingSubmissions, TemplateFailed } from "../components/Toasts";
import { HTML_DOWNLOAD_FOLDER } from "../lib/constants";
import { ResponseDownloadLogger } from "../lib/logger";
import { useApiDebug } from "../lib/useApiDebug";
import { processResponse } from "../lib/processResponse";

import { importPrivateKeyDecrypt } from "../lib/utils";

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
  const loggerRef = useRef(new ResponseDownloadLogger());
  const logger = loggerRef.current;

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Abort any in-flight requests on unmount
      if (interruptRef.current) {
        interruptRef.current = false;
      }
    };
  }, []);

  // Enable dev console helpers for simulating API errors
  useApiDebug();

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
      logger.info("Error loading submissions:", error);
      setNewFormSubmissions([]);
      toast.error(<ErrorRetreivingSubmissions />, "wide");
      return [];
    }
  }, [apiClient, logger]);

  const resetNewSubmissions = () => {
    setNewFormSubmissions([]);
  };

  // const onInterrupt = () => {
  //   logger.info("Processing interrupted by user");
  //   setNewFormSubmissions([]);
  // }

  const processResponses = useCallback(
    async (initialSubmissions?: NewFormSubmission[]) => {
      logger.info("Beginning processing of form responses");

      // Reset interrupt state
      setInterrupt(false);

      let formId;
      let formTemplate;
      let csvFileHandle: FileSystemFileHandle | null = null;
      let htmlDirectoryHandle: FileSystemDirectoryHandle | null = null;
      let formResponses = [...(initialSubmissions || newFormSubmissions || [])];

      if (!directoryHandle || !privateApiKey || !apiClient) {
        logger.error("Missing required context values, aborting processing");
        return;
      }

      try {
        formTemplate = await apiClient.getFormTemplate();
        formId = apiClient.getFormId();
      } catch (error) {
        logger.error("Error loading form template: ", error);
        toast.error(<TemplateFailed />, "wide");
        return;
      }

      /**
       * Initialize CSV if needed
       */
      if (selectedFormat === "csv") {
        const result = await initCsv({ formId, dirHandle: directoryHandle, formTemplate });
        logger.info("Initialized CSV file: ", result.handle?.name);

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
        logger.info("Initialized HTML directory: ", htmlDirectoryHandle.name);
      }

      // Import decryption key once
      const decryptionKey = await importPrivateKeyDecrypt(privateApiKey.key);

      while (formResponses.length > 0 && !interruptRef.current) {
        for (const response of formResponses) {
          if (interruptRef.current) {
            logger.info("Processing interrupted by user");
            break;
          }

          logger.info(`Processing submission ID: ${response.name}`);

          try {
            // eslint-disable-next-line no-await-in-loop
            await processResponse({
              setProcessedSubmissionIds,
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
            });
          } catch (error) {
            setInterrupt(true);
            logger.info(`Error processing submission ID ${response.name}:`, error);
            toast.error(<ErrorRetreivingSubmissions />, "wide");
          }
        }

        if (interruptRef.current) {
          break;
        }

        // Get subsequent submissions
        // eslint-disable-next-line no-await-in-loop
        formResponses = await retrieveResponses();
      }

      // Cleanup
      interruptRef.current = false;

      setNewFormSubmissions(null);
      setProcessingCompleted(true);
    },
    [
      apiClient,
      directoryHandle,
      logger,
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
    setProcessedSubmissionIds(new Set());
    setProcessingCompleted(false);
    setSelectedFormat("csv");
    setInterrupt(false);
    interruptRef.current = false;
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
        interrupt: isProcessingInterrupted,
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
