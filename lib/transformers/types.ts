export interface ResponseSubmission {
  id: string;
  created_at: number;
  confirmation_code: string;
  [key: string]: string | number;
}

export type JSONValue = string | number | boolean | { [x: string]: JSONValue } | Array<JSONValue>;

export interface Translations {
  en: JSONValue;
  fr: JSONValue;
}
