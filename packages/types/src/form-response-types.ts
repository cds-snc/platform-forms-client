import { DateObject } from "./form-types";

export type Responses = {
  [key: string]: Response;
};

export type Response =
  | string
  | string[]
  | number
  | Record<string, unknown>[]
  | FileInputResponse
  | FileInputResponse[]
  | DateObject
  | Record<string, unknown>;

export type FileInputResponse = {
  name: string | null;
  size: number | null;
  content: ArrayBuffer | null;
};
