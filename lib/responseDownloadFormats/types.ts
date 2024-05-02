import { SecurityAttribute } from "@lib/types";

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
  [key: string]: string | Array<Answer[]> | undefined;
}

export interface FormResponseSubmissions {
  form: Form;
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
