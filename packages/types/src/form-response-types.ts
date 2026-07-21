import { DateObject } from "./form-types";

export type Responses = {
  [key: string]: Response;
};

export type ResponsesWithoutFileContent = {
  [key: string]: ResponseWithoutFileContent;
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

export type FileInputResponseWithContent = {
  id: string;
  name: string;
  size: number;
  content: ArrayBuffer;
};

export type FileInputResponseWithoutContent = {
  id: string;
  name: string | null;
  size: number | null;
};

type ResponseWithoutFileContent =
  | Exclude<Response, FileInputResponse | FileInputResponse[]>
  | FileInputResponseWithoutContent
  | FileInputResponseWithoutContent[];
