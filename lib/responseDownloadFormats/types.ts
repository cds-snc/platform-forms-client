import { FormRecord } from "@gcforms/types";

export interface Answer {
  questionId: number;
  questionEn: string | undefined;
  questionFr: string | undefined;
  answer: string | Array<Answer[]>;
  [key: string]: string | number | Array<Answer[]> | undefined;
}

export interface Submission {
  id: string;
  createdAt: number;
  confirmationCode: string;
  answers: Answer[];
}

export interface ResponseAttachment {
  id: string;
  name: string;
  downloadLink: string;
  isPotentiallyMalicious: boolean;
}

export interface ResponseAttachmentGroup {
  responseId: string;
  attachments: ResponseAttachment[];
}

export interface FormResponseSubmissions {
  formRecord: FormRecord;
  submissions: Submission[];
}

export const ResponseDownloadErrorCode = {
  SIZE_LIMIT: "Download limit",
  PROCESSING: "PROCESSING",
} as const;
export type ResponseDownloadErrorCode =
  (typeof ResponseDownloadErrorCode)[keyof typeof ResponseDownloadErrorCode];

export type JSONValue = string | number | boolean | { [x: string]: JSONValue } | Array<JSONValue>;

export interface Translations {
  en: JSONValue;
  fr: JSONValue;
}

export const DownloadFormat = {
  HTML: "html",
  CSV: "csv",
  XLSX: "xlsx",
  JSON: "json",
  HTML_ZIPPED: "html-zipped",
  HTML_AGGREGATED: "html-aggregated",
} as const;
export type DownloadFormat = (typeof DownloadFormat)[keyof typeof DownloadFormat];

export type HtmlResponse = {
  id: string;
  created_at: number;
  html: string;
}[];

export type HtmlAggregatedResponse = string;

export type HtmlZippedResponse = {
  receipt: string;
  attachments?: ResponseAttachmentGroup[];
  responses: {
    id: string;
    created_at: number;
    html: string;
  }[];
};

export type CSVResponse = {
  receipt: string;
  responses: string;
  attachments?: ResponseAttachmentGroup[];
};
export type JSONResponse = {
  receipt: string;
  responses: object;
  attachments?: ResponseAttachmentGroup[];
};
