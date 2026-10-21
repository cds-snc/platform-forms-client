/*--------------------------------------------*
 * Framework and Third-Party
 *--------------------------------------------*/
import type { Dispatch, SetStateAction } from "react";
import type JSZip from "jszip";

/*--------------------------------------------*
 * Internal Aliases
 *--------------------------------------------*/
import type {
  CSVResponse,
  DownloadFormat,
  JSONResponse,
  ResponseDownloadErrorCode,
} from "@lib/responseDownloadFormats/types";
import type { Language } from "@lib/types/form-builder-types";

export type DownloadProgress =
  | { phase: "responses"; response: number; total: number }
  | {
      phase: "attachments";
      response: number;
      responseTotal: number;
      completed: number;
      total: number;
    }
  | { phase: "zip"; percent: number };

export type DownloadFailure = {
  code: ResponseDownloadErrorCode;
  responseId: string;
  filename?: string;
  reason: string;
};

export type DownloadWarnings = { sizeLimitReached: boolean; processingFailed: boolean };

export type SimpleDownloadFormat = Extract<DownloadFormat, "csv" | "json">;

export type SimpleResponse = CSVResponse | JSONResponse;

export type SimpleResponseByFormat = {
  [DownloadFormat.CSV]: CSVResponse;
  [DownloadFormat.JSON]: JSONResponse;
};

export type ArchiveAdapter<T> = {
  responseFileName: string;
  initialize: (response: SimpleResponse) => T;
  append: (current: T, response: SimpleResponse) => T;
  serialize: (content: T) => string;
};

export type DownloadFile = {
  name: string;
  content: string;
  contentType?: string;
};

export type ResponseFileConfig = {
  [Format in SimpleDownloadFormat]: {
    name: string;
    content: (response: SimpleResponseByFormat[Format]) => string;
    contentType?: string;
  };
};

export type DownloadResponsesOptions = {
  formId: string;
  format: DownloadFormat;
  language: Language;
  version: string | null;
  filteredIds: string[];
  filePrefix: string;
  shouldCreateZip: boolean;
  setDownloadProgress: (progress: DownloadProgress) => void;
  setIsDownloading: (isDownloading: boolean) => void;
  onDownloadComplete: (filteredIds: string[], warnings?: DownloadWarnings) => void;
  onClose: () => void;
};

export type AttachmentDownloadLinkRefresherOptions = {
  formId: string;
  format: DownloadFormat;
  language: Language;
  version: string | null;
};

export type GenerateDownloadZipOptions = {
  zip: JSZip;
  fileName: string;
  setDownloadProgress: (progress: DownloadProgress) => void;
};

export type DownloadDialogProps = {
  checkedItems: Map<string, boolean>;
  isDialogVisible: boolean;
  setIsDialogVisible: Dispatch<SetStateAction<boolean>>;
  setDownloadError: Dispatch<SetStateAction<boolean | string>>;
  formId: string;
  formName: string;
  onSuccessfulDownload: (filteredIds: string[], warnings?: DownloadWarnings) => void;
  responseDownloadLimit: number;
  checkedMeta?: { id?: string; name?: string; version?: string | number | null }[];
};
