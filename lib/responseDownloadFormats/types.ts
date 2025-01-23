import { FormElement, SecurityAttribute } from "@lib/types";
import { FormRecord, GroupsType } from "packages/gcforms-types/src/form-types";

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

export interface Form {
  id: string;
  titleEn: string;
  titleFr: string;
  securityAttribute: SecurityAttribute;
  groups: GroupsType;
  layout: number[];
  elements: FormElement[];
}

export interface FormResponseSubmissions {
  formRecord: FormRecord;
  submissions: Submission[];
}

export type JSONValue = string | number | boolean | { [x: string]: JSONValue } | Array<JSONValue>;

export interface Translations {
  en: JSONValue;
  fr: JSONValue;
}

export enum DownloadFormat {
  HTML = "html",
  CSV = "csv",
  XLSX = "xlsx",
  JSON = "json",
  HTML_ZIPPED = "html-zipped",
  HTML_AGGREGATED = "html-aggregated",
}

export type HtmlResponse = {
  id: string;
  created_at: number;
  html: string;
}[];

export type HtmlAggregatedResponse = string;

export type HtmlZippedResponse = {
  receipt: string;
  responses: {
    id: string;
    created_at: number;
    html: string;
  }[];
};

export type CSVResponse = { receipt: string; responses: string };
export type JSONResponse = { receipt: string; responses: object };
