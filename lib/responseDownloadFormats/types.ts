import { SecurityAttribute } from "@lib/types";

export interface Answer {
  questionEn: string | undefined;
  questionFr: string | undefined;
  answer: string | Array<Answer[]>;
  [key: string]: string | Array<Answer[]> | undefined;
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
